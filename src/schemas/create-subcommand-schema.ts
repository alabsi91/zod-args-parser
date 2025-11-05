import { createExecuteContext } from "../parse/context/create-execute-context.ts";
import { validate } from "../parse/validate/validate.ts";

import type { ActionsFunctionsWide, AttachedMethods } from "../types.ts";
import type { Argument, Option, Subcommand } from "./schema-types.ts";

export function createSubcommand<T extends Subcommand>(
  input: {
    [K in keyof T]: K extends keyof Subcommand
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
  } & Subcommand,
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

  return Object.assign(cliSchema, { setAction, execute }) as T & AttachedMethods<T>;
}
