import { indent, print, println } from "./utils.js";

import type { PrintHelpColors } from "./colors.js";
import type { OptionMetadata } from "../types.js";

export function printOptions(optionsMetadata: OptionMetadata[], c: PrintHelpColors, longest: number) {
  if (!optionsMetadata.length) return;

  print(c.title(" OPTIONS "));

  println();

  for (const metadata of optionsMetadata) {
    const names = metadata.aliasesAsArgs.concat([metadata.nameAsArg]);
    const normalizeDesc = metadata.description.replace(/\n/g, "\n" + indent(longest + 7) + c.punctuation("└"));
    const defaultStr =
      typeof metadata.defaultValue !== "undefined" ? `(default: ${metadata.defaultValueAsString})` : "";

    const optLength = names.join(", ").length + metadata.placeholder.length;
    const spacing = longest + 1 - optLength;

    const coloredNames = names.map(name => c.option(name)).join(c.punctuation(", "));

    println(
      indent(2),
      coloredNames,
      c.placeholder(metadata.placeholder),
      indent(spacing),
      c.description(normalizeDesc),
      defaultStr ? c.default(defaultStr) : metadata.optional ? c.optional("(optional)") : "",
    );

    if (metadata.example) {
      const normalizeExample = metadata.example.replace(/\n/g, "\n" + indent(longest + 17));
      println(indent(longest + 6), c.punctuation("└") + c.exampleTitle("Example:"), c.example(normalizeExample));
    }
  }

  println();
}
