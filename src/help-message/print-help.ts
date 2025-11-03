import { formatCliHelpMessage, formatSubcommandHelpMessage } from "./format-cli.ts";

import type { Cli, Subcommand } from "../schemas/schema-types.ts";
import type { PrintHelpOptions } from "../types.ts";

export function printCliHelp(cli: Cli, options: PrintHelpOptions = {}) {
  console.log(formatCliHelpMessage(cli, options));
}

export function printSubcommandHelp(subcommand: Subcommand, options: PrintHelpOptions = {}, cliName = "") {
  console.log(formatSubcommandHelpMessage(subcommand, options, cliName));
}
