import { validateCliDefinition } from "../definitions/validate-cli-definition.ts";
import { parseArgv } from "../utilities/parse-argv.ts";
import { buildCliContext } from "./context/cli-context-builder.ts";
import { findSubcommandDefinition } from "./parser-utilities.ts";
import { validate } from "./validation/validate-context.ts";

import type { Cli } from "../types/definitions-types.ts";
import type { CliParseResultWide } from "../types/types.ts";

export function safeParse(stringOrArgv: string | string[], cliDefinition: Cli): CliParseResultWide {
  const core = safeParseCore(stringOrArgv, cliDefinition);
  if (core.error) return { error: core.error };

  const { validateResult, subcommandObject } = core;

  // Fire action (throw errors caused by the usage of the action hook)
  if (subcommandObject._onExecute) {
    for (const handler of subcommandObject._onExecute) {
      void handler(validateResult);
    }
  }

  return { error: undefined, value: validateResult };
}

export async function safeParseAsync(stringOrArgv: string | string[], cliDefinition: Cli): Promise<CliParseResultWide> {
  const core = safeParseCore(stringOrArgv, cliDefinition);
  if (core.error) return { error: core.error };

  const { validateResult, subcommandObject } = core;

  // Fire action (throw errors caused by the usage of the action hook)
  if (subcommandObject._onExecute) {
    await Promise.all(subcommandObject._onExecute.map(async handler => await handler(validateResult)));
  }

  return { error: undefined, value: validateResult };
}

function safeParseCore(stringOrArgv: string | string[], cliDefinition: Cli) {
  const argv = typeof stringOrArgv === "string" ? parseArgv(stringOrArgv) : stringOrArgv;

  // validate cli definition
  try {
    validateCliDefinition(cliDefinition);
  } catch (error) {
    return { error: error as Error };
  }

  // Parse
  let cliContext;
  try {
    cliContext = buildCliContext(argv, cliDefinition);
  } catch (error) {
    return { error: error as Error };
  }

  const subcommandObject = findSubcommandDefinition(cliContext.subcommand, cliDefinition);
  if (!subcommandObject) {
    const error = new Error(`Subcommand "${cliContext.subcommand}" does not exist`);
    return { error };
  }

  // Validate context
  let validateResult;
  try {
    validateResult = validate(cliContext, subcommandObject);
  } catch (error) {
    return { error: error as Error };
  }

  return { error: undefined, validateResult, subcommandObject };
}
