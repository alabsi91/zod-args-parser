import { indent, ln, withNewLine } from "./utils.js";

import type { SubcommandMetadata } from "../metadata/metadata-types.js";
import type { HelpMsgStyleRequired as HelpMsgStyle } from "./styles.js";

export function formatHelpMsgCommands(
  subcommandsMetadata: SubcommandMetadata[],
  c: HelpMsgStyle,
  longest: number,
): string {
  if (!subcommandsMetadata.length) return "";

  let msg = c.title(" COMMANDS ");

  msg += ln(1);

  for (const metadata of subcommandsMetadata) {
    const names = metadata.aliases.concat([metadata.name]);
    const placeholder =
      metadata.placeholder || (metadata.options.length ? "[options]" : metadata.allowPositional ? "<args>" : " ");
    const normalizeDesc = metadata.description.replace(/\n/g, "\n" + indent(longest + 7) + c.punctuation("└"));

    const optLength = names.join(", ").length + placeholder.length;
    const spacing = longest + 1 - optLength;

    const coloredNames = names.map(name => c.command(name)).join(c.punctuation(", "));

    msg += withNewLine(
      indent(2),
      coloredNames,
      c.placeholder(placeholder),
      indent(spacing),
      c.description(normalizeDesc),
    );
  }

  msg += ln(1);

  return msg;
}
