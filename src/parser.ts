import { help } from "./help.js";
import {
  decoupleFlags,
  getOrdinalPlacement,
  isBooleanSchema,
  isFlagArg,
  isOptionArg,
  noName,
  stringToBoolean,
  transformArg,
  transformOptionToArg,
} from "./utils.js";

import type {
  Cli,
  NoSubcommand,
  Option,
  PrintHelpOpt,
  SafeParseResult,
  Subcommand,
  UnSafeParseResult,
} from "./types.js";

export function parse<T extends Subcommand[]>(argsv: string[], ...params: T): UnSafeParseResult<T>;
export function parse<T extends Subcommand[], U extends Cli>(
  argsv: string[],
  ...params: [U, ...T]
): UnSafeParseResult<[...T, NoSubcommand & U]>;

export function parse<T extends Subcommand[], U extends Cli>(argsv: string[], ...params: [U, ...T]) {
  const cliOptions = ("cliName" in params[0] ? params[0] : {}) as U;
  const subcommandArr = params as unknown as T;
  const allSubcommands = new Set<string>(subcommandArr.flatMap(c => [c.name, ...(c.aliases || [])]));

  // decouple flags E.g. `-rf` -> `-r, -f`
  argsv = decoupleFlags(argsv);

  type ResultObj = Record<string, unknown> & {
    subcommand: string | undefined;
    positional?: string[];
    arguments?: unknown[];
    _info?: Record<string, { rawArg?: string; rawValue?: string; source: "cli" | "default" }>;
    printCliHelp: (options?: PrintHelpOpt) => void;
    printSubcommandHelp: (subcommand: any, options?: PrintHelpOpt) => void;
  };

  const results: ResultObj = {
    subcommand: undefined,
    printCliHelp(opt) {
      help.printCliHelp(params, opt);
    },
    printSubcommandHelp(subcommandStr, opt) {
      const subcommand = subcommandArr.find(c => {
        if (c.name === subcommandStr) return true;
        if (!subcommandStr) return false;
        if (!c.aliases?.length) return false;
        return c.aliases.includes(subcommandStr);
      });
      if (!subcommand) return console.error(`Cannot print help for subcommand "${subcommandStr}" as it does not exist`);
      help.printSubcommandHelp(subcommand, opt, cliOptions.cliName);
    },
  };

  /** - Get current subcommand props */
  const GetSubcommandProps = (cmd = results.subcommand) => {
    return subcommandArr.find(c => {
      if (c.name === cmd) return true;
      if (!cmd) return false;
      if (!c.aliases?.length) return false;
      return c.aliases.includes(cmd);
    });
  };

  const addRawArg = (optionName: string, rawArg: string) => {
    if (!results._info) results._info = {};
    if (!results._info[optionName]) results._info[optionName] = Object.create({});
    results._info[optionName].rawArg = rawArg;
  };

  const addRawValue = (optionName: string, rawValue: string) => {
    if (!results._info) results._info = {};
    if (!results._info[optionName]) results._info[optionName] = Object.create({});
    results._info[optionName].rawValue = rawValue;
  };

  const addSource = (optionName: string, source: "cli" | "default") => {
    if (!results._info) results._info = {};
    if (!results._info[optionName]) results._info[optionName] = Object.create({});
    results._info[optionName].source = source;
  };

  const fillOption = (optionName: string, value: Option) => {
    if (!results._info) results._info = {};
    if (!results._info[optionName]) results._info[optionName] = Object.create({});
    Object.assign(results._info[optionName], value);
  };

  for (let i = 0; i < argsv.length; i++) {
    const arg = argsv[i];

    // * subcommand
    if (i === 0) {
      results.subcommand = allSubcommands.has(arg) ? arg : undefined;

      // add positional and arguments array
      const subcommandProps = GetSubcommandProps();
      if (subcommandProps?.allowPositional) results.positional = [];
      if (subcommandProps?.arguments?.length) results.arguments = [];

      if (results.subcommand) continue;
    }

    // * option
    const argAndValue = arg.split("=").filter(Boolean);
    const argWithEquals = arg.includes("=");
    const argument = argAndValue[0];
    const argValue: string | undefined = argAndValue[1];

    if (isOptionArg(argument)) {
      if (isFlagArg(argument) && argWithEquals) {
        throw new Error(`Flag arguments cannot be assigned using "=": "${arg}"`);
      }

      const subcommandProps = GetSubcommandProps();
      if (!subcommandProps) throw new Error(`Unknown subcommand: "${results.subcommand}"`);

      if (!subcommandProps.options) {
        const msg = !results.subcommand
          ? "options are not allowed here"
          : `subcommand "${results.subcommand}" does not allow options`;
        throw new Error(`Error: ${msg}: "${argument}"`);
      }

      const optionName = transformArg(argument);
      const isNegative = argument.startsWith("--no-");

      const option = subcommandProps.options.find(o => {
        if (o.name === optionName) return true;
        if (isNegative && noName(o.name) === optionName) return true;

        if (!o.aliases) return false;
        if (o.aliases.includes(optionName)) return true;
        if (isNegative && o.aliases.map(noName).includes(optionName)) return true;

        return false;
      });

      if (!option) {
        throw new Error(`Unknown option: "${argument}"`);
      }

      if (option.name in results) {
        throw new Error(`Duplicated option: "${argument}"`);
      }

      const isTypeBoolean = isBooleanSchema(option.type);
      const nextArg = argsv[i + 1];

      let optionValue: string | boolean = argWithEquals ? argValue : nextArg;

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

      const res = option.type.safeParse(optionValue);
      if (!res.success) {
        throw new Error(`Invalid value "${optionValue}" for "${argument}": ${res.error.errors[0].message}`);
      }

      results[option.name] = res.data;
      addRawArg(option.name, argument);
      const rawVal = argWithEquals ? argValue : isTypeBoolean ? "" : nextArg;
      addRawValue(option.name, rawVal);
      fillOption(option.name, option);

      if (!argWithEquals && !isTypeBoolean) i++;
      continue;
    }

    const subcommandProps = GetSubcommandProps();

    // * arguments
    if (subcommandProps?.arguments?.length) {
      if (!results.arguments) results.arguments = [];

      const currentArgCount = results.arguments.length;

      if (currentArgCount < subcommandProps.arguments.length) {
        const argType = subcommandProps.arguments[currentArgCount].type;

        let argValue: string | boolean = arg;
        const isTypeBoolean = isBooleanSchema(argType);
        if (isTypeBoolean) argValue = stringToBoolean(argValue);

        const res = argType.safeParse(argValue);
        if (!res.success) {
          throw new Error(
            `The ${getOrdinalPlacement(currentArgCount)} argument "${arg}" is invalid: ${res.error.errors[0].message}`,
          );
        }

        results.arguments.push(res.data);
        continue;
      }
    }

    // * positional
    if (subcommandProps?.allowPositional) {
      if (!results.positional) results.positional = [];
      results.positional.push(arg);
      continue;
    }

    const msg = !results.subcommand ? "here" : `for subcommand "${results.subcommand}"`;
    throw new Error(`Unexpected argument "${arg}": positional arguments are not allowed ${msg}`);
  }

  // check for missing options - set defaults - add _source
  const subcommandProps = GetSubcommandProps();
  if (subcommandProps?.options?.length) {
    for (const option of subcommandProps.options) {
      if (option.name in results) {
        addSource(option.name, "cli");
        fillOption(option.name, option);
        continue;
      }

      if (option.type.isOptional()) {
        const hasDefault = typeof option.type._def.defaultValue === "function";
        if (!hasDefault) continue;
        results[option.name] = option.type._def.defaultValue();
        addSource(option.name, "default");
        fillOption(option.name, option);
        continue;
      }

      throw new Error(`Missing required option: ${transformOptionToArg(option.name)}`);
    }
  }

  // check for arguments - set defaults
  if (subcommandProps?.arguments?.length) {
    const currentArgCount = results.arguments?.length ?? 0;
    const subcommandArgCount = subcommandProps.arguments.length;

    // missing arguments
    if (currentArgCount < subcommandArgCount) {
      for (let i = currentArgCount; i < subcommandArgCount; i++) {
        const argumentType = subcommandProps.arguments[i].type;
        const hasDefault = typeof argumentType._def.defaultValue === "function";
        if (hasDefault && results.arguments) {
          results.arguments.push(argumentType._def.defaultValue());
          continue;
        }

        if (argumentType.isOptional()) continue;

        throw new Error(`the ${getOrdinalPlacement(i)} argument is required: "${subcommandProps.arguments[i].name}"`);
      }
    }
  }

  if (subcommandProps?.action) {
    subcommandProps.action(results);
  }

  return results as UnSafeParseResult<[...T, NoSubcommand & U]>;
}

export function safeParse<T extends Subcommand[]>(argsv: string[], ...params: T): SafeParseResult<T>;
export function safeParse<T extends Subcommand[], U extends Cli>(
  argsv: string[],
  ...params: [U, ...T]
): SafeParseResult<[...T, NoSubcommand & U]>;

export function safeParse<T extends Subcommand[], U extends Cli>(argsv: string[], ...params: [U, ...T]) {
  const cliOptions = ("cliName" in params[0] ? params[0] : {}) as U;
  const subcommandArr = params as Subcommand[];

  const printCliHelp = (opt?: PrintHelpOpt) => help.printCliHelp(params, opt);
  const printSubcommandHelp = (subcommandStr: NonNullable<T[number]["name"]>, opt?: PrintHelpOpt) => {
    const subcommand = subcommandArr.find(c => c.name === subcommandStr);
    if (!subcommand) return console.error(`Cannot print help for subcommand "${subcommandStr}" as it does not exist`);
    help.printSubcommandHelp(subcommand, opt, cliOptions.cliName);
  };

  try {
    const data = parse(argsv, ...params);
    // @ts-expect-error error
    delete data.printCliHelp;
    // @ts-expect-error error
    delete data.printSubcommandHelp;

    return {
      success: true,
      data: data as Omit<typeof data, "printCliHelp" | "printSubcommandHelp">,
      printCliHelp,
      printSubcommandHelp,
    };
  } catch (e) {
    return { success: false, error: e as Error, printCliHelp, printSubcommandHelp };
  }
}
