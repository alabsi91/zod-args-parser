import { indent, indentLines, insertAtEndOfFirstLine, ln } from "../utilities.ts";
import { terminalMarkdown } from "./terminal-markdown.ts";

import type { ArgumentMetadata } from "../types/metadata-types.ts";
import type { FormatOptions } from "./format-cli.ts";

export function formatHelpMessageArguments(argumentsMetadata: ArgumentMetadata[], options: FormatOptions): string {
  if (argumentsMetadata.length === 0) return "";

  const {
    style,
    indentBeforeName,
    indentAfterName,
    indentBeforePlaceholder,
    newLineIndent,
    longest,
    argumentsTitle,
    defaultKeyword,
    optionalKeyword,
    exampleKeyword,
    emptyLines,
    emptyLinesBeforeTitle,
    emptyLinesAfterTitle,
    markdownRenderer,
  } = options;

  let message = ln(emptyLinesBeforeTitle) + indent(1) + style.title(argumentsTitle) + ln(1 + emptyLinesAfterTitle);

  // the space from the beginning to the start of the next column.
  const totalSpacing = longest + indentBeforeName + indentAfterName + indentBeforePlaceholder + newLineIndent;

  for (const metadata of argumentsMetadata) {
    if (metadata.hidden) continue;

    let description = metadata.description
      ? style.description(metadata.description)
      : terminalMarkdown(metadata.descriptionMarkdown, markdownRenderer, style.description);

    description = indentLines(description, totalSpacing);

    let defaultOrOptional = "";

    if (metadata.defaultValueAsString) {
      defaultOrOptional = style.default(defaultKeyword.replace("{{ value }}", metadata.defaultValueAsString));
    }

    if (metadata.optional && !defaultOrOptional) {
      defaultOrOptional = style.optional(optionalKeyword);
    }

    const spacing = longest - metadata.name.length;

    message +=
      indent(indentBeforeName) +
      style.argument(metadata.name) +
      indent(indentBeforePlaceholder + indentAfterName) +
      indent(spacing) +
      insertAtEndOfFirstLine(description, defaultOrOptional) +
      ln(1 + emptyLines);

    if (metadata.example) {
      const normalizeExample = indentLines(metadata.example, totalSpacing + exampleKeyword.length + 1); // +1 for the space after the keyword
      message +=
        indent(totalSpacing) + style.exampleTitle(exampleKeyword) + indent(1) + style.example(normalizeExample) + ln(1);
    }
  }

  return message;
}
