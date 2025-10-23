import { concat, indent, ln, subcommandPlaceholder } from "../utilities.js";

import type { SubcommandMetadata } from "../metadata/metadata-types.js";
import type { HelpMessageStyle } from "../types.js";

export function formatHelpMessageCommands(
  subcommandsMetadata: SubcommandMetadata[],
  c: HelpMessageStyle,
  longest: number,
): string {
  if (subcommandsMetadata.length === 0) return "";

  let message = c.title(" COMMANDS") + ln(1);

  for (const metadata of subcommandsMetadata) {
    const names = metadata.aliases.concat([metadata.name]);
    const placeholder = subcommandPlaceholder(metadata);
    const normalizeDesc = metadata.description.replace(/\n+/g, "\n" + indent(longest + 6) + c.punctuation("└"));

    const optLength = names.join(", ").length + placeholder.length;
    const spacing = longest + 1 - optLength;

    const coloredNames = names.map(name => c.command(name)).join(c.punctuation(", "));

    message += concat(
      indent(2) + coloredNames,
      c.placeholder(placeholder),
      indent(spacing),
      c.description(normalizeDesc) + ln(1),
    );
  }

  message += ln(1);

  return message;
}
