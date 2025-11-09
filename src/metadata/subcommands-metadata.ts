import { getArgumentsMetadata } from "./arguments-metadata.ts";
import { getOptionsMetadata } from "./options-metadata.ts";

import type { Subcommand } from "../types/definitions-types.ts";
import type { SubcommandMetadata } from "../types/metadata-types.ts";

export function getSubcommandsMetadata(commandDefinition: readonly Subcommand[]): SubcommandMetadata[] {
  const outputMetadata: SubcommandMetadata[] = [];

  if (!commandDefinition || commandDefinition.length === 0) {
    return outputMetadata;
  }

  for (const subcommand of commandDefinition) {
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
