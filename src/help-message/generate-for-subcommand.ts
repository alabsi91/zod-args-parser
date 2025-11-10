import { generateCliHelpMessage } from "./generate-for-cli.ts";
import { setPrintHelpOptionsDefaults } from "./set-defaults.ts";
import { helpMessageStyles } from "./styles.ts";

import type { Cli, Subcommand } from "../types/definitions-types.ts";
import type { PrintHelpOptions } from "../types/help-message-types.ts";

export function generateSubcommandHelpMessage(
  commandDefinition: Subcommand,
  options: PrintHelpOptions = {},
  cliName = "",
): string {
  setPrintHelpOptionsDefaults(options);

  const style = { ...helpMessageStyles.default, ...options.style };

  const meta = commandDefinition.meta ?? {};

  let usage = meta.usage;
  if (!usage) {
    usage = style.punctuation("$");
    usage += cliName ? ` ${cliName}` : "";
    usage += style.command("", commandDefinition.name);
    usage += commandDefinition.options ? style.option(" [options]") : "";
    usage += commandDefinition.arguments || commandDefinition.allowPositionals ? style.argument(" <arguments>") : "";
  }

  // convert to cli object without subcommands
  const asCliDefinition: Cli = { ...commandDefinition, cliName: commandDefinition.name, meta: { usage, ...meta } };

  return generateCliHelpMessage(asCliDefinition, options);
}
