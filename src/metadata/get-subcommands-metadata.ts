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

    outputMetadata.push({
      name: subcommand.name,
      aliases: subcommand.aliases ?? [],
      description: subcommand.description ?? "",
      placeholder: subcommand.placeholder ?? "",
      usage: subcommand.usage ?? "",
      example: subcommand.example ?? "",
      allowPositional: subcommand.allowPositional ?? false,
      options: optionsMetadata,
      arguments: argumentsMetadata,
    });
  }

  return outputMetadata;
}
