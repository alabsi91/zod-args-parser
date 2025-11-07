import { validateCliDefinition } from "../definitions/validate-cli-definition.ts";
import { parseArgv } from "../utilities.ts";
import { createCliContext } from "./create-cli-context.ts";
import { findSubcommandDefinition } from "./parser-helpers.ts";
import { validate } from "./validate-context/validate-context.ts";

import type { Cli } from "../types/definitions-types.ts";
import type { CliParseResult } from "../types/types.ts";

export function safeParse<T extends Cli>(stringOrArgv: string | string[], cliDefinition: T): CliParseResult<T> {
  const argv = typeof stringOrArgv === "string" ? parseArgv(stringOrArgv) : stringOrArgv;

  // validate input
  try {
    validateCliDefinition(cliDefinition);
  } catch (error) {
    return { error: error as Error };
  }

  // Parse
  let parsedData;
  try {
    parsedData = createCliContext(argv, cliDefinition);
  } catch (error) {
    return { error: error as Error };
  }

  const subcommandObject = findSubcommandDefinition(parsedData.subcommand, cliDefinition);
  if (!subcommandObject) {
    const error = new Error(`Subcommand "${parsedData.subcommand}" does not exist`);
    return { error };
  }

  // Validate
  let validateResult;
  try {
    validateResult = validate(parsedData, subcommandObject);
  } catch (error) {
    return { error: error as Error };
  }

  // Fire action (throw errors caused by the usage of the action hook)
  if (subcommandObject._onExecute) {
    for (const handler of subcommandObject._onExecute) {
      handler(validateResult);
    }
  }

  return { error: undefined, value: validateResult } as CliParseResult<T>;
}

export async function safeParseAsync<T extends Cli>(
  stringOrArgv: string | string[],
  cliDefinition: T,
): Promise<CliParseResult<T>> {
  const argv = typeof stringOrArgv === "string" ? parseArgv(stringOrArgv) : stringOrArgv;

  // Parse
  let parsedData;
  try {
    parsedData = createCliContext(argv, cliDefinition);
  } catch (error) {
    return { error: error as Error };
  }

  const subcommandObject = findSubcommandDefinition(parsedData.subcommand, cliDefinition);
  if (!subcommandObject) {
    const error = new Error(`Subcommand "${parsedData.subcommand}" does not exist`);
    return { error };
  }

  // Validate
  let validateResult;
  try {
    validateResult = validate(parsedData, subcommandObject);
  } catch (error) {
    return { error: error as Error };
  }

  // Fire action (throw errors caused by the usage of the action hook)
  if (subcommandObject._onExecute) {
    for (const handler of subcommandObject._onExecute) {
      // eslint-disable-next-line @typescript-eslint/await-thenable
      await handler(validateResult);
    }
  }

  return { error: undefined, value: validateResult } as CliParseResult<T>;
}
