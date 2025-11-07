import { formatCliHelpMessage, formatSubcommandHelpMessage } from "../help-message/format-cli.ts";
import { createExecuteContext } from "../parse/create-execute-context.ts";
import { safeParse, safeParseAsync } from "../parse/safe-parse.ts";
import { validate } from "../parse/validate-context/validate-context.ts";
import { prepareArgumentsTypes, prepareOptionsTypes } from "../utilities.ts";

import type { Argument, Cli, Option, Subcommand } from "../types/definitions-types.ts";
import type { PrintHelpOptions } from "../types/help-message-types.ts";
import type { AttachedMethods, AttachedMethodsWide, ValidateMethods } from "../types/types.ts";
import type { Prettify } from "../types/utilities-types.ts";

type OptionsInput<T extends Record<string, Option>> = {
  [OptionName in keyof T]: Option<T[OptionName]["type"]>;
};

type ArgumentsInput<T extends [Argument, ...Argument[]]> = {
  [ArgumentIndex in keyof T]: Argument<T[ArgumentIndex]["type"]>;
};

type SubcommandsInput<T extends readonly [Subcommand, ...Subcommand[]]> = {
  [SubcommandIndex in keyof T]: {
    [K in keyof T[SubcommandIndex]]: T[SubcommandIndex][K] extends Record<string, Option>
      ? OptionsInput<T[SubcommandIndex][K]>
      : T[SubcommandIndex][K] extends [Argument, ...Argument[]]
        ? ArgumentsInput<T[SubcommandIndex][K]>
        : T[SubcommandIndex][K];
  } & Subcommand;
};

// This will prevent extra keys and enable jsdoc on hover
type CliInput<T extends Cli> = {
  [K in keyof T]: K extends keyof Cli
    ? T[K] extends readonly [Subcommand, ...Subcommand[]]
      ? SubcommandsInput<T[K]>
      : T[K] extends Record<string, Option>
        ? OptionsInput<T[K]>
        : T[K] extends [Argument, ...Argument[]]
          ? ArgumentsInput<T[K]>
          : T[K]
    : never;
};

export function defineCLI<T extends Cli>(input: CliInput<T> & Cli) {
  const cliSchema = input as Prettify<T & AttachedMethods<T> & ValidateMethods<T>>;

  prepareOptionsTypes(cliSchema.options);
  prepareArgumentsTypes(cliSchema.arguments);

  if (cliSchema.subcommands) {
    for (const subcommand of Object.values(cliSchema.subcommands)) {
      prepareOptionsTypes(subcommand.options);
      prepareArgumentsTypes(subcommand.arguments);
    }
  }

  const onExecute = (handler: (Cli["_onExecute"] & {})[number]) => {
    cliSchema._onExecute ??= [];
    cliSchema._onExecute.push(handler);

    return () => {
      const handlerIndex = cliSchema._onExecute?.indexOf(handler);
      if (!handlerIndex || handlerIndex < 0) return;
      cliSchema._onExecute?.splice(handlerIndex, 1);
    };
  };

  const execute: AttachedMethodsWide["execute"] = inputValues => {
    inputValues ??= {};
    if (!cliSchema._onExecute) throw new Error("Action is not defined");
    const context = createExecuteContext(inputValues, cliSchema);
    const validateResult = validate(context, cliSchema);

    if (cliSchema._onExecute) {
      for (const handler of cliSchema._onExecute) {
        handler(validateResult);
      }
    }
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
    execute,
    onExecute,
    run: (stringOrArgv: string | string[]) => safeParse(stringOrArgv, cliSchema),
    runAsync: (stringOrArgv: string | string[]) => safeParseAsync(stringOrArgv, cliSchema),
  });
}
