import { concat, indent, ln } from "../utils.js";

import type { ArgumentMetadata } from "../metadata/metadata-types.js";
import type { HelpMsgStyleRequired as HelpMsgStyle } from "./styles.js";

export function formatHelpMsgArguments(argsMetadata: ArgumentMetadata[], c: HelpMsgStyle, longest: number): string {
  if (!argsMetadata.length) return "";

  let msg = c.title(" ARGUMENTS") + ln(1);

  for (const metadata of argsMetadata) {
    const defaultStr =
      typeof metadata.defaultValue !== "undefined" ? `(default: ${metadata.defaultValueAsString})` : "";

    const spacing = longest + 2 - metadata.name.length;
    const normalizeDesc = metadata.description.replace(/\n/g, "\n" + indent(longest + 6) + c.punctuation("└"));

    msg += concat(
      indent(2) + c.argument(metadata.name),
      indent(spacing),
      c.description(normalizeDesc),
      (defaultStr ? c.default(defaultStr) : metadata.optional ? c.optional("(optional)") : "") + ln(1),
    );

    if (metadata.example) {
      const normalizeExample = metadata.example.replace(/\n/g, "\n" + indent(longest + 16));
      msg += concat(
        indent(longest + 5),
        c.punctuation("└") + c.exampleTitle("Example:"),
        c.example(normalizeExample) + ln(1),
      );
    }
  }

  msg += ln(1);

  return msg;
}
