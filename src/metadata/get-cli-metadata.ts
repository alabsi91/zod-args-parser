import { getArgumentsMetadata } from "./get-arguments-metadata.js";
import { getOptionsMetadata } from "./get-options-metadata.js";
import { getSubcommandsMetadata } from "./get-subcommands-metadata.js";

import type { Cli, Subcommand } from "../types.js";
import type { CliMetadata } from "./metadata-types.js";

export function getCliMetadata(inputData: readonly [Cli, ...Subcommand[]]): CliMetadata {
  const [cli, ...subcommands] = inputData;

  const outputMetadata: CliMetadata = {
    name: cli.cliName,
    description: cli.description ?? "",
    usage: cli.usage ?? "",
    example: cli.example ?? "",
    allowPositional: cli.allowPositional ?? false,
    options: cli.options ? getOptionsMetadata(cli.options) : [],
    arguments: cli.arguments ? getArgumentsMetadata(cli.arguments) : [],
    subcommands: subcommands ? getSubcommandsMetadata(subcommands) : [],
  };

  return outputMetadata;
}
