import { indent, print, println } from "./utils.js";

import type { SubcommandMetadata } from "src/types.js";
import type { PrintHelpColors } from "./colors.js";

export function printSubcommands(subcommandsMetadata: SubcommandMetadata[], c: PrintHelpColors, longest: number) {
  if (!subcommandsMetadata.length) return;

  print(c.title(" COMMANDS "));

  println();

  for (const metadata of subcommandsMetadata) {
    const names = metadata.aliases.concat([metadata.name]);
    const placeholder =
      metadata.placeholder || (metadata.options.length ? "[options]" : metadata.allowPositional ? "<args>" : " ");
    const normalizeDesc = metadata.description.replace(/\n/g, "\n" + indent(longest + 7) + c.punctuation("└"));

    const optLength = names.join(", ").length + placeholder.length;
    const spacing = longest + 1 - optLength;

    const coloredNames = names.map(name => c.command(name)).join(c.punctuation(", "));

    println(indent(2), coloredNames, c.placeholder(placeholder), indent(spacing), c.description(normalizeDesc));
  }

  println();
}
