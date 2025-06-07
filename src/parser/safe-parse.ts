import * as help from "../help-message/print-help-message.js";
import { parse } from "./parse.js";

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

  const printCliHelp: PrintCli = opt => help.printCliHelp(params, opt);
  const printSubcommandHelp: PrintSubcommand = (subcommandStr, opt) => {
    const subcommand = subcommandArr.find(c => c.name === subcommandStr);
    if (!subcommand) return console.error(`Cannot print help for subcommand "${subcommandStr}" as it does not exist`);
    help.printSubcommandHelp(subcommand, opt, cliOptions.cliName);
  };

  try {
    const data = parse(argsv, ...params);
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
    return {
      success: false,
      error: e as Error,
      printCliHelp,
      printSubcommandHelp,
    } as SafeParseResult<[...T, NoSubcommand & U]>;
  }
}
