import * as help from "../help-message/format-cli.js";
import { parse } from "./parse/parse.js";
import { findSubcommand } from "./parse/parser-helpers.js";
import { validate } from "./validate/validate.js";

import type { Cli, HelpMessageStyle, NoSubcommand, Subcommand, UnsafeParseResult } from "../types.js";

export function unsafeParse<T extends Subcommand[], U extends Cli>(
  argv: string[],
  ...parameters: [U, ...T]
): UnsafeParseResult<[...T, NoSubcommand & U]> {
  const cliOptions = ("cliName" in parameters[0] ? parameters[0] : {}) as U;
  const subcommandArray = parameters as unknown as T;

  // Parse
  const parsedData = parse(argv, ...parameters);

  const subcommandObject = findSubcommand(parsedData.subcommand, subcommandArray);
  if (!subcommandObject) {
    throw new Error(`Subcommand "${parsedData.subcommand}" does not exist`, { cause: "zod-args-parser" });
  }

  // Fire preValidation hook
  if (subcommandObject.preValidation) {
    subcommandObject.preValidation(parsedData);
  }

  // Validate
  const validateResult = validate(parsedData);

  Object.assign(validateResult, {
    printCliHelp(style?: Partial<HelpMessageStyle>) {
      help.printCliHelp(parameters, style);
    },
    printSubcommandHelp(subCmdName: string, style?: Partial<HelpMessageStyle>) {
      const subcommandObject = findSubcommand(subCmdName, subcommandArray);
      if (!subcommandObject) {
        console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
        return;
      }

      help.printSubcommandHelp(subcommandObject, style, cliOptions.cliName);
    },
  });

  // Fire action
  if (subcommandObject.action) {
    subcommandObject.action(validateResult);
  }

  return validateResult as UnsafeParseResult<[...T, NoSubcommand & U]>;
}

export async function unsafeParseAsync<T extends Subcommand[], U extends Cli>(
  argv: string[],
  ...parameters: [U, ...T]
): Promise<UnsafeParseResult<[...T, NoSubcommand & U]>> {
  const cliOptions = ("cliName" in parameters[0] ? parameters[0] : {}) as U;
  const subcommandArray = parameters as unknown as T;

  // Parse
  const parsedData = parse(argv, ...parameters);

  const subcommandObject = findSubcommand(parsedData.subcommand, subcommandArray);
  if (!subcommandObject) {
    throw new Error(`Subcommand "${parsedData.subcommand}" does not exist`, { cause: "zod-args-parser" });
  }

  // Fire preValidation hook
  if (subcommandObject.preValidation) {
    await subcommandObject.preValidation(parsedData);
  }

  // Validate
  const validateResult = validate(parsedData);

  Object.assign(validateResult, {
    printCliHelp(style?: Partial<HelpMessageStyle>) {
      help.printCliHelp(parameters, style);
    },
    printSubcommandHelp(subCmdName: string, style?: Partial<HelpMessageStyle>) {
      const subcommandObject = findSubcommand(subCmdName, subcommandArray);
      if (!subcommandObject) {
        console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
        return;
      }

      help.printSubcommandHelp(subcommandObject, style, cliOptions.cliName);
    },
  });

  // Fire action
  if (subcommandObject.action) {
    await subcommandObject.action(validateResult);
  }

  return validateResult as UnsafeParseResult<[...T, NoSubcommand & U]>;
}
