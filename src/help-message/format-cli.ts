import { getCliMetadata } from "../metadata/get-cli-metadata.ts";
import { indent, indentLines, ln, subcommandPlaceholder } from "../utilities.ts";
import { formatHelpMessageArguments } from "./format-arguments.ts";
import { formatHelpMessageOptions } from "./format-options.ts";
import { formatHelpMessageCommands } from "./format-subcommands.ts";
import { helpMessageStyles } from "./styles.ts";
import { terminalMarkdown } from "./terminal-markdown.ts";

import type { Cli, Subcommand } from "../types/definitions-types.ts";
import type { HelpMessageStyle, PrintHelpOptions } from "../types/help-message-types.ts";

export interface FormatOptions extends Required<PrintHelpOptions> {
  style: HelpMessageStyle;
  longest: number;
}

function setPrintHelpOptionsDefaults(options: PrintHelpOptions) {
  const clone = { ...options };

  clone.style ??= helpMessageStyles.default;
  clone.markdownRenderer ??= "terminal";

  clone.indentBeforeName ??= 2;
  clone.indentAfterName ??= 4;
  clone.indentBeforePlaceholder ??= 1;
  clone.newLineIndent ??= 0;

  clone.emptyLines ??= 0;
  clone.emptyLinesBeforeTitle ??= 1;
  clone.emptyLinesAfterTitle ??= 0;

  clone.exampleKeyword ??= "Example";
  clone.optionalKeyword ??= "(optional)";
  clone.defaultKeyword ??= "(default: {{ value }})";

  clone.usageTitle ??= "USAGE";
  clone.descriptionTitle ??= "DESCRIPTION";
  clone.commandsTitle ??= "COMMANDS";
  clone.optionsTitle ??= "OPTIONS";
  clone.argumentsTitle ??= "ARGUMENTS";
  clone.exampleTitle ??= "EXAMPLE";

  return clone as Required<FormatOptions>;
}

export function formatCliHelpMessage(cliDefinition: Cli, printOptions: PrintHelpOptions = {}): string {
  const options = setPrintHelpOptionsDefaults(printOptions);

  const style = { ...helpMessageStyles.default, ...options.style };

  const metadata = getCliMetadata(cliDefinition);

  const formatTitle = (title: string) => indent(1) + style.title(title);

  let message = "";

  // CLI usage
  let usage = metadata.usage;
  if (!usage) {
    usage = style.punctuation("$");
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

    let description = metadata.description
      ? style.description(metadata.description)
      : terminalMarkdown(metadata.descriptionMarkdown, options.markdownRenderer, style.description);

    description = indentLines(description, options.indentBeforeName);

    message += indent(options.indentBeforeName) + description + ln(1);
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

export function formatSubcommandHelpMessage(
  commandDefinition: Subcommand,
  options: PrintHelpOptions = {},
  cliName = "",
) {
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

  return formatCliHelpMessage(asCliDefinition, options);
}
