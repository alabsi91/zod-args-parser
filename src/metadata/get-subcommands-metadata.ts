import { getArgumentsMetadata } from "./get-arguments-metadata.js";
import { getOptionsMetadata } from "./get-options-metadata.js";

import type { Subcommand } from "../types.js";
import type { SubcommandMetadata } from "./metadata-types.js";

export function getSubcommandsMetadata(subcommands: Subcommand[]): SubcommandMetadata[] {
  const outputMetadata: SubcommandMetadata[] = [];

  if (!subcommands || subcommands.length === 0) {
    return outputMetadata;
  }

  for (const subcommand of subcommands) {
    const optionsMetadata = subcommand.options ? getOptionsMetadata(subcommand.options) : [];
    const argumentsMetadata = subcommand.arguments ? getArgumentsMetadata(subcommand.arguments) : [];
    const meta = subcommand.meta ?? {};

    outputMetadata.push({
      name: subcommand.name,
      aliases: subcommand.aliases ?? [],
      description: meta.description ?? "",
      placeholder: meta.placeholder ?? "",
      usage: meta.usage ?? "",
      example: meta.example ?? "",
      allowPositionals: subcommand.allowPositionals ?? false,
      options: optionsMetadata,
      arguments: argumentsMetadata,
    });
  }

  return outputMetadata;
}
