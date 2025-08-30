import * as z from "zod/v4/core";

import * as help from "../help-message/print-help-message.js";
import { generateOrdinalSuffix, isFlagArg, isOptionArg, stringToBoolean, transformOptionToArg } from "../utils.js";
import { isBooleanSchema, isOptionalSchema, safeParseSchema, schemaDefaultValue } from "../zodUtils.js";
import { decoupleFlags, findOption, findSubcommand } from "./parser-helpers.js";

import type { Cli, NoSubcommand, PrintHelpOpt, Subcommand, UnSafeParseResult } from "../types.js";

type InfoEntry = { rawArg?: string; rawValue?: string; source: "cli" | "default" };

/** The return result object temporarily type. used inside the `parse` function */
type ResultsTempType = Record<string, unknown> & {
  subcommand: string | undefined;
  positional?: string[];
  arguments?: unknown[];
  _info?: Record<string, InfoEntry>;
  printCliHelp: (options?: PrintHelpOpt) => void;
  printSubcommandHelp: (subcommand: string, options?: PrintHelpOpt) => void;
};

export function parse<T extends Subcommand[], U extends Cli>(
  argv: string[],
  ...params: [U, ...T]
): UnSafeParseResult<[...T, NoSubcommand & U]> {
  const cliOptions = ("cliName" in params[0] ? params[0] : {}) as U;
  const subcommandArr = params as unknown as T;
  const allSubcommands = new Set<string>(subcommandArr.flatMap(c => [c.name, ...(c.aliases || [])]));

  argv = decoupleFlags(argv); // decouple flags E.g. `-rf` -> `-r, -f`

  const results: ResultsTempType = {
    subcommand: undefined,
    printCliHelp(opt) {
      help.printCliHelp(params, opt);
    },
    printSubcommandHelp(subCmdName, opt) {
      const subcommandObj = findSubcommand(subCmdName, subcommandArr);
      if (!subcommandObj) {
        console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
        return;
      }

      help.printSubcommandHelp(subcommandObj, opt, cliOptions.cliName);
    },
  };

  /** - Get current subcommand object */
  const getSubcommandObj = () => findSubcommand(results.subcommand, subcommandArr);

  /** - Append/create an option to the _info object */
  const createInfoEntry = (optionName: string, value?: Partial<InfoEntry>) => {
    if (!results._info) {
      results._info = {};
    }

    if (!results._info[optionName]) {
      results._info[optionName] = Object.create({});
    }

    if (value) {
      Object.assign(results._info[optionName], value);
    }
  };

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
        throw new Error(`Flag arguments cannot be assigned using "=": "${arg}"`);
      }

      const subcommandObj = getSubcommandObj();
      if (!subcommandObj) {
        throw new Error(`Unknown subcommand: "${results.subcommand}"`);
      }

      if (!subcommandObj.options) {
        if (!results.subcommand) {
          throw new Error(`Error: options are not allowed here: "${argument}"`);
        }

        throw new Error(`Error: subcommand "${results.subcommand}" does not allow options: "${argument}"`);
      }

      const option = findOption(argument, subcommandObj.options);
      if (!option) {
        throw new Error(`Unknown option: "${argument}"`);
      }

      if (option.name in results) {
        throw new Error(`Duplicated option: "${argument}"`);
      }

      const isTypeBoolean = isBooleanSchema(option.type);
      const isNegative = argument.startsWith("--no-");
      const nextArg = argv[i + 1];

      let optionValue: string | boolean = argWithEquals ? argValue : nextArg;

      // infer value for boolean options
      if (isTypeBoolean) {
        if (argWithEquals) {
          const parsedBoolean = stringToBoolean(argValue);
          optionValue = isNegative ? !parsedBoolean : parsedBoolean;
        } else {
          optionValue = !isNegative;
        }
      }

      if (typeof optionValue === "undefined") {
        throw new Error(`Expected a value for "${argument}" but got nothing`);
      }

      if (!argWithEquals && isOptionArg(optionValue)) {
        throw new Error(`Expected a value for "${argument}" but got an argument "${nextArg}"`);
      }

      const res = safeParseSchema(option.type, optionValue);
      if (!res.success) {
        throw new Error(`Invalid value "${optionValue}" for "${argument}": ${z.prettifyError(res.error)}`);
      }

      results[option.name] = res.data;
      createInfoEntry(option.name, {
        rawArg: argument,
        rawValue: argWithEquals ? argValue : isTypeBoolean ? "" : nextArg,
        ...option,
      });

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
        const argValue: string | boolean = isBooleanSchema(argType) ? stringToBoolean(arg) : arg;

        const res = safeParseSchema(argType, argValue);
        if (!res.success) {
          throw new Error(
            `The ${generateOrdinalSuffix(currentArgCount)} argument "${arg}" is invalid: ${z.prettifyError(res.error)}`,
          );
        }

        results.arguments.push(res.data);
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
      throw new Error(`Unexpected argument "${arg}": positional arguments are not allowed here`);
    }

    throw new Error(
      `Unexpected argument "${arg}": positional arguments are not allowed for subcommand "${results.subcommand}"`,
    );
  }

  // * Check for missing options - set defaults - add `source`
  const subcommandObj = getSubcommandObj();

  // Options
  if (subcommandObj?.options?.length) {
    for (const option of subcommandObj.options) {
      if (option.name in results) {
        createInfoEntry(option.name, { source: "cli", ...option });
        continue;
      }

      if (isOptionalSchema(option.type)) {
        const optionDefaultValue = schemaDefaultValue(option.type);
        if (optionDefaultValue === undefined) continue;

        results[option.name] = optionDefaultValue;
        createInfoEntry(option.name, { source: "default", ...option });
        continue;
      }

      throw new Error(`Missing required option: ${transformOptionToArg(option.name)}`);
    }
  }

  // Arguments
  if (subcommandObj?.arguments?.length) {
    const currentArgCount = results.arguments?.length ?? 0;
    const subcommandArgCount = subcommandObj.arguments.length;

    // missing arguments
    if (currentArgCount < subcommandArgCount) {
      for (let i = currentArgCount; i < subcommandArgCount; i++) {
        const argumentType = subcommandObj.arguments[i].type;
        const argumentDefaultValue = schemaDefaultValue(argumentType);

        if (argumentDefaultValue !== undefined && results.arguments) {
          results.arguments.push(argumentDefaultValue);
          continue;
        }

        if (isOptionalSchema(argumentType)) {
          continue;
        }

        throw new Error(`the ${generateOrdinalSuffix(i)} argument is required: "${subcommandObj.arguments[i].name}"`);
      }
    }
  }

  // Fire action
  if (subcommandObj?.action) {
    subcommandObj.action(results);
  }

  return results as UnSafeParseResult<[...T, NoSubcommand & U]>;
}
