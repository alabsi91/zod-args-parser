import { concat, indent, ln } from "../utils.js";

import type { SubcommandMetadata } from "../metadata/metadata-types.js";
import type { HelpMsgStyle } from "../types.js";

export function formatHelpMsgCommands(
  subcommandsMetadata: SubcommandMetadata[],
  c: HelpMsgStyle,
  longest: number,
): string {
  if (!subcommandsMetadata.length) return "";

  let msg = c.title(" COMMANDS") + ln(1);

  for (const metadata of subcommandsMetadata) {
    const names = metadata.aliases.concat([metadata.name]);
    const placeholder =
      metadata.placeholder || (metadata.options.length ? "[options]" : metadata.allowPositional ? "<args>" : " ");
    const normalizeDesc = metadata.description.replace(/\n/g, "\n" + indent(longest + 7) + c.punctuation("└"));

    const optLength = names.join(", ").length + placeholder.length;
    const spacing = longest + 1 - optLength;

    const coloredNames = names.map(name => c.command(name)).join(c.punctuation(", "));

    msg += concat(
      indent(2) + coloredNames,
      c.placeholder(placeholder),
      indent(spacing),
      c.description(normalizeDesc) + ln(1),
    );
  }

  msg += ln(1);

  return msg;
}
