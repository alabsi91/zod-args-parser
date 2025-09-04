import { generateOrdinalSuffix } from "../../utils.js";
import { isBooleanSchema, isOptionalSchema, schemaDefaultValue } from "../../zod-utils.js";
import {
  decoupleFlags,
  findOption,
  findSubcommand,
  isFlagArg,
  isOptionArg,
  transformOptionToArg,
} from "./parser-helpers.js";

import type { Cli, Subcommand } from "../../types.js";
import type { ParseCtx } from "./parse-types.js";

export function parse(argv: string[], ...params: [Cli, ...Subcommand[]]) {
  const subcommandArr = params as Subcommand[];
  const allSubcommands = new Set<string>(subcommandArr.flatMap(c => [c.name, ...(c.aliases || [])]));

  argv = decoupleFlags(argv); // decouple flags E.g. `-rf` -> `-r, -f`

  const results: ParseCtx = {
    subcommand: undefined,
    options: {},
  };

  /** - Get current subcommand object */
  const getSubcommandObj = () => findSubcommand(results.subcommand, subcommandArr);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    // * Subcommand check
    if (i === 0) {
      results.subcommand = allSubcommands.has(arg) ? arg : undefined;

      // add positional and arguments arrays
      const subcommandObj = getSubcommandObj();
      if (subcommandObj && subcommandObj.allowPositional) {
        results.positional = [];
      }

      if (subcommandObj && subcommandObj.arguments?.length) {
        results.arguments = [];
      }

      // First argument is a subcommand. Skip to the next argument
      if (results.subcommand) continue;
    }

    // * Option check

    // Check for `--option=value` or `--option value`
    const argAndValue = arg.split("=").filter(Boolean);
    const argWithEquals = arg.includes("=");
    const argument = argAndValue[0];
    const argValue: string | undefined = argAndValue[1];

    if (isOptionArg(argument)) {
      if (isFlagArg(argument) && argWithEquals) {
        throw new Error(`Flag arguments cannot be assigned using "=": "${arg}"`, { cause: "zod-args-parser" });
      }

      const subcommandObj = getSubcommandObj();
      if (!subcommandObj) {
        throw new Error(`Unknown subcommand: "${results.subcommand}"`, { cause: "zod-args-parser" });
      }

      if (!subcommandObj.options) {
        if (!results.subcommand) {
          throw new Error(`Error: options are not allowed here: "${argument}"`, { cause: "zod-args-parser" });
        }

        throw new Error(`Error: subcommand "${results.subcommand}" does not allow options: "${argument}"`, {
          cause: "zod-args-parser",
        });
      }

      const option = findOption(argument, subcommandObj.options);
      if (!option) {
        throw new Error(`Unknown option: "${argument}"`, { cause: "zod-args-parser" });
      }

      if (option.name in results.options) {
        throw new Error(`Duplicated option: "${argument}"`, { cause: "zod-args-parser" });
      }

      const isTypeBoolean = isBooleanSchema(option.type);
      const nextArg = argv[i + 1];

      let optionValue: string | boolean = argWithEquals ? argValue : nextArg;

      // infer value for boolean options
      if (isTypeBoolean && !argWithEquals) {
        optionValue = "true";
      }

      if (typeof optionValue === "undefined") {
        throw new Error(`Expected a value for "${argument}" but got nothing`, { cause: "zod-args-parser" });
      }

      if (!argWithEquals && isOptionArg(optionValue)) {
        throw new Error(`Expected a value for "${argument}" but got an argument "${nextArg}"`, {
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
      if (!argWithEquals && !isTypeBoolean) {
        i++;
      }

      continue;
    }

    const subcommandObj = getSubcommandObj();

    // * Arguments check
    if (subcommandObj?.arguments?.length) {
      if (!results.arguments) {
        results.arguments = [];
      }

      const currentArgCount = results.arguments.length;

      // Any extra arguments are possibly positional
      if (currentArgCount < subcommandObj.arguments.length) {
        const argType = subcommandObj.arguments[currentArgCount].type;
        results.arguments.push({
          schema: argType,
          rawValue: arg,
          source: "cli",
        });
        continue;
      }
    }

    // * Positional check
    if (subcommandObj?.allowPositional) {
      if (!results.positional) {
        results.positional = [];
      }

      results.positional.push(arg);
      continue;
    }

    // * Unexpected
    if (!results.subcommand) {
      throw new Error(`Unexpected argument "${arg}": positional arguments are not allowed here`, {
        cause: "zod-args-parser",
      });
    }

    throw new Error(
      `Unexpected argument "${arg}": positional arguments are not allowed for subcommand "${results.subcommand}"`,
      { cause: "zod-args-parser" },
    );
  }

  // * Check for missing options - set defaults - add `source`
  const subcommandObj = getSubcommandObj();
  if (!subcommandObj) {
    throw new Error(`Unknown subcommand: "${results.subcommand}"`, { cause: "zod-args-parser" });
  }

  // Options
  if (subcommandObj.options?.length) {
    for (const option of subcommandObj.options) {
      // option already exists
      if (option.name in results.options) continue;

      const optional = isOptionalSchema(option.type);
      const defaultValue = schemaDefaultValue(option.type);

      if (optional) {
        if (typeof defaultValue === "undefined") {
          continue;
        }

        results.options[option.name] = { name: option.name, schema: option.type, source: "default" };
        continue;
      }

      throw new Error(`Missing required option: ${transformOptionToArg(option.name)}`, { cause: "zod-args-parser" });
    }
  }

  // Arguments
  if (subcommandObj.arguments?.length) {
    const currentArgCount = results.arguments?.length ?? 0;
    const subcommandArgCount = subcommandObj.arguments.length;

    // missing arguments
    if (currentArgCount < subcommandArgCount) {
      for (let i = currentArgCount; i < subcommandArgCount; i++) {
        const argumentType = subcommandObj.arguments[i].type;
        const optional = isOptionalSchema(argumentType);
        const defaultValue = schemaDefaultValue(argumentType);

        if (optional) {
          if (typeof defaultValue === "undefined") {
            continue;
          }

          if (!results.arguments) results.arguments = [];

          results.arguments.push({ schema: argumentType, source: "default" });
          continue;
        }

        throw new Error(`the ${generateOrdinalSuffix(i)} argument is required: "${subcommandObj.arguments[i].name}"`, {
          cause: "zod-args-parser",
        });
      }
    }
  }

  return results;
}
