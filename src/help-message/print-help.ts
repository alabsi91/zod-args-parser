import { generateCliHelpMessage } from "./generate-for-cli.ts";
import { generateSubcommandHelpMessage } from "./generate-for-subcommand.ts";

import type { Cli, Subcommand } from "../types/definitions-types.ts";
import type { PrintHelpOptions } from "../types/help-message-types.ts";

export function printCliHelp(cliDefinition: Cli, options: PrintHelpOptions = {}) {
  console.log(generateCliHelpMessage(cliDefinition, options));
}

export function printSubcommandHelp(commandDefinition: Subcommand, options: PrintHelpOptions = {}, cliName = "") {
  console.log(generateSubcommandHelpMessage(commandDefinition, options, cliName));
}
