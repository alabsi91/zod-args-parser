import { getCliMetadata } from "../metadata/get-cli-metadata.js";
import { concat, indent, ln } from "../utils.js";
import { formatHelpMsgArguments } from "./format-arguments.js";
import { formatHelpMsgOptions } from "./format-options.js";
import { formatHelpMsgCommands } from "./format-subcommands.js";
import { helpMsgStyles } from "./styles.js";

import type { Cli, HelpMsgStyle, Subcommand } from "../types.js";

export function formatCliHelpMsg(params: readonly [Cli, ...Subcommand[]], style?: Partial<HelpMsgStyle>): string {
  const c = helpMsgStyles.default;
  if (style) Object.assign(c, style);

  const metadata = getCliMetadata(params);

  const formatTitle = (title: string) => c.title(` ${title.toUpperCase()}`);

  let msg = "";

  // CLI usage
  const usage =
    metadata.usage ||
    concat(
      c.punctuation("$"),
      c.description(metadata.name),
      metadata.subcommands.length ? c.command("[command]") : "",
      metadata.options.length ? c.option("[options]") : "",
      metadata.arguments.length || metadata.allowPositional ? c.argument("<arguments>") : "",
    );
  msg += formatTitle("Usage") + ln(1);
  msg += indent(2) + usage + ln(2);

  // CLI description
  if (metadata.description) {
    msg += formatTitle("Description") + ln(1);
    msg += indent(2) + c.description(metadata.description) + ln(2);
  }

  let longest = 0;

  // Prepare CLI options
  const optionsMetadata = metadata.options;

  const longestOptionTitle = optionsMetadata.reduce((acc, metadata) => {
    const names = metadata.aliasesAsArgs.concat([metadata.nameAsArg]).join(", ");
    const optLength = names.length + metadata.placeholder.length;
    return optLength > acc ? optLength : acc;
  }, 0);

  if (longestOptionTitle > longest) {
    longest = longestOptionTitle;
  }

  // Prepare CLI commands
  const subcommandsMetadata = metadata.subcommands;

  const longestSubcommandTitle = subcommandsMetadata.reduce((acc, metadata) => {
    const names = metadata.aliases.concat([metadata.name]).join(", ");
    const placeholder =
      metadata.placeholder || (metadata.options.length ? "[options]" : metadata.allowPositional ? "<args>" : " ");
    const optLength = names.length + placeholder.length;
    return optLength > acc ? optLength : acc;
  }, 0);

  if (longestSubcommandTitle > longest) {
    longest = longestSubcommandTitle;
  }

  // Prepare CLI arguments
  const argsMetadata = metadata.arguments;
  const longestArgTitle = argsMetadata.reduce((acc, arg) => (arg.name.length > acc ? arg.name.length : acc), 0);
  if (longestArgTitle > longest) {
    longest = longestArgTitle;
  }

  // CLI options
  msg += formatHelpMsgOptions(optionsMetadata, c, longest);

  // CLI commands
  msg += formatHelpMsgCommands(subcommandsMetadata, c, longest);

  // CLI arguments
  msg += formatHelpMsgArguments(argsMetadata, c, longest);

  // CLI example
  if (metadata.example) {
    msg += formatTitle("Example");
    msg += ln(1);
    const normalizeExample = metadata.example.replace(/\n/g, "\n" + indent(3));
    msg += concat(indent(2), c.example(normalizeExample), ln(2));
  }

  return msg;
}

export function formatSubcommandHelpMsg(subcommand: Subcommand, printStyle?: Partial<HelpMsgStyle>, cliName = "") {
  const c = helpMsgStyles.default;
  if (printStyle) Object.assign(c, printStyle);

  const usage =
    subcommand.usage ||
    concat(
      c.punctuation("$"),
      cliName,
      c.command(subcommand.name),
      subcommand.options?.length ? c.option("[options]") : "",
      subcommand.arguments?.length || subcommand.allowPositional ? c.argument("<arguments>") : "",
    );

  const asCli: Cli = { cliName, usage, ...subcommand };

  return formatCliHelpMsg([asCli], c);
}

export function printCliHelp(params: readonly [Cli, ...Subcommand[]], style?: Partial<HelpMsgStyle>) {
  console.log(formatCliHelpMsg(params, style));
}

export function printSubcommandHelp(subcommand: Subcommand, style?: Partial<HelpMsgStyle>, cliName = "") {
  console.log(formatSubcommandHelpMsg(subcommand, style, cliName));
}
