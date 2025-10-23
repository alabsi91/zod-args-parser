import { concat, indent, insertAtEndOfFirstLine, ln } from "../utilities.ts";

import type { ArgumentMetadata } from "../metadata/metadata-types.js";
import type { HelpMessageStyle } from "../types.js";

export function formatHelpMessageArguments(
  argumentsMetadata: ArgumentMetadata[],
  c: HelpMessageStyle,
  longest: number,
): string {
  if (argumentsMetadata.length === 0) return "";

  let message = c.title(" ARGUMENTS") + ln(1);

  for (const metadata of argumentsMetadata) {
    const defaultString = metadata.defaultValue === undefined ? "" : `(default: ${metadata.defaultValueAsString})`;

    const spacing = longest + 2 - metadata.name.length;
    const normalizeDesc = metadata.description.replace(/\n+/g, "\n" + indent(longest + 6) + c.punctuation("└"));
    const defaultOrOptional = defaultString
      ? c.default(defaultString)
      : metadata.optional
        ? c.optional("(optional)")
        : "";

    message += concat(
      indent(2) + c.argument(metadata.name),
      indent(spacing),
      insertAtEndOfFirstLine(c.description(normalizeDesc), defaultOrOptional),
      ln(1),
    );

    if (metadata.example) {
      const normalizeExample = metadata.example.replace(/\n+/g, "\n" + indent(longest + 16));
      message += concat(
        indent(longest + 5),
        c.punctuation("└") + c.exampleTitle("Example:"),
        c.example(normalizeExample) + ln(1),
      );
    }
  }

  message += ln(1);

  return message;
}
