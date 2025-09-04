import * as help from "../help-message/format-cli.js";
import { findSubcommand } from "./parse/parser-helpers.js";
import { unsafeParse, unsafeParseAsync } from "./unsafe-parse.js";

import type { Cli, NoSubcommand, PrintMethods, SafeParseResult, Subcommand } from "../types.js";

export function safeParse<T extends Subcommand[], U extends Cli>(
  argsv: string[],
  ...params: [U, ...T]
): SafeParseResult<[...T, NoSubcommand & U]> {
  const cliOptions = ("cliName" in params[0] ? params[0] : {}) as U;
  const subcommandArr = params as Subcommand[];

  type PrintTypes = PrintMethods<T[number]["name"]>;
  type PrintCli = PrintTypes["printCliHelp"];
  type PrintSubcommand = PrintTypes["printSubcommandHelp"];

  const printCliHelp: PrintCli = style => help.printCliHelp(params, style);

  const printSubcommandHelp: PrintSubcommand = (subCmdName, style) => {
    const subcommand = findSubcommand(subCmdName, subcommandArr);
    if (!subcommand) {
      return console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
    }

    help.printSubcommandHelp(subcommand, style, cliOptions.cliName);
  };

  try {
    const data = unsafeParse(argsv, ...params);
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
  } catch (e) {
    if (!(e instanceof Error) || e.cause !== "zod-args-parser") throw e;
    return {
      success: false,
      error: e as Error,
      printCliHelp,
      printSubcommandHelp,
    } as SafeParseResult<[...T, NoSubcommand & U]>;
  }
}

export async function safeParseAsync<T extends Subcommand[], U extends Cli>(
  argsv: string[],
  ...params: [U, ...T]
): Promise<SafeParseResult<[...T, NoSubcommand & U]>> {
  const cliOptions = ("cliName" in params[0] ? params[0] : {}) as U;
  const subcommandArr = params as Subcommand[];

  type PrintTypes = PrintMethods<T[number]["name"]>;
  type PrintCli = PrintTypes["printCliHelp"];
  type PrintSubcommand = PrintTypes["printSubcommandHelp"];

  const printCliHelp: PrintCli = style => help.printCliHelp(params, style);

  const printSubcommandHelp: PrintSubcommand = (subCmdName, style) => {
    const subcommand = findSubcommand(subCmdName, subcommandArr);
    if (!subcommand) {
      return console.error(`Cannot print help for subcommand "${subCmdName}" as it does not exist`);
    }

    help.printSubcommandHelp(subcommand, style, cliOptions.cliName);
  };

  try {
    const data = await unsafeParseAsync(argsv, ...params);
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
  } catch (e) {
    if (!(e instanceof Error) || e.cause !== "zod-args-parser") throw e;
    return {
      success: false,
      error: e as Error,
      printCliHelp,
      printSubcommandHelp,
    } as SafeParseResult<[...T, NoSubcommand & U]>;
  }
}
