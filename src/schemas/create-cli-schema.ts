import { formatCliHelpMessage, formatSubcommandHelpMessage } from "../help-message/format-cli.ts";
import { createExecuteContext } from "../parse/context/create-execute-context.ts";
import { safeParse, safeParseAsync } from "../parse/safe-parse.ts";
import { validate } from "../parse/validate/validate.ts";

import type { ActionsFunctionsWide, AttachedMethods, PrintHelpOptions, ValidateMethods } from "../types.ts";
import type { Argument, Cli, Option } from "./schema-types.ts";

export function createCli<T extends Cli>(
  input: {
    [K in keyof T]: K extends keyof Cli
      ? T[K] extends Record<string, Option>
        ? { [OptionName in keyof T[K]]: Option<T[K][OptionName]["type"]["schema"]> }
        : T[K] extends [Argument, ...Argument[]]
          ? {
              [ArgumentIndex in keyof T[K]]: T[K][ArgumentIndex] extends Argument
                ? Argument<T[K][ArgumentIndex]["type"]["schema"]>
                : T[K][ArgumentIndex];
            }
          : T[K]
      : never;
  } & Cli,
) {
  const cliSchema = input as T;

  const setAction: ActionsFunctionsWide["setAction"] = action => {
    cliSchema.action = action;
  };

  const execute: ActionsFunctionsWide["execute"] = inputValues => {
    inputValues ??= {};
    if (!cliSchema.action) throw new Error("Action is not defined");
    const context = createExecuteContext(inputValues, cliSchema);
    const validateResult = validate(context, cliSchema);
    cliSchema.action(validateResult);
  };

  // Add print methods for CLI schema and its subcommands
  const printMethods = {
    formatCliHelpMessage(options?: PrintHelpOptions) {
      return formatCliHelpMessage(cliSchema, options);
    },
    formatSubcommandHelpMessage(subcommandName: string, options?: PrintHelpOptions) {
      const foundSubcommand = cliSchema.subcommands?.find(s => s.name === subcommandName);
      if (!foundSubcommand) throw new Error(`Subcommand ${subcommandName} not found`);
      return formatSubcommandHelpMessage(foundSubcommand, options, cliSchema.cliName);
    },
  };

  Object.assign(cliSchema, printMethods);

  if (cliSchema.subcommands) {
    for (const subcommandSchema of cliSchema.subcommands) {
      Object.assign(subcommandSchema, printMethods);
    }
  }

  return Object.assign(cliSchema, {
    setAction,
    execute,
    validate: (stringOrArgv: string | string[]) => safeParse(stringOrArgv, cliSchema),
    validateAsync: (stringOrArgv: string | string[]) => safeParseAsync(stringOrArgv, cliSchema),
  }) as T & AttachedMethods<T> & ValidateMethods<T>;
}
