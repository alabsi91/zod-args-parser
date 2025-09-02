import { indent, withNewLine } from "./utils.js";

import type { ArgumentMetadata } from "../metadata/metadata-types.js";
import type { HelpMsgStyleRequired as HelpMsgStyle } from "./styles.js";

export function formatHelpMsgArguments(argsMetadata: ArgumentMetadata[], c: HelpMsgStyle, longest: number): string {
  if (!argsMetadata.length) return "";

  let msg = c.title(" ARGUMENTS ");

  msg += withNewLine();

  for (const metadata of argsMetadata) {
    const defaultStr =
      typeof metadata.defaultValue !== "undefined" ? `(default: ${metadata.defaultValueAsString})` : "";

    const spacing = longest + 2 - metadata.name.length;
    const normalizeDesc = metadata.description.replace(/\n/g, "\n" + indent(longest + 6) + c.punctuation("└"));

    msg += withNewLine(
      indent(2),
      c.argument(metadata.name),
      indent(spacing),
      c.description(normalizeDesc),
      defaultStr ? c.default(defaultStr) : metadata.optional ? c.optional("(optional)") : "",
    );

    if (metadata.example) {
      const normalizeExample = metadata.example.replace(/\n/g, "\n" + indent(longest + 16));
      msg += withNewLine(
        indent(longest + 5),
        c.punctuation("└") + c.exampleTitle("Example:"),
        c.example(normalizeExample),
      );
    }
  }

  msg += withNewLine();

  return msg;
}
