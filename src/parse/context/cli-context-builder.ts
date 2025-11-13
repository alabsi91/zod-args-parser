import {
  decoupleFlags,
  findOption,
  findSubcommandDefinition,
  isFlagArgument,
  isOptionArgument,
  splitAndGetKeys,
  transformOptionToArgument,
} from "../parser-utilities.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Cli } from "../../types/definitions-types.ts";

/**
 * Parse argv and create a cli context
 *
 * @throws {Error}
 */
export function buildCliContext(argv: string[], cliDefinition: Cli) {
  const subcommandArray = cliDefinition.subcommands ?? [];
  const allSubcommands = new Set<string>(subcommandArray.flatMap(c => [c.name, ...(c.aliases || [])]));

  // decouple flags E.g. `-rf` -> `-r, -f`
  argv = decoupleFlags(argv);

  const context: ContextWide = {
    subcommand: undefined,
  };

  /** Get the current subcommand definition or cli definition if subcommand name is `undefined` object */
  const getCommandDefinition = () => findSubcommandDefinition(context.subcommand, cliDefinition);

  for (let index = 0; index < argv.length; index++) {
    const argvItem = argv[index];

    // * Subcommand check
    if (index === 0) {
      context.subcommand = allSubcommands.has(argvItem) ? argvItem : undefined;

      // First argument is a subcommand. Skip to the next argument
      if (context.subcommand) continue;
    }

    // * Option check

    const argumentAndValue = argvItem.split("=").filter(Boolean); // E.g --option=value -> ["--option", "value"]
    const argumentWithEquals = argvItem.includes("="); // E.g --option=value
    const [argument, keys] = splitAndGetKeys(argumentAndValue[0]); // E.g --option.foo.bar -> ["--option", ["foo", "bar"]]
    const optionWithKeys = keys.length > 0; // E.g --option.foo.bar
    const argumentValue: string | undefined = argumentAndValue[1];
    const isNegated = argument.startsWith("--no-");

    if (isOptionArgument(argument)) {
      if (isFlagArgument(argument) && argumentWithEquals) {
        throw new Error(`flag arguments cannot be assigned using "=": "${argvItem}"`);
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

      if (!optionWithKeys && context.options && optionName in context.options) {
        throw new Error(`duplicated option: "${argument}"`);
      }

      if (!optionDefinition._preparedType) {
        throw new Error(`internal error: missing prepared type for option "${optionName}"`);
      }

      const { schema, optional, defaultValue, coerceTo } = optionDefinition._preparedType;

      const nextArgument = argv[index + 1];

      let optionValue: string | boolean | undefined = argumentWithEquals ? argumentValue : nextArgument;

      const isBoolean = coerceTo === "boolean";

      if (isNegated && !isBoolean) {
        throw new Error(`cannot negate a non-boolean option: "${argument}"`);
      }

      // infer value for boolean options
      if (isBoolean) {
        if (!argumentWithEquals) {
          optionValue = "true";
        }

        if (isNegated && ["true", "false"].includes(optionValue.toLowerCase())) {
          optionValue = optionValue === "true" ? "false" : "true";
        }
      }

      if (optionValue === undefined) {
        throw new Error(`expected a value for "${argument}" but got nothing`);
      }

      // Next argument is an option while expecting a value: E.g `--option --option2`
      if (!argumentWithEquals && isOptionArgument(optionValue)) {
        throw new Error(`expected a value for "${argument}" but got an argument "${nextArgument}"`);
      }

      context.options ??= {};

      // Handle options with keys for type `object`
      // E.g. `--option.key.nested=value`
      if (optionWithKeys) {
        const previousObject = JSON.parse(context.options[optionName]?.stringValue || "{}") as Record<string, any>;

        let current = previousObject;
        for (let index = 0; index < keys.length; index++) {
          const key = keys[index];

          if (current[key] === undefined) {
            current[key] = {};
          }

          if (index === keys.length - 1) {
            current[key] = optionValue;
            continue;
          }

          current = current[key] as Record<string, any>;
        }

        optionValue = JSON.stringify(previousObject);
      }

      context.options[optionName] = {
        schema,
        optional,
        defaultValue,
        flag: argument,
        stringValue: optionValue,
        source: "terminal",
      };

      // Skip to the next argument if it is the current option's value.
      if (!argumentWithEquals && !isBoolean) {
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

      // The current argument is a typed argument and not a positional
      if (currentArgumentCount < argumentDefinitionEntries.length) {
        const [name, argumentDefinition] = argumentDefinitionEntries[currentArgumentCount];

        if (!argumentDefinition._preparedType) {
          throw new Error(`internal error: missing prepared type for argument "${currentArgumentCount}"`);
        }

        const { schema, optional, defaultValue } = argumentDefinition._preparedType;

        context.arguments[name] = { schema, optional, defaultValue, stringValue: argvItem, source: "terminal" };
        continue;
      }
    }

    // The current argument is a positional and not a typed argument (when `allowPositionals` is enabled)
    if (commandDefinition?.allowPositionals) {
      context.positionals ??= [];
      context.positionals.push(argvItem);
      continue;
    }

    if (!context.subcommand) {
      throw new Error(`unexpected argument "${argvItem}": positionals arguments are not allowed here`);
    }

    throw new Error(
      `unexpected argument "${argvItem}": positionals arguments are not allowed for subcommand "${context.subcommand}"`,
    );
  }

  const commandDefinition = getCommandDefinition();
  if (!commandDefinition) {
    throw new Error(`unknown subcommand: "${context.subcommand}"`);
  }

  // Options
  if (commandDefinition.options) {
    context.options ??= {};

    for (const [name, optionDefinition] of Object.entries(commandDefinition.options)) {
      // option already added to the context (found during argument parsing)
      if (name in context.options) continue;

      if (!optionDefinition._preparedType) {
        throw new Error(`internal error: missing prepared type for option "${name}"`);
      }

      const { schema, optional, defaultValue } = optionDefinition._preparedType;

      if (optional) {
        // optional without default value
        if (defaultValue === undefined) {
          continue;
        }

        // optional with default value
        context.options[name] = { schema, optional, defaultValue, source: "default" };
        continue;
      }

      // required option
      throw new Error(`missing required option: ${transformOptionToArgument(name)}`);
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
          // optional argument without default value
          if (defaultValue === undefined) {
            continue;
          }

          // optional argument with default value
          context.arguments[name] = { schema, optional, defaultValue, source: "default" };
          continue;
        }

        // required argument
        throw new Error(`The argument "${name}" is required`);
      }
    }
  }

  // make sure `positionals` is defined when `allowPositionals` is enabled
  if (commandDefinition.allowPositionals) {
    context.positionals ??= [];
  }

  return context;
}
