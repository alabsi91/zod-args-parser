import { buildObjectContext } from "../parse/context/object-context-builder.ts";
import { validate } from "../parse/validation/validate-context.ts";
import { prepareArgumentsTypes, prepareOptionsTypes } from "../utilities.ts";

import type { Argument, Option, Subcommand } from "../types/definitions-types.ts";
import type { AttachedMethods, AttachedMethodsWide } from "../types/types.ts";
import type { Prettify } from "../types/utilities-types.ts";

type OptionsInput<T extends Record<string, Option>> = {
  [OptionName in keyof T]: Option<T[OptionName]["type"]>;
};

type ArgumentsInput<T extends Record<string, Argument>> = {
  [ArgumentName in keyof T]: Argument<T[ArgumentName]["type"]>;
};

// This will prevent extra keys and enable jsdoc on hover
type SubcommandInput<T extends Subcommand> = {
  [K in keyof T]: K extends keyof Subcommand
    ? T[K] extends Record<string, Option>
      ? OptionsInput<T[K]>
      : T[K] extends Record<string, Argument>
        ? ArgumentsInput<T[K]>
        : T[K]
    : never;
};

export function defineSubcommand<T extends Subcommand>(input: SubcommandInput<T> & Subcommand) {
  const subcommandSchema = input as Prettify<T & AttachedMethods<T>>;

  prepareOptionsTypes(subcommandSchema.options);
  prepareArgumentsTypes(subcommandSchema.arguments);

  const onExecute = (handler: (Subcommand["_onExecute"] & {})[number]) => {
    subcommandSchema._onExecute ??= [];
    subcommandSchema._onExecute.push(handler);

    return () => {
      const handlerIndex = subcommandSchema._onExecute?.indexOf(handler);
      if (!handlerIndex || handlerIndex < 0) return;
      subcommandSchema._onExecute?.splice(handlerIndex, 1);
    };
  };

  const execute: AttachedMethodsWide["execute"] = inputValues => {
    inputValues ??= {};
    if (!subcommandSchema._onExecute) throw new Error("Action is not defined");
    const context = buildObjectContext(inputValues, subcommandSchema);
    const validateResult = validate(context, subcommandSchema);

    if (subcommandSchema._onExecute) {
      for (const handler of subcommandSchema._onExecute) {
        handler(validateResult);
      }
    }
  };

  return Object.assign(subcommandSchema, { onExecute, execute });
}
