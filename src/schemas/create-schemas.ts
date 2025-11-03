import { printCliHelp, printSubcommandHelp } from "../help-message/print-help.ts";
import { createExecuteContext } from "../parse/context/create-execute-context.ts";
import { validate } from "../parse/validate/validate.ts";

import type { AttachedMethods, ActionsFunctionsWide, PrintHelpOptions } from "../types.ts";
import type { Argument, Cli, Option, Subcommand } from "./schema-types.ts";

type Exact<Actual extends Wanted, Wanted> = {
  [Key in keyof Actual]: Key extends Exclude<keyof Actual, keyof Wanted> ? never : unknown;
};

export function createCli<T extends Cli>(
  input: {
    [K in keyof T]: K extends keyof Cli
      ? T[K] extends Record<string, Option>
        ? { [I in keyof T[K]]: Option<T[K][I]["type"]["schema"]> }
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
  if ("cliName" in cliSchema) {
    const printMethods = {
      printCliHelp(options?: PrintHelpOptions) {
        printCliHelp(cliSchema, options);
      },
      printSubcommandHelp(subcommandName: string, options?: PrintHelpOptions) {
        const foundSubcommand = cliSchema.subcommands?.find(s => s.name === subcommandName);
        if (!foundSubcommand) throw new Error(`Subcommand ${subcommandName} not found`);
        printSubcommandHelp(foundSubcommand, options, cliSchema.cliName);
      },
    };

    Object.assign(cliSchema, printMethods);

    if (cliSchema.subcommands) {
      for (const subcommandSchema of cliSchema.subcommands) {
        Object.assign(subcommandSchema, printMethods);
      }
    }
  }

  return Object.assign(cliSchema, { setAction, execute }) as T & AttachedMethods<T>;
}

export function createSubcommand<T extends Subcommand>(
  input: {
    [K in keyof T]: K extends keyof Subcommand
      ? T[K] extends Record<string, Option>
        ? { [I in keyof T[K]]: Option<T[K][I]["type"]["schema"]> }
        : T[K]
      : never;
  } & Subcommand,
) {
  return createCli(input as unknown as Cli) as unknown as T & AttachedMethods<T>;
}
// export function createSubcommand<O extends Record<string, Option>, T extends Subcommand<O>>(
//   input: T,
// ): T & AttachedMethods<T> {
//   return createCli(input as unknown as Cli) as unknown as T & AttachedMethods<T>;
// }

export function createOptions<T extends Record<string, Option>>(options: { [K in keyof T]: T[K] }): {
  [K in keyof T]: Option<T[K]["type"]["schema"]>;
} {
  return options;
}

export function createArguments<const T extends [Argument, ...Argument[]]>(
  ...options: { [I in keyof T]: T[I] & Exact<T[I], Argument> & Argument }
): { [I in keyof T]: Argument<T[I]["type"]["schema"]> } {
  return options;
}
