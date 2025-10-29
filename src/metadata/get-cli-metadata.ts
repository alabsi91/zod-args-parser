import { getArgumentsMetadata } from "./get-arguments-metadata.js";
import { getOptionsMetadata } from "./get-options-metadata.js";
import { getSubcommandsMetadata } from "./get-subcommands-metadata.js";

import type { Cli, Subcommand } from "../types.js";
import type { CliMetadata } from "./metadata-types.js";

export function getCliMetadata(inputData: readonly [Cli, ...Subcommand[]]): CliMetadata {
  const [cli, ...subcommands] = inputData;

  const meta = cli.meta ?? {};

  const outputMetadata: CliMetadata = {
    name: cli.cliName,
    description: meta.description ?? "",
    usage: meta.usage ?? "",
    example: meta.example ?? "",
    allowPositionals: cli.allowPositionals ?? false,
    options: cli.options ? getOptionsMetadata(cli.options) : [],
    arguments: cli.arguments ? getArgumentsMetadata(cli.arguments) : [],
    subcommands: subcommands ? getSubcommandsMetadata(subcommands) : [],
  };

  return outputMetadata;
}
