import { buildObjectContext } from "../parse/context/object-context-builder.ts";
import { validate } from "../parse/validation/validate-context.ts";
import { prepareDefinitionTypes } from "../utilities/schema-utilities.ts";

import type { Argument, Option, Subcommand } from "../types/definitions-types.ts";
import type { AttachedMethods, AttachedMethodsWide } from "../types/types.ts";
import type { Prettify } from "../types/utilities-types.ts";

type OptionsInput<T> =
  T extends Record<string, Option> ? { [OptionName in keyof T]: Option<T[OptionName]["schema"]> } : T;

type ArgumentsInput<T> =
  T extends Record<string, Argument> ? { [ArgumentName in keyof T]: Argument<T[ArgumentName]["schema"]> } : T;

// This will prevent extra keys and enable jsdoc on hover
type SubcommandInput<T extends Subcommand> = {
  [K in keyof T]: K extends keyof Subcommand
    ? K extends "options"
      ? OptionsInput<T[K]>
      : K extends "arguments"
        ? ArgumentsInput<T[K]>
        : T[K]
    : never;
};

export function defineSubcommand<T extends Subcommand>(input: SubcommandInput<T> & Subcommand) {
  const subcommandDefinition = input as T;

  prepareDefinitionTypes(subcommandDefinition.options);
  prepareDefinitionTypes(subcommandDefinition.arguments);

  const onExecute = (handler: (Subcommand["_onExecute"] & {})[number]) => {
    subcommandDefinition._onExecute ??= [];
    subcommandDefinition._onExecute.push(handler);

    return () => {
      const handlerIndex = subcommandDefinition._onExecute?.indexOf(handler);
      if (!handlerIndex || handlerIndex < 0) return;
      subcommandDefinition._onExecute?.splice(handlerIndex, 1);
    };
  };

  const execute: AttachedMethodsWide["execute"] = inputValues => {
    inputValues ??= {};

    const handlers = subcommandDefinition._onExecute;

    if (!handlers) {
      throw new Error("OnExecute is not defined");
    }

    const context = buildObjectContext(inputValues, subcommandDefinition);
    const validateResult = validate(context, subcommandDefinition);

    for (const handler of handlers) {
      void handler(validateResult);
    }
  };

  const executeAsync: AttachedMethodsWide["executeAsync"] = async inputValues => {
    inputValues ??= {};

    const handlers = subcommandDefinition._onExecute;

    if (!handlers) {
      throw new Error("OnExecute is not defined");
    }

    const context = buildObjectContext(inputValues, subcommandDefinition);
    const validateResult = validate(context, subcommandDefinition);

    await Promise.all(handlers.map(async handler => await handler(validateResult)));
  };

  return Object.assign(subcommandDefinition, { onExecute, execute, executeAsync }) as Prettify<T & AttachedMethods<T>>;
}
