import { getCliMetadata } from "../metadata/get-cli-metadata.ts";
import { indent, indentLines, ln, subcommandPlaceholder } from "../utilities.ts";
import { formatHelpMessageArguments } from "./format-arguments.ts";
import { formatHelpMessageOptions } from "./format-options.ts";
import { formatHelpMessageCommands } from "./format-subcommands.ts";
import { helpMessageStyles } from "./styles.ts";

import type { Cli, Subcommand } from "../schemas/schema-types.ts";
import type { HelpMessageStyle, PrintHelpOptions } from "../types.ts";
import { terminalMarkdown } from "./terminal-markdown.ts";

export interface FormatOptions extends Required<PrintHelpOptions> {
  style: HelpMessageStyle;
  longest: number;
}

function setPrintHelpOptionsDefaults(options: PrintHelpOptions) {
  const copy = { ...options };

  copy.style ??= helpMessageStyles.default;

  copy.indentBeforeName ??= 2;
  copy.indentAfterName ??= 4;
  copy.indentBeforePlaceholder ??= 1;
  copy.newLineIndent ??= 0;

  copy.emptyLines ??= 0;
  copy.emptyLinesBeforeTitle ??= 1;
  copy.emptyLinesAfterTitle ??= 0;

  copy.exampleKeyword ??= "Example";
  copy.optionalKeyword ??= "(optional)";
  copy.defaultKeyword ??= "(default: {{ value }})";

  copy.usageTitle ??= "USAGE";
  copy.descriptionTitle ??= "DESCRIPTION";
  copy.commandsTitle ??= "COMMANDS";
  copy.optionsTitle ??= "OPTIONS";
  copy.argumentsTitle ??= "ARGUMENTS";
  copy.exampleTitle ??= "EXAMPLE";

  return copy as Required<FormatOptions>;
}

export function formatCliHelpMessage(cli: Cli, printOptions: PrintHelpOptions = {}): string {
  const options = setPrintHelpOptionsDefaults(printOptions);

  const style = helpMessageStyles.default;
  Object.assign(style, options.style);

  const metadata = getCliMetadata(cli);

  const formatTitle = (title: string) => indent(1) + style.title(title);

  let message = "";

  // CLI usage
  let usage = metadata.usage;
  if (!usage) {
    usage += style.punctuation("$");
    usage += metadata.name ? style.description("", metadata.name) : "";
    usage += metadata.subcommands.length > 0 ? style.command("", "[command]") : "";
    usage += metadata.options.length > 0 ? style.option("", "[options]") : "";
    usage += metadata.arguments.length > 0 ? style.argument("", "<arguments>") : "";
    usage += metadata.allowPositionals ? style.argument("", "<positionals>") : "";
  }

  message += formatTitle(options.usageTitle) + ln(1 + options.emptyLinesAfterTitle);
  message += indent(options.indentBeforeName) + usage + ln(1);

  // CLI description
  if (metadata.description || metadata.descriptionMarkdown) {
    message +=
      ln(options.emptyLinesBeforeTitle) + formatTitle(options.descriptionTitle) + ln(1 + options.emptyLinesAfterTitle);

    const normalizedDesc = indentLines(
      metadata.description || terminalMarkdown(metadata.descriptionMarkdown),
      options.indentBeforeName,
    );

    message += indent(options.indentBeforeName) + style.description(normalizedDesc) + ln(1);
  }

  let longest = 0;

  // Prepare CLI options
  const optionsMetadata = metadata.options;

  let longestOptionTitle = 0;
  for (const metadata of optionsMetadata) {
    const names = [...metadata.aliasesAsArgs, metadata.nameAsArg].join(", ");
    const optLength = names.length + metadata.placeholder.length;
    longestOptionTitle = Math.max(optLength, longestOptionTitle);
  }

  longest = Math.max(longestOptionTitle, longest);

  // Prepare CLI commands
  const subcommandsMetadata = metadata.subcommands;

  let longestSubcommandTitle = 0;
  for (const metadata of subcommandsMetadata) {
    const names = [...metadata.aliases, metadata.name].join(", ");
    const placeholder = subcommandPlaceholder(metadata);
    const optLength = names.length + placeholder.length;
    longestSubcommandTitle = Math.max(optLength, longestSubcommandTitle);
  }

  longest = Math.max(longestSubcommandTitle, longest);

  // Prepare CLI arguments
  const argumentsMetadata = metadata.arguments;

  let longestArgumentTitle = 0;
  for (const argument of argumentsMetadata) {
    longestArgumentTitle = Math.max(argument.name.length, longestArgumentTitle);
  }

  longest = Math.max(longestArgumentTitle, longest);

  const formatOptions = Object.assign({ ...options }, { style, longest }) as FormatOptions;

  // CLI options
  message += formatHelpMessageOptions(optionsMetadata, formatOptions);

  // CLI commands
  message += formatHelpMessageCommands(subcommandsMetadata, formatOptions);

  // CLI arguments
  message += formatHelpMessageArguments(argumentsMetadata, formatOptions);

  // CLI example
  if (metadata.example) {
    message +=
      ln(options.emptyLinesBeforeTitle) + formatTitle(options.exampleTitle) + ln(1 + options.emptyLinesAfterTitle);
    const normalizeExample = indentLines(metadata.example, options.indentBeforeName);
    message += indent(options.indentBeforeName) + style.example(normalizeExample);
  }

  return message;
}

export function formatSubcommandHelpMessage(subcommand: Subcommand, options: PrintHelpOptions = {}, cliName = "") {
  setPrintHelpOptionsDefaults(options);

  const style = helpMessageStyles.default;
  Object.assign(style, options.style);

  const meta = subcommand.meta ?? {};

  let usage = meta.usage;
  if (!usage) {
    usage += style.punctuation("$");
    usage += cliName ? ` ${cliName}` : "";
    usage += style.command("", subcommand.name);
    usage += subcommand.options ? style.option(" [options]") : "";
    usage += subcommand.arguments || subcommand.allowPositionals ? style.argument(" <arguments>") : "";
  }

  // convert to cli object without subcommands
  const asCli: Cli = { ...subcommand, cliName: subcommand.name, meta: { usage, ...meta } };

  return formatCliHelpMessage(asCli, options);
}
