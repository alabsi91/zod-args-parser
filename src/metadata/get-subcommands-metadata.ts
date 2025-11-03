import { getArgumentsMetadata } from "./get-arguments-metadata.ts";
import { getOptionsMetadata } from "./get-options-metadata.ts";

import type { Subcommand } from "../schemas/schema-types.ts";
import type { SubcommandMetadata } from "./metadata-types.ts";

export function getSubcommandsMetadata(subcommands: readonly Subcommand[]): SubcommandMetadata[] {
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
      descriptionMarkdown: meta.descriptionMarkdown ?? "",
      placeholder: meta.placeholder ?? "",
      usage: meta.usage ?? "",
      example: meta.example ?? "",
      allowPositionals: subcommand.allowPositionals ?? false,
      options: optionsMetadata,
      arguments: argumentsMetadata,
      hidden: meta.hidden ?? false,
    });
  }

  return outputMetadata;
}
