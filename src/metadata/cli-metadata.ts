import { getArgumentsMetadata } from "./arguments-metadata.ts";
import { getOptionsMetadata } from "./options-metadata.ts";
import { getSubcommandsMetadata } from "./subcommands-metadata.ts";

import type { Cli } from "../types/definitions-types.ts";
import type { CliMetadata } from "../types/metadata-types.ts";

export function getCliMetadata(cliDefinition: Cli): CliMetadata {
  const subcommands = cliDefinition.subcommands ?? [];

  const meta = cliDefinition.meta ?? {};

  const outputMetadata: CliMetadata = {
    name: cliDefinition.cliName,
    description: meta.description ?? "",
    descriptionMarkdown: meta.descriptionMarkdown ?? "",
    usage: meta.usage ?? "",
    example: meta.example ?? "",
    allowPositionals: cliDefinition.allowPositionals ?? false,
    options: cliDefinition.options ? getOptionsMetadata(cliDefinition.options) : [],
    arguments: cliDefinition.arguments ? getArgumentsMetadata(cliDefinition.arguments) : [],
    subcommands: subcommands ? getSubcommandsMetadata(subcommands) : [],
  };

  return outputMetadata;
}
