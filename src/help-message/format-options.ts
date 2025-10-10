import { concat, indent, insertAtEndOfFirstLine, ln } from "../utils.js";

import type { OptionMetadata } from "../metadata/metadata-types.js";
import type { HelpMsgStyle } from "../types.js";

export function formatHelpMsgOptions(optionsMetadata: OptionMetadata[], c: HelpMsgStyle, longest: number): string {
  if (!optionsMetadata.length) return "";

  let msg = c.title(" OPTIONS") + ln(1);

  for (const metadata of optionsMetadata) {
    const names = metadata.aliasesAsArgs.concat([metadata.nameAsArg]);
    const normalizeDesc = metadata.description.replace(/\n+/g, "\n" + indent(longest + 6) + c.punctuation("└"));
    const defaultStr =
      typeof metadata.defaultValue !== "undefined" ? `(default: ${metadata.defaultValueAsString})` : "";

    const optLength = names.join(", ").length + metadata.placeholder.length;
    const spacing = longest + 1 - optLength;

    const coloredNames = names.map(name => c.option(name)).join(c.punctuation(", "));

    const defaultOrOptional = defaultStr ? c.default(defaultStr) : metadata.optional ? c.optional("(optional)") : "";

    msg += concat(
      indent(2) + coloredNames,
      c.placeholder(metadata.placeholder),
      indent(spacing),
      insertAtEndOfFirstLine(c.description(normalizeDesc), defaultOrOptional),
      ln(1),
    );

    if (metadata.example) {
      const normalizeExample = metadata.example.replace(/\n+/g, "\n" + indent(longest + 16));
      msg += concat(
        indent(longest + 6) + c.punctuation("└") + c.exampleTitle("Example:"),
        c.example(normalizeExample) + ln(1),
      );
    }
  }

  msg += ln(1);

  return msg;
}
