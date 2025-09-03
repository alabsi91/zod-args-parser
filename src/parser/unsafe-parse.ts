import * as help from "../help-message/format-cli.js";
import { findSubcommand } from "./parse/parser-helpers.js";
import { validate } from "./validate/validate.js";
import { parse } from "./parse/parse.js";

import type { Cli, NoSubcommand, HelpMsgStyle, Subcommand, UnsafeParseResult } from "../types.js";

export function unsafeParse<T extends Subcommand[], U extends Cli>(
  argv: string[],
  ...params: [U, ...T]
): UnsafeParseResult<[...T, NoSubcommand & U]> {
  const cliOptions = ("cliName" in params[0] ? params[0] : {}) as U;
  const subcommandArr = params as unknown as T;

  // Parse
  const parsedData = parse(argv, ...params);

  const subcommandObj = findSubcommand(parsedData.subcommand, subcommandArr);
  if (!subcommandObj) {
    throw new Error(`Subcommand "${parsedData.subcommand}" does not exist`);
  }

  // Fire preValidation hook
  if (subcommandObj.preValidation) {
    subcommandObj.preValidation(parsedData);
  }

  // Validate
  const validateResult = validate(parsedData);

  Object.assign(validateResult, {
    printCliHelp(style?: Partial<HelpMsgStyle>) {
      help.printCliHelp(params, style);
    },
    printSubcommandHelp(subCmdName: string, style?: Partial<HelpMsgStyle>) {
      const subcommandObj = findSubcommand(subCmdName, subcommandArr);
      if (!subcommandObj) {
        console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
        return;
      }

      help.printSubcommandHelp(subcommandObj, style, cliOptions.cliName);
    },
  });

  // Fire action
  if (subcommandObj.action) {
    subcommandObj.action(validateResult);
  }

  return validateResult as UnsafeParseResult<[...T, NoSubcommand & U]>;
}

export async function unsafeParseAsync<T extends Subcommand[], U extends Cli>(
  argv: string[],
  ...params: [U, ...T]
): Promise<UnsafeParseResult<[...T, NoSubcommand & U]>> {
  const cliOptions = ("cliName" in params[0] ? params[0] : {}) as U;
  const subcommandArr = params as unknown as T;

  // Parse
  const parsedData = parse(argv, ...params);

  const subcommandObj = findSubcommand(parsedData.subcommand, subcommandArr);
  if (!subcommandObj) {
    throw new Error(`Subcommand "${parsedData.subcommand}" does not exist`);
  }

  // Fire preValidation hook
  if (subcommandObj.preValidation) {
    await subcommandObj.preValidation(parsedData);
  }

  // Validate
  const validateResult = validate(parsedData);

  Object.assign(validateResult, {
    printCliHelp(style?: Partial<HelpMsgStyle>) {
      help.printCliHelp(params, style);
    },
    printSubcommandHelp(subCmdName: string, style?: Partial<HelpMsgStyle>) {
      const subcommandObj = findSubcommand(subCmdName, subcommandArr);
      if (!subcommandObj) {
        console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
        return;
      }

      help.printSubcommandHelp(subcommandObj, style, cliOptions.cliName);
    },
  });

  // Fire action
  if (subcommandObj.action) {
    await subcommandObj.action(validateResult);
  }

  return validateResult as UnsafeParseResult<[...T, NoSubcommand & U]>;
}
