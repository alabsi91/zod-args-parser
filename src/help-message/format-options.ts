import { indent, ln, withNewLine } from "./utils.js";

import type { OptionMetadata } from "../metadata/metadata-types.js";
import type { HelpMsgStyleRequired as HelpMsgStyle } from "./styles.js";

export function formatHelpMsgOptions(optionsMetadata: OptionMetadata[], c: HelpMsgStyle, longest: number): string {
  if (!optionsMetadata.length) return "";

  let msg = c.title(" OPTIONS ");

  msg += withNewLine();

  for (const metadata of optionsMetadata) {
    const names = metadata.aliasesAsArgs.concat([metadata.nameAsArg]);
    const normalizeDesc = metadata.description.replace(/\n/g, "\n" + indent(longest + 7) + c.punctuation("└"));
    const defaultStr =
      typeof metadata.defaultValue !== "undefined" ? `(default: ${metadata.defaultValueAsString})` : "";

    const optLength = names.join(", ").length + metadata.placeholder.length;
    const spacing = longest + 1 - optLength;

    const coloredNames = names.map(name => c.option(name)).join(c.punctuation(", "));

    msg += withNewLine(
      indent(2),
      coloredNames,
      c.placeholder(metadata.placeholder),
      indent(spacing),
      c.description(normalizeDesc),
      defaultStr ? c.default(defaultStr) : metadata.optional ? c.optional("(optional)") : "",
    );

    if (metadata.example) {
      const normalizeExample = metadata.example.replace(/\n/g, "\n" + indent(longest + 17));
      msg += withNewLine(
        indent(longest + 6),
        c.punctuation("└") + c.exampleTitle("Example:"),
        c.example(normalizeExample),
      );
    }
  }

  msg += ln(1);

  return msg;
}
