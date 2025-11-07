import { generateOrdinalSuffix } from "../utilities.ts";
import {
  decoupleFlags,
  findOption,
  findSubcommand,
  isFlagArgument,
  isOptionArgument,
  transformOptionToArgument,
} from "./parser-helpers.ts";

import type { Cli } from "../schemas/schema-types.ts";
import type { ContextWide } from "./context-types.ts";

/**
 * Parse argv and create a cli context
 *
 * @throws {Error}
 */
export function createCliContext(argv: string[], cli: Cli) {
  const subcommandArray = cli.subcommands ?? [];
  const allSubcommands = new Set<string>(subcommandArray.flatMap(c => [c.name, ...(c.aliases || [])]));

  // decouple flags E.g. `-rf` -> `-r, -f`
  argv = decoupleFlags(argv);

  const results: ContextWide = {
    subcommand: undefined,
  };

  /** Get the current subcommand object */
  const getSubcommandObject = () => findSubcommand(results.subcommand, cli);

  for (let index = 0; index < argv.length; index++) {
    const argument_ = argv[index];

    // * Subcommand check
    if (index === 0) {
      results.subcommand = allSubcommands.has(argument_) ? argument_ : undefined;

      // First argument is a subcommand. Skip to the next argument
      if (results.subcommand) continue;
    }

    // * Option check

    // Check for `--option=value` or `--option value`
    const argumentAndValue = argument_.split("=").filter(Boolean);
    const argumentWithEquals = argument_.includes("=");
    const argument = argumentAndValue[0];
    const argumentValue: string | undefined = argumentAndValue[1];

    if (isOptionArgument(argument)) {
      if (isFlagArgument(argument) && argumentWithEquals) {
        throw new Error(`Flag arguments cannot be assigned using "=": "${argument_}"`);
      }

      const subcommandObject = getSubcommandObject();
      if (!subcommandObject) {
        throw new Error(`Unknown subcommand: "${results.subcommand}"`);
      }

      if (!subcommandObject.options) {
        if (!results.subcommand) {
          throw new Error(`Error: options are not allowed here: "${argument}"`);
        }

        throw new Error(`Error: subcommand "${results.subcommand}" does not have options: "${argument}"`);
      }

      const nameOptionTuple = findOption(argument, subcommandObject.options);
      if (!nameOptionTuple) {
        throw new Error(`Unknown option: "${argument}"`);
      }

      const [optionName, option] = nameOptionTuple;

      if (results.options && optionName in results.options) {
        throw new Error(`Duplicated option: "${argument}"`);
      }

      if (!option._preparedType) {
        throw new Error(`Internal error: missing prepared type for option "${optionName}"`);
      }

      const { schema, optional, defaultValue, coerceTo } = option._preparedType;

      const nextArgument = argv[index + 1];

      let optionValue: string | boolean = argumentWithEquals ? argumentValue : nextArgument;

      // infer value for boolean options
      if (coerceTo === "boolean") {
        if (!argumentWithEquals) {
          optionValue = "true";
        }

        const isNegated = argument.startsWith("--no-");

        if (isNegated && ["true", "false"].includes(optionValue)) {
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
        throw new Error(`Expected a value for "${argument}" but got nothing`);
      }

      if (!argumentWithEquals && isOptionArgument(optionValue)) {
        throw new Error(`Expected a value for "${argument}" but got an argument "${nextArgument}"`);
      }

      results.options ??= {};
      results.options[optionName] = {
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

    const subcommandObject = getSubcommandObject();

    // * Arguments check
    if (subcommandObject?.arguments) {
      results.arguments ??= [];

      const currentArgumentCount = results.arguments.length;

      // Any extra arguments are possibly positionals
      if (currentArgumentCount < subcommandObject.arguments.length) {
        const schemaArgument = subcommandObject.arguments[currentArgumentCount];

        if (!schemaArgument._preparedType) {
          throw new Error(`Internal error: missing prepared type for argument "${currentArgumentCount}"`);
        }

        const { schema, optional, defaultValue } = schemaArgument._preparedType;

        results.arguments.push({
          schema,
          optional,
          defaultValue,
          stringValue: argument_,
          source: "terminal",
        });
        continue;
      }
    }

    // * Positional check
    if (subcommandObject?.allowPositionals) {
      results.positionals ??= [];
      results.positionals.push(argument_);
      continue;
    }

    // * Unexpected
    if (!results.subcommand) {
      throw new Error(`Unexpected argument "${argument_}": positionals arguments are not allowed here`);
    }

    throw new Error(
      `Unexpected argument "${argument_}": positionals arguments are not allowed for subcommand "${results.subcommand}"`,
    );
  }

  // * Check for missing options - set defaults - add `source`
  const subcommandObject = getSubcommandObject();
  if (!subcommandObject) {
    throw new Error(`Unknown subcommand: "${results.subcommand}"`);
  }

  // Options
  if (subcommandObject.options) {
    results.options ??= {};

    for (const [schemaOptionName, schemaOption] of Object.entries(subcommandObject.options)) {
      // option already exists
      if (results.options && schemaOptionName in results.options) continue;

      if (!schemaOption._preparedType) {
        throw new Error(`Internal error: missing prepared type for option "${schemaOptionName}"`);
      }

      const { schema, optional, defaultValue } = schemaOption._preparedType;

      if (optional) {
        if (defaultValue === undefined) {
          continue;
        }

        results.options[schemaOptionName] = {
          name: schemaOptionName,
          schema,
          optional,
          defaultValue,
          source: "default",
        };
        continue;
      }

      throw new Error(`Missing required option: ${transformOptionToArgument(schemaOptionName)}`);
    }
  }

  // Arguments
  if (subcommandObject.arguments) {
    results.arguments ??= [];

    const currentArgumentCount = results.arguments.length ?? 0;
    const subcommandArgumentCount = subcommandObject.arguments.length;

    // missing arguments
    if (currentArgumentCount < subcommandArgumentCount) {
      for (let index = currentArgumentCount; index < subcommandArgumentCount; index++) {
        const schemaArgument = subcommandObject.arguments[index];

        if (!schemaArgument._preparedType) {
          throw new Error(`Internal error: missing prepared type for argument "${index}"`);
        }

        const { schema, optional, defaultValue } = schemaArgument._preparedType;

        if (optional) {
          if (defaultValue === undefined) {
            continue;
          }

          if (!results.arguments) results.arguments = [];

          results.arguments.push({ schema, optional, defaultValue, source: "default" });
          continue;
        }

        throw new Error(`The ${generateOrdinalSuffix(index)} argument is required: ${schemaArgument.meta?.name ?? ""}`);
      }
    }
  }

  if (subcommandObject.allowPositionals) {
    results.positionals ??= [];
  }

  return results;
}
