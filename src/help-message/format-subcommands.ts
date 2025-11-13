import { indent, indentLines, ln, subcommandPlaceholder } from "../utilities/utilities.ts";
import { terminalMarkdown } from "./terminal-markdown.ts";

import type { SubcommandMetadata } from "../types/metadata-types.ts";
import type { FormatOptions } from "./generate-for-cli.ts";

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
    markdownRenderer,
  } = options;

  let message = ln(emptyLinesBeforeTitle) + indent(1) + style.title(commandsTitle) + ln(1 + emptyLinesAfterTitle);

  // the space from the beginning to the start of the next column.
  const totalSpacing = longest + indentBeforeName + indentAfterName + indentBeforePlaceholder + newLineIndent;

  for (const metadata of subcommandsMetadata) {
    if (metadata.hidden) continue;

    const names = metadata.aliases.concat([metadata.name]);
    const placeholder = subcommandPlaceholder(metadata);

    let description = metadata.description
      ? style.description(metadata.description)
      : terminalMarkdown(metadata.descriptionMarkdown, markdownRenderer, style.description);

    description = indentLines(description, totalSpacing);

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
      description +
      ln(1 + emptyLines);
  }

  return message;
}
