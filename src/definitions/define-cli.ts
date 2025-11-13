import { generateCliHelpMessage } from "../help-message/generate-for-cli.ts";
import { generateSubcommandHelpMessage } from "../help-message/generate-for-subcommand.ts";
import { buildObjectContext } from "../parse/context/object-context-builder.ts";
import { safeParse, safeParseAsync } from "../parse/safe-parse.ts";
import { validate } from "../parse/validation/validate-context.ts";
import { prepareDefinitionTypes } from "../utilities/schema-utilities.ts";

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
  const cliDefinition = input as T;

  prepareDefinitionTypes(cliDefinition.options);
  prepareDefinitionTypes(cliDefinition.arguments);

  if (cliDefinition.subcommands) {
    for (const subcommand of Object.values(cliDefinition.subcommands)) {
      prepareDefinitionTypes(subcommand.options);
      prepareDefinitionTypes(subcommand.arguments);
    }
  }

  const onExecute = (handler: (Cli["_onExecute"] & {})[number]) => {
    cliDefinition._onExecute ??= [];
    cliDefinition._onExecute.push(handler);

    return () => {
      const handlerIndex = cliDefinition._onExecute?.indexOf(handler);
      if (!handlerIndex || handlerIndex < 0) return;
      cliDefinition._onExecute?.splice(handlerIndex, 1);
    };
  };

  const execute: AttachedMethodsWide["execute"] = inputValues => {
    inputValues ??= {};

    const handlers = cliDefinition._onExecute;

    if (!handlers) {
      throw new Error("OnExecute is not defined");
    }

    const context = buildObjectContext(inputValues, cliDefinition);
    const validateResult = validate(context, cliDefinition);

    for (const handler of handlers) {
      void handler(validateResult);
    }
  };

  const executeAsync: AttachedMethodsWide["executeAsync"] = async inputValues => {
    inputValues ??= {};

    const handlers = cliDefinition._onExecute;

    if (!handlers) {
      throw new Error("OnExecute is not defined");
    }

    const context = buildObjectContext(inputValues, cliDefinition);
    const validateResult = validate(context, cliDefinition);

    await Promise.all(handlers.map(async handler => await handler(validateResult)));
  };

  // Add print methods for CLI schema and its subcommands
  const generateHelpMethods: Pick<AttachedMethodsWide, "generateCliHelpMessage" | "generateSubcommandHelpMessage"> = {
    generateCliHelpMessage(options?: PrintHelpOptions) {
      return generateCliHelpMessage(cliDefinition, options);
    },
    generateSubcommandHelpMessage(subcommandName: string, options?: PrintHelpOptions) {
      const foundSubcommand = cliDefinition.subcommands?.find(s => s.name === subcommandName);
      if (!foundSubcommand) throw new Error(`Subcommand ${subcommandName} not found`);
      return generateSubcommandHelpMessage(foundSubcommand, options, cliDefinition.cliName);
    },
  };

  Object.assign(cliDefinition, generateHelpMethods);

  if (cliDefinition.subcommands) {
    for (const subcommandSchema of cliDefinition.subcommands) {
      Object.assign(subcommandSchema, generateHelpMethods);
    }
  }

  const run = (stringOrArgv: string | string[]) => safeParse(stringOrArgv, cliDefinition);
  const runAsync = (stringOrArgv: string | string[]) => safeParseAsync(stringOrArgv, cliDefinition);

  return Object.assign(cliDefinition, { onExecute, execute, executeAsync, run, runAsync }) as Prettify<
    T & AttachedMethods<T> & ValidateMethods<T>
  >;
}
