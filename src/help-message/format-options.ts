import { concat, indent, insertAtEndOfFirstLine, ln } from "../utilities.ts";

import type { OptionMetadata } from "../metadata/metadata-types.js";
import type { HelpMessageStyle } from "../types.js";

export function formatHelpMessageOptions(
  optionsMetadata: OptionMetadata[],
  c: HelpMessageStyle,
  longest: number,
): string {
  if (optionsMetadata.length === 0) return "";

  let message = c.title(" OPTIONS") + ln(1);

  for (const metadata of optionsMetadata) {
    const names = metadata.aliasesAsArgs.concat([metadata.nameAsArg]);
    const normalizeDesc = metadata.description.replace(/\n+/g, "\n" + indent(longest + 6) + c.punctuation("└"));
    const defaultString = metadata.defaultValue === undefined ? "" : `(default: ${metadata.defaultValueAsString})`;

    const optLength = names.join(", ").length + metadata.placeholder.length;
    const spacing = longest + 1 - optLength;

    const coloredNames = names.map(name => c.option(name)).join(c.punctuation(", "));

    const defaultOrOptional = defaultString
      ? c.default(defaultString)
      : metadata.optional
        ? c.optional("(optional)")
        : "";

    message += concat(
      indent(2) + coloredNames,
      c.placeholder(metadata.placeholder),
      indent(spacing),
      insertAtEndOfFirstLine(c.description(normalizeDesc), defaultOrOptional),
      ln(1),
    );

    if (metadata.example) {
      const normalizeExample = metadata.example.replace(/\n+/g, "\n" + indent(longest + 16));
      message += concat(
        indent(longest + 6) + c.punctuation("└") + c.exampleTitle("Example:"),
        c.example(normalizeExample) + ln(1),
      );
    }
  }

  message += ln(1);

  return message;
}
