import {
  decoupleFlags,
  findOption,
  findSubcommandDefinition,
  isFlagArgument,
  isOptionArgument,
  transformOptionToArgument,
} from "./parser-helpers.ts";

import type { ContextWide } from "../types/context-types.ts";
import type { Cli } from "../types/definitions-types.ts";

/**
 * Parse argv and create a cli context
 *
 * @throws {Error}
 */
export function createCliContext(argv: string[], cliDefinition: Cli) {
  const subcommandArray = cliDefinition.subcommands ?? [];
  const allSubcommands = new Set<string>(subcommandArray.flatMap(c => [c.name, ...(c.aliases || [])]));

  // decouple flags E.g. `-rf` -> `-r, -f`
  argv = decoupleFlags(argv);

  const context: ContextWide = {
    subcommand: undefined,
  };

  /** Get the current subcommand object */
  const getCommandDefinition = () => findSubcommandDefinition(context.subcommand, cliDefinition);

  for (let index = 0; index < argv.length; index++) {
    const argument_ = argv[index];

    // * Subcommand check
    if (index === 0) {
      context.subcommand = allSubcommands.has(argument_) ? argument_ : undefined;

      // First argument is a subcommand. Skip to the next argument
      if (context.subcommand) continue;
    }

    // * Option check

    // Check for `--option=value` or `--option value`
    const argumentAndValue = argument_.split("=").filter(Boolean);
    const argumentWithEquals = argument_.includes("=");
    const argument = argumentAndValue[0];
    const argumentValue: string | undefined = argumentAndValue[1];

    if (isOptionArgument(argument)) {
      if (isFlagArgument(argument) && argumentWithEquals) {
        throw new Error(`flag arguments cannot be assigned using "=": "${argument_}"`);
      }

      const commandDefinition = getCommandDefinition();
      if (!commandDefinition) {
        throw new Error(`unknown subcommand: "${context.subcommand}"`);
      }

      if (!commandDefinition.options) {
        if (!context.subcommand) {
          throw new Error(`options are not allowed here: "${argument}"`);
        }

        throw new Error(`subcommand "${context.subcommand}" does not accept options: "${argument}"`);
      }

      const nameOptionTuple = findOption(argument, commandDefinition.options);
      if (!nameOptionTuple) {
        throw new Error(`unknown option: "${argument}"`);
      }

      const [optionName, optionDefinition] = nameOptionTuple;

      if (context.options && optionName in context.options) {
        throw new Error(`duplicated option: "${argument}"`);
      }

      if (!optionDefinition._preparedType) {
        throw new Error(`internal error: missing prepared type for option "${optionName}"`);
      }

      const { schema, optional, defaultValue, coerceTo } = optionDefinition._preparedType;

      const nextArgument = argv[index + 1];

      let optionValue: string | boolean = argumentWithEquals ? argumentValue : nextArgument;

      // infer value for boolean options
      if (coerceTo === "boolean") {
        if (!argumentWithEquals) {
          optionValue = "true";
        }

        const isNegated = argument.startsWith("--no-");

        if (isNegated && ["true", "false"].includes(optionValue.toLowerCase())) {
          optionValue = optionValue === "true" ? "false" : "true";
        }
      }

      // ? If the option is a string but no value was provided (e.g. user typed `--option` only):
      // ? We have 3 choices:
      // ?  1) Throw an error because the value is missing.
      // ?  2) Treat it as an empty string ("") and let the schema validator validate it.
      // ?  3) Leave it undefined without throwing an error.
      // ? Analogy: it's like a form asking for your name. If the user leaves it blank,
      // ? do we reject the form immediately, or send it to validation and let the validator decide?
      if (optionValue === undefined) {
        throw new Error(`expected a value for "${argument}" but got nothing`);
      }

      if (!argumentWithEquals && isOptionArgument(optionValue)) {
        throw new Error(`expected a value for "${argument}" but got an argument "${nextArgument}"`);
      }

      context.options ??= {};
      context.options[optionName] = {
        name: optionName,
        schema,
        optional,
        defaultValue,
        flag: argument,
        stringValue: optionValue,
        source: "terminal",
      };

      // Skip to the next argument if it is the current option’s value.
      if (!argumentWithEquals && coerceTo !== "boolean") {
        index++;
      }

      continue;
    }

    const commandDefinition = getCommandDefinition();

    // * Arguments check
    if (commandDefinition?.arguments) {
      context.arguments ??= {};

      const currentArgumentCount = Object.keys(context.arguments).length;
      const argumentDefinitionEntries = Object.entries(commandDefinition.arguments);

      // Any extra arguments are possibly positionals
      if (currentArgumentCount < argumentDefinitionEntries.length) {
        const [name, argumentDefinition] = argumentDefinitionEntries[currentArgumentCount];

        if (!argumentDefinition._preparedType) {
          throw new Error(`internal error: missing prepared type for argument "${currentArgumentCount}"`);
        }

        const { schema, optional, defaultValue } = argumentDefinition._preparedType;

        context.arguments[name] = {
          name,
          schema,
          optional,
          defaultValue,
          stringValue: argument_,
          source: "terminal",
        };
        continue;
      }
    }

    // * Positional check
    if (commandDefinition?.allowPositionals) {
      context.positionals ??= [];
      context.positionals.push(argument_);
      continue;
    }

    if (!context.subcommand) {
      throw new Error(`unexpected argument "${argument_}": positionals arguments are not allowed here`);
    }

    throw new Error(
      `unexpected argument "${argument_}": positionals arguments are not allowed for subcommand "${context.subcommand}"`,
    );
  }

  // * Check for missing options
  const commandDefinition = getCommandDefinition();
  if (!commandDefinition) {
    throw new Error(`unknown subcommand: "${context.subcommand}"`);
  }

  // Options
  if (commandDefinition.options) {
    context.options ??= {};

    for (const [schemaOptionName, optionDefinition] of Object.entries(commandDefinition.options)) {
      // option already exists
      if (schemaOptionName in context.options) continue;

      if (!optionDefinition._preparedType) {
        throw new Error(`internal error: missing prepared type for option "${schemaOptionName}"`);
      }

      const { schema, optional, defaultValue } = optionDefinition._preparedType;

      if (optional) {
        if (defaultValue === undefined) {
          continue;
        }

        context.options[schemaOptionName] = {
          name: schemaOptionName,
          schema,
          optional,
          defaultValue,
          source: "default",
        };
        continue;
      }

      throw new Error(`missing required option: ${transformOptionToArgument(schemaOptionName)}`);
    }
  }

  // Arguments
  if (commandDefinition.arguments) {
    context.arguments ??= {};

    const currentArgumentCount = Object.keys(context.arguments).length;

    const argumentDefinitionEntries = Object.entries(commandDefinition.arguments);
    const argumentsDefinitionLength = argumentDefinitionEntries.length;

    // missing arguments
    if (currentArgumentCount < argumentsDefinitionLength) {
      for (let index = currentArgumentCount; index < argumentsDefinitionLength; index++) {
        const [name, argumentDefinition] = argumentDefinitionEntries[index];

        if (!argumentDefinition._preparedType) {
          throw new Error(`internal error: missing prepared type for the argument "${name}"`);
        }

        const { schema, optional, defaultValue } = argumentDefinition._preparedType;

        if (optional) {
          if (defaultValue === undefined) {
            continue;
          }

          context.arguments ??= {};
          context.arguments[name] = { name, schema, optional, defaultValue, source: "default" };
          continue;
        }

        throw new Error(`The argument "${name}" is required`);
      }
    }
  }

  if (commandDefinition.allowPositionals) {
    context.positionals ??= [];
  }

  return context;
}
