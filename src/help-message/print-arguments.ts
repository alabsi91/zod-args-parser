import { indent, print, println } from "./utils.js";

import type { ArgumentMetadata } from "../metadata/metadata-types.js";
import type { PrintHelpColors } from "./colors.js";

export function printPreparedArguments(argsMetadata: ArgumentMetadata[], c: PrintHelpColors, longest: number) {
  if (!argsMetadata.length) return;

  print(c.title(" ARGUMENTS "));

  println();

  for (const metadata of argsMetadata) {
    const defaultStr =
      typeof metadata.defaultValue !== "undefined" ? `(default: ${metadata.defaultValueAsString})` : "";

    const spacing = longest + 2 - metadata.name.length;
    const normalizeDesc = metadata.description.replace(/\n/g, "\n" + indent(longest + 6) + c.punctuation("└"));

    println(
      indent(2),
      c.argument(metadata.name),
      indent(spacing),
      c.description(normalizeDesc),
      defaultStr ? c.default(defaultStr) : metadata.optional ? c.optional("(optional)") : "",
    );

    if (metadata.example) {
      const normalizeExample = metadata.example.replace(/\n/g, "\n" + indent(longest + 16));
      println(indent(longest + 5), c.punctuation("└") + c.exampleTitle("Example:"), c.example(normalizeExample));
    }
  }

  println();
}
