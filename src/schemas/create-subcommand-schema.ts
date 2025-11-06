import { createExecuteContext } from "../parse/create-execute-context.ts";
import { validate } from "../parse/validate-context.ts";

import type { AttachedMethods, AttachedMethodsWide, Prettify } from "../types.ts";
import type { Argument, Option, Subcommand } from "./schema-types.ts";

type OptionsInput<T extends Record<string, Option>> = {
  [OptionName in keyof T]: Option<T[OptionName]["type"]["schema"]>;
};

type ArgumentsInput<T extends [Argument, ...Argument[]]> = {
  [ArgumentIndex in keyof T]: Argument<T[ArgumentIndex]["type"]["schema"]>;
};

// This will prevent extra keys and enable Jsdoc on hover
type SubcommandInput<T extends Subcommand> = {
  [K in keyof T]: K extends keyof Subcommand
    ? T[K] extends Record<string, Option>
      ? OptionsInput<T[K]>
      : T[K] extends [Argument, ...Argument[]]
        ? ArgumentsInput<T[K]>
        : T[K]
    : never;
};

export function createSubcommand<T extends Subcommand>(input: SubcommandInput<T> & Subcommand) {
  const cliSchema = input as Prettify<T & AttachedMethods<T>>;

  const onExecute = (handler: (Subcommand["_onExecute"] & {})[number]) => {
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

  return Object.assign(cliSchema, { onExecute, execute });
}
