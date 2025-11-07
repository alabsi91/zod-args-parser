import { formatCliHelpMessage, formatSubcommandHelpMessage } from "./format-cli.ts";

import type { Cli, Subcommand } from "../types/definitions-types.ts";
import type { PrintHelpOptions } from "../types/help-message-types.ts";

export function printCliHelp(cliDefinition: Cli, options: PrintHelpOptions = {}) {
  console.log(formatCliHelpMessage(cliDefinition, options));
}

export function printSubcommandHelp(commandDefinition: Subcommand, options: PrintHelpOptions = {}, cliName = "") {
  console.log(formatSubcommandHelpMessage(commandDefinition, options, cliName));
}
