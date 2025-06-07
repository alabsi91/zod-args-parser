import { getOptionsMetadata } from "./get-options-metadata.js";
import { getArgumentsMetadata } from "./get-arguments-metadata.js";
import { getSubcommandsMetadata } from "./get-subcommands-metadata.js";

import type { Cli, CliMetadata, Subcommand } from "../types.js";

export function getCliMetadata(inputData: [Cli, ...Subcommand[]]): CliMetadata {
  const [cli, ...subcommands] = inputData;

  const outputMetadata: CliMetadata = {
    name: cli.cliName,
    description: cli.description ?? "",
    placeholder: cli.placeholder ?? "",
    usage: cli.usage ?? "",
    example: cli.example ?? "",
    allowPositional: cli.allowPositional ?? false,
    options: cli.options ? getOptionsMetadata(cli.options) : [],
    arguments: cli.arguments ? getArgumentsMetadata(cli.arguments) : [],
    subcommands: subcommands ? getSubcommandsMetadata(subcommands) : [],
  };

  return outputMetadata;
}
