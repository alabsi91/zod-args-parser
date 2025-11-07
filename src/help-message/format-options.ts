import { indent, indentLines, insertAtEndOfFirstLine, ln } from "../utilities.ts";
import { terminalMarkdown } from "./terminal-markdown.ts";

import type { OptionMetadata } from "../types/metadata-types.ts";
import type { FormatOptions } from "./format-cli.ts";

export function formatHelpMessageOptions(optionsMetadata: OptionMetadata[], options: FormatOptions): string {
  if (optionsMetadata.length === 0) return "";

  const {
    style,
    indentBeforeName,
    indentAfterName,
    indentBeforePlaceholder,
    newLineIndent,
    emptyLines,
    longest,
    exampleKeyword,
    optionalKeyword,
    defaultKeyword,
    optionsTitle,
    emptyLinesBeforeTitle,
    emptyLinesAfterTitle,
    markdownRenderer,
  } = options;

  let message = ln(emptyLinesBeforeTitle) + indent(1) + style.title(optionsTitle) + ln(1 + emptyLinesAfterTitle);

  // the space from the beginning to the start of the next column.
  const totalSpacing = longest + indentBeforeName + indentAfterName + indentBeforePlaceholder + newLineIndent;

  for (const metadata of optionsMetadata) {
    if (metadata.hidden) continue;

    const names = [...metadata.aliasesAsArgs, metadata.nameAsArg];
    const coloredNames = names.map(name => style.option(name)).join(style.punctuation(", "));

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

    // space between the option and the description
    const optLength = names.join(", ").length + metadata.placeholder.length;
    const spacing = longest - optLength;

    message +=
      indent(indentBeforeName) +
      coloredNames +
      indent(indentBeforePlaceholder) +
      style.placeholder(metadata.placeholder) +
      indent(indentAfterName) +
      indent(spacing) +
      insertAtEndOfFirstLine(description, defaultOrOptional) +
      ln(1 + emptyLines);

    if (metadata.example) {
      const normalizeExample = indentLines(metadata.example, totalSpacing + exampleKeyword.length + 1); // + 1 for the space after the keyword
      message +=
        indent(totalSpacing) + style.exampleTitle(exampleKeyword) + indent(1) + style.example(normalizeExample) + ln(1);
    }
  }

  return message;
}
