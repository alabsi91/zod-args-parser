import { generateCliHelpMessage } from "../help-message/generate-for-cli.ts";
import { generateSubcommandHelpMessage } from "../help-message/generate-for-subcommand.ts";
import { buildObjectContext } from "../parse/context/object-context-builder.ts";
import { safeParse, safeParseAsync } from "../parse/safe-parse.ts";
import { validate } from "../parse/validation/validate-context.ts";
import { prepareDefinitionTypes } from "../utilities.ts";

import type { Argument, Cli, Option, Subcommand } from "../types/definitions-types.ts";
import type { PrintHelpOptions } from "../types/help-message-types.ts";
import type { AttachedMethods, AttachedMethodsWide, ValidateMethods } from "../types/types.ts";
import type { Prettify } from "../types/utilities-types.ts";

type OptionsInput<T> =
  T extends Record<string, Option> ? { [OptionName in keyof T]: Option<T[OptionName]["schema"]> } : T;

type ArgumentsInput<T> =
  T extends Record<string, Argument> ? { [ArgumentName in keyof T]: Argument<T[ArgumentName]["schema"]> } : T;

type SubcommandsInput<T extends readonly [Subcommand, ...Subcommand[]]> = {
  [SubcommandIndex in keyof T]: {
    [K in keyof T[SubcommandIndex]]: T[SubcommandIndex][K] extends Record<string, Option>
      ? OptionsInput<T[SubcommandIndex][K]>
      : T[SubcommandIndex][K] extends Record<string, Argument>
        ? ArgumentsInput<T[SubcommandIndex][K]>
        : T[SubcommandIndex][K];
  } & Subcommand;
};

// This will prevent extra keys and enable jsdoc on hover
type CliInput<T extends Cli> = {
  [K in keyof T]: K extends keyof Cli
    ? T[K] extends readonly [Subcommand, ...Subcommand[]]
      ? SubcommandsInput<T[K]>
      : K extends "options"
        ? OptionsInput<T[K]>
        : K extends "arguments"
          ? ArgumentsInput<T[K]>
          : T[K]
    : never;
};

export function defineCLI<T extends Cli>(input: CliInput<T> & Cli) {
  const cliSchema = input as Prettify<T & AttachedMethods<T> & ValidateMethods<T>>;

  prepareDefinitionTypes(cliSchema.options);
  prepareDefinitionTypes(cliSchema.arguments);

  if (cliSchema.subcommands) {
    for (const subcommand of Object.values(cliSchema.subcommands)) {
      prepareDefinitionTypes(subcommand.options);
      prepareDefinitionTypes(subcommand.arguments);
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
    const context = buildObjectContext(inputValues, cliSchema);
    const validateResult = validate(context, cliSchema);

    if (cliSchema._onExecute) {
      for (const handler of cliSchema._onExecute) {
        handler(validateResult);
      }
    }
  };

  // Add print methods for CLI schema and its subcommands
  const generateHelpMethods: Pick<AttachedMethodsWide, "generateCliHelpMessage" | "generateSubcommandHelpMessage"> = {
    generateCliHelpMessage(options?: PrintHelpOptions) {
      return generateCliHelpMessage(cliSchema, options);
    },
    generateSubcommandHelpMessage(subcommandName: string, options?: PrintHelpOptions) {
      const foundSubcommand = cliSchema.subcommands?.find(s => s.name === subcommandName);
      if (!foundSubcommand) throw new Error(`Subcommand ${subcommandName} not found`);
      return generateSubcommandHelpMessage(foundSubcommand, options, cliSchema.cliName);
    },
  };

  Object.assign(cliSchema, generateHelpMethods);

  if (cliSchema.subcommands) {
    for (const subcommandSchema of cliSchema.subcommands) {
      Object.assign(subcommandSchema, generateHelpMethods);
    }
  }

  return Object.assign(cliSchema, {
    execute,
    onExecute,
    run: (stringOrArgv: string | string[]) => safeParse(stringOrArgv, cliSchema),
    runAsync: (stringOrArgv: string | string[]) => safeParseAsync(stringOrArgv, cliSchema),
  });
}
