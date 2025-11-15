import { validateArguments } from "./validators/arguments.ts";
import { validateOptions } from "./validators/options.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Cli, Subcommand } from "../../types/definitions-types.ts";
import type { OutputTypeWide } from "../../types/io-types.ts";

/** @throws {CliError} */
export function validate(context: ContextWide, commandDefinition: Subcommand | Cli) {
  const output: OutputTypeWide = {
    subcommand: context.subcommand,
    positionals: context.positionals,
    context: context,
  };

  // validate options
  validateOptions({ commandDefinition, context, output });

  // validate arguments
  validateArguments({ commandDefinition, context, output });

  return output;
}
