import { indent, indentLines, ln, subcommandPlaceholder } from "../utilities.ts";

import type { SubcommandMetadata } from "../metadata/metadata-types.ts";
import type { FormatOptions } from "./format-cli.ts";
import { terminalMarkdown } from "./terminal-markdown.ts";

export function formatHelpMessageCommands(subcommandsMetadata: SubcommandMetadata[], options: FormatOptions): string {
  if (subcommandsMetadata.length === 0) return "";

  const {
    style,
    indentBeforeName,
    indentAfterName,
    indentBeforePlaceholder,
    newLineIndent,
    longest,
    commandsTitle,
    emptyLines,
    emptyLinesBeforeTitle,
    emptyLinesAfterTitle,
  } = options;

  let message = ln(emptyLinesBeforeTitle) + indent(1) + style.title(commandsTitle) + ln(1 + emptyLinesAfterTitle);

  // the space from the beginning to the start of the next column.
  const totalSpacing = longest + indentBeforeName + indentAfterName + indentBeforePlaceholder + newLineIndent;

  for (const metadata of subcommandsMetadata) {
    if (metadata.hidden) continue;

    const names = metadata.aliases.concat([metadata.name]);
    const placeholder = subcommandPlaceholder(metadata);

    const normalizedDesc = indentLines(
      metadata.description || terminalMarkdown(metadata.descriptionMarkdown),
      totalSpacing,
    );

    const optLength = names.join(", ").length + placeholder.length;
    const spacing = longest - optLength;

    const coloredNames = names.map(name => style.command(name)).join(style.punctuation(", "));

    message +=
      indent(indentBeforeName) +
      coloredNames +
      indent(indentBeforePlaceholder) +
      style.placeholder(placeholder) +
      indent(indentAfterName) +
      indent(spacing) +
      style.description(normalizedDesc) +
      ln(1 + emptyLines);
  }

  return message;
}
