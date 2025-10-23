import { generateOrdinalSuffix } from "../../utilities.js";
import { isBooleanSchema, isOptionalSchema, schemaDefaultValue } from "../../zod-utilities.js";
import {
  decoupleFlags,
  findOption,
  findSubcommand,
  isFlagArgument,
  isOptionArgument,
  transformOptionToArgument,
} from "./parser-helpers.js";

import type { Cli, Subcommand } from "../../types.js";
import type { ParsedContext } from "./parse-types.js";

export function parse(argv: string[], ...parameters: [Cli, ...Subcommand[]]) {
  const subcommandArray = parameters as Subcommand[];
  const allSubcommands = new Set<string>(subcommandArray.flatMap(c => [c.name, ...(c.aliases || [])]));

  argv = decoupleFlags(argv); // decouple flags E.g. `-rf` -> `-r, -f`

  const results: ParsedContext = {
    subcommand: undefined,
    options: {},
  };

  /** - Get current subcommand object */
  const getSubcommandObject = () => findSubcommand(results.subcommand, subcommandArray);

  for (let index = 0; index < argv.length; index++) {
    const argument_ = argv[index];

    // * Subcommand check
    if (index === 0) {
      results.subcommand = allSubcommands.has(argument_) ? argument_ : undefined;

      // add positional and arguments arrays
      const subcommandObject = getSubcommandObject();
      if (subcommandObject && subcommandObject.allowPositional) {
        results.positional = [];
      }

      if (subcommandObject && subcommandObject.arguments?.length) {
        results.arguments = [];
      }

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
        throw new Error(`Flag arguments cannot be assigned using "=": "${argument_}"`, { cause: "zod-args-parser" });
      }

      const subcommandObject = getSubcommandObject();
      if (!subcommandObject) {
        throw new Error(`Unknown subcommand: "${results.subcommand}"`, { cause: "zod-args-parser" });
      }

      if (!subcommandObject.options) {
        if (!results.subcommand) {
          throw new Error(`Error: options are not allowed here: "${argument}"`, { cause: "zod-args-parser" });
        }

        throw new Error(`Error: subcommand "${results.subcommand}" does not allow options: "${argument}"`, {
          cause: "zod-args-parser",
        });
      }

      const option = findOption(argument, subcommandObject.options);
      if (!option) {
        throw new Error(`Unknown option: "${argument}"`, { cause: "zod-args-parser" });
      }

      if (option.name in results.options) {
        throw new Error(`Duplicated option: "${argument}"`, { cause: "zod-args-parser" });
      }

      const isTypeBoolean = isBooleanSchema(option.type);
      const nextArgument = argv[index + 1];

      let optionValue: string | boolean = argumentWithEquals ? argumentValue : nextArgument;

      // infer value for boolean options
      if (isTypeBoolean && !argumentWithEquals) {
        optionValue = "true";
      }

      if (optionValue === undefined) {
        throw new Error(`Expected a value for "${argument}" but got nothing`, { cause: "zod-args-parser" });
      }

      if (!argumentWithEquals && isOptionArgument(optionValue)) {
        throw new Error(`Expected a value for "${argument}" but got an argument "${nextArgument}"`, {
          cause: "zod-args-parser",
        });
      }

      results.options[option.name] = {
        name: option.name,
        schema: option.type,
        flag: argument,
        rawValue: optionValue.toString(),
        source: "cli",
      };

      // Skip to the next argument if it is the current option’s value.
      if (!argumentWithEquals && !isTypeBoolean) {
        index++;
      }

      continue;
    }

    const subcommandObject = getSubcommandObject();

    // * Arguments check
    if (subcommandObject?.arguments?.length) {
      if (!results.arguments) {
        results.arguments = [];
      }

      const currentArgumentCount = results.arguments.length;

      // Any extra arguments are possibly positional
      if (currentArgumentCount < subcommandObject.arguments.length) {
        const argumentType = subcommandObject.arguments[currentArgumentCount].type;
        results.arguments.push({
          schema: argumentType,
          rawValue: argument_,
          source: "cli",
        });
        continue;
      }
    }

    // * Positional check
    if (subcommandObject?.allowPositional) {
      if (!results.positional) {
        results.positional = [];
      }

      results.positional.push(argument_);
      continue;
    }

    // * Unexpected
    if (!results.subcommand) {
      throw new Error(`Unexpected argument "${argument_}": positional arguments are not allowed here`, {
        cause: "zod-args-parser",
      });
    }

    throw new Error(
      `Unexpected argument "${argument_}": positional arguments are not allowed for subcommand "${results.subcommand}"`,
      { cause: "zod-args-parser" },
    );
  }

  // * Check for missing options - set defaults - add `source`
  const subcommandObject = getSubcommandObject();
  if (!subcommandObject) {
    throw new Error(`Unknown subcommand: "${results.subcommand}"`, { cause: "zod-args-parser" });
  }

  // Options
  if (subcommandObject.options?.length) {
    for (const option of subcommandObject.options) {
      // option already exists
      if (option.name in results.options) continue;

      const optional = isOptionalSchema(option.type);
      const defaultValue = schemaDefaultValue(option.type);

      if (optional) {
        if (defaultValue === undefined) {
          continue;
        }

        results.options[option.name] = { name: option.name, schema: option.type, source: "default" };
        continue;
      }

      throw new Error(`Missing required option: ${transformOptionToArgument(option.name)}`, {
        cause: "zod-args-parser",
      });
    }
  }

  // Arguments
  if (subcommandObject.arguments?.length) {
    const currentArgumentCount = results.arguments?.length ?? 0;
    const subcommandArgumentCount = subcommandObject.arguments.length;

    // missing arguments
    if (currentArgumentCount < subcommandArgumentCount) {
      for (let index = currentArgumentCount; index < subcommandArgumentCount; index++) {
        const argumentType = subcommandObject.arguments[index].type;
        const optional = isOptionalSchema(argumentType);
        const defaultValue = schemaDefaultValue(argumentType);

        if (optional) {
          if (defaultValue === undefined) {
            continue;
          }

          if (!results.arguments) results.arguments = [];

          results.arguments.push({ schema: argumentType, source: "default" });
          continue;
        }

        throw new Error(
          `the ${generateOrdinalSuffix(index)} argument is required: "${subcommandObject.arguments[index].name}"`,
          { cause: "zod-args-parser" },
        );
      }
    }
  }

  return results;
}
