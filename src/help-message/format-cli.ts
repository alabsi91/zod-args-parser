import { getCliMetadata } from "../metadata/get-cli-metadata.js";
import { concat, indent, ln, subcommandPlaceholder } from "../utilities.js";
import { formatHelpMessageArguments } from "./format-arguments.js";
import { formatHelpMessageOptions } from "./format-options.js";
import { formatHelpMessageCommands } from "./format-subcommands.js";
import { helpMessageStyles } from "./styles.js";

import type { Cli, HelpMessageStyle, Subcommand } from "../types.js";

export function formatCliHelpMessage(
  parameters: readonly [Cli, ...Subcommand[]],
  style?: Partial<HelpMessageStyle>,
): string {
  const c = helpMessageStyles.default;
  if (style) Object.assign(c, style);

  const metadata = getCliMetadata(parameters);

  const formatTitle = (title: string) => c.title(` ${title.toUpperCase()}`);

  let message = "";

  // CLI usage
  const usage =
    metadata.usage ||
    concat(
      c.punctuation("$"),
      c.description(metadata.name),
      metadata.subcommands.length > 0 ? c.command("[command]") : "",
      metadata.options.length > 0 ? c.option("[options]") : "",
      metadata.arguments.length > 0 ? c.argument("<arguments>") : "",
      metadata.allowPositional ? c.argument("<positionals>") : "",
    );
  message += formatTitle("Usage") + ln(1);
  message += indent(2) + usage + ln(2);

  // CLI description
  if (metadata.description) {
    message += formatTitle("Description") + ln(1);
    message += indent(2) + c.description(metadata.description).replace(/\n+/g, "\n" + indent(2)) + ln(2);
  }

  let longest = 0;

  // Prepare CLI options
  const optionsMetadata = metadata.options;

  let longestOptionTitle = 0;
  for (const metadata of optionsMetadata) {
    const names = [...metadata.aliasesAsArgs, metadata.nameAsArg].join(", ");
    const optLength = names.length + metadata.placeholder.length;
    if (optLength > longestOptionTitle) {
      longestOptionTitle = optLength;
    }
  }

  if (longestOptionTitle > longest) {
    longest = longestOptionTitle;
  }

  // Prepare CLI commands
  const subcommandsMetadata = metadata.subcommands;

  let longestSubcommandTitle = 0;
  for (const metadata of subcommandsMetadata) {
    const names = [...metadata.aliases, metadata.name].join(", ");
    const placeholder = subcommandPlaceholder(metadata);
    const optLength = names.length + placeholder.length;
    if (optLength > longestSubcommandTitle) {
      longestSubcommandTitle = optLength;
    }
  }

  if (longestSubcommandTitle > longest) {
    longest = longestSubcommandTitle;
  }

  // Prepare CLI arguments
  const argumentsMetadata = metadata.arguments;

  let longestArgumentTitle = 0;
  for (const argument of argumentsMetadata) {
    if (argument.name.length > longestArgumentTitle) {
      longestArgumentTitle = argument.name.length;
    }
  }

  if (longestArgumentTitle > longest) {
    longest = longestArgumentTitle;
  }

  // CLI options
  message += formatHelpMessageOptions(optionsMetadata, c, longest);

  // CLI commands
  message += formatHelpMessageCommands(subcommandsMetadata, c, longest);

  // CLI arguments
  message += formatHelpMessageArguments(argumentsMetadata, c, longest);

  // CLI example
  if (metadata.example) {
    message += formatTitle("Example");
    message += ln(1);
    const normalizeExample = metadata.example.replace(/\n+/g, "\n" + indent(3));
    message += concat(indent(2), c.example(normalizeExample), ln(2));
  }

  return message;
}

export function formatSubcommandHelpMessage(
  subcommand: Subcommand,
  printStyle?: Partial<HelpMessageStyle>,
  cliName = "",
) {
  const c = helpMessageStyles.default;
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

  return formatCliHelpMessage([asCli], c);
}

export function printCliHelp(parameters: readonly [Cli, ...Subcommand[]], style?: Partial<HelpMessageStyle>) {
  console.log(formatCliHelpMessage(parameters, style));
}

export function printSubcommandHelp(subcommand: Subcommand, style?: Partial<HelpMessageStyle>, cliName = "") {
  console.log(formatSubcommandHelpMessage(subcommand, style, cliName));
}
