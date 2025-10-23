import * as help from "../help-message/format-cli.js";
import { findSubcommand } from "./parse/parser-helpers.js";
import { unsafeParse, unsafeParseAsync } from "./unsafe-parse.js";

import type { Cli, NoSubcommand, PrintMethods, SafeParseResult, Subcommand } from "../types.js";

export function safeParse<T extends Subcommand[], U extends Cli>(
  argsv: string[],
  ...parameters: [U, ...T]
): SafeParseResult<[...T, NoSubcommand & U]> {
  const cliOptions = ("cliName" in parameters[0] ? parameters[0] : {}) as U;
  const subcommandArray = parameters as Subcommand[];

  type PrintTypes = PrintMethods<T[number]["name"]>;
  type PrintCli = PrintTypes["printCliHelp"];
  type PrintSubcommand = PrintTypes["printSubcommandHelp"];

  const printCliHelp: PrintCli = style => help.printCliHelp(parameters, style);

  const printSubcommandHelp: PrintSubcommand = (subCmdName, style) => {
    const subcommand = findSubcommand(subCmdName, subcommandArray);
    if (!subcommand) {
      return console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
    }

    help.printSubcommandHelp(subcommand, style, cliOptions.cliName);
  };

  try {
    const data = unsafeParse(argsv, ...parameters);
    // @ts-expect-error The operand of a 'delete' operator must be optional.
    delete data.printCliHelp;
    // @ts-expect-errorThe operand of a 'delete' operator must be optional.
    delete data.printSubcommandHelp;

    return {
      success: true,
      data: data as Omit<typeof data, "printCliHelp" | "printSubcommandHelp">,
      printCliHelp,
      printSubcommandHelp,
    } as SafeParseResult<[...T, NoSubcommand & U]>;
  } catch (error) {
    if (!(error instanceof Error) || error.cause !== "zod-args-parser") {
      throw error;
    }

    return {
      success: false,
      error,
      printCliHelp,
      printSubcommandHelp,
    } as SafeParseResult<[...T, NoSubcommand & U]>;
  }
}

export async function safeParseAsync<T extends Subcommand[], U extends Cli>(
  argsv: string[],
  ...parameters: [U, ...T]
): Promise<SafeParseResult<[...T, NoSubcommand & U]>> {
  const cliOptions = ("cliName" in parameters[0] ? parameters[0] : {}) as U;
  const subcommandArray = parameters as Subcommand[];

  type PrintTypes = PrintMethods<T[number]["name"]>;
  type PrintCli = PrintTypes["printCliHelp"];
  type PrintSubcommand = PrintTypes["printSubcommandHelp"];

  const printCliHelp: PrintCli = style => help.printCliHelp(parameters, style);

  const printSubcommandHelp: PrintSubcommand = (subCmdName, style) => {
    const subcommand = findSubcommand(subCmdName, subcommandArray);
    if (!subcommand) {
      return console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
    }

    help.printSubcommandHelp(subcommand, style, cliOptions.cliName);
  };

  try {
    const data = await unsafeParseAsync(argsv, ...parameters);
    // @ts-expect-error The operand of a 'delete' operator must be optional.
    delete data.printCliHelp;
    // @ts-expect-errorThe operand of a 'delete' operator must be optional.
    delete data.printSubcommandHelp;

    return {
      success: true,
      data: data as Omit<typeof data, "printCliHelp" | "printSubcommandHelp">,
      printCliHelp,
      printSubcommandHelp,
    } as SafeParseResult<[...T, NoSubcommand & U]>;
  } catch (error) {
    if (!(error instanceof Error) || error.cause !== "zod-args-parser") {
      throw error;
    }

    return {
      success: false,
      error,
      printCliHelp,
      printSubcommandHelp,
    } as SafeParseResult<[...T, NoSubcommand & U]>;
  }
}
