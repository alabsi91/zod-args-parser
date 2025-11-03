import { getArgumentsMetadata } from "./get-arguments-metadata.ts";
import { getOptionsMetadata } from "./get-options-metadata.ts";
import { getSubcommandsMetadata } from "./get-subcommands-metadata.ts";

import type { Cli } from "../schemas/schema-types.ts";
import type { CliMetadata } from "./metadata-types.ts";

export function getCliMetadata(cli: Cli): CliMetadata {
  const subcommands = cli.subcommands ?? [];

  const meta = cli.meta ?? {};

  const outputMetadata: CliMetadata = {
    name: cli.cliName,
    description: meta.description ?? "",
    descriptionMarkdown: meta.descriptionMarkdown ?? "",
    usage: meta.usage ?? "",
    example: meta.example ?? "",
    allowPositionals: cli.allowPositionals ?? false,
    options: cli.options ? getOptionsMetadata(cli.options) : [],
    arguments: cli.arguments ? getArgumentsMetadata(cli.arguments) : [],
    subcommands: subcommands ? getSubcommandsMetadata(subcommands) : [],
  };

  return outputMetadata;
}
