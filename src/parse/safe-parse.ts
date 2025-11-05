import { validateCliSchema } from "../schemas/validate-cli-schema.ts";
import { parseArgv } from "../utilities.ts";
import { createCliContext } from "./context/create-cli-context.ts";
import { findSubcommand } from "./context/parser-helpers.ts";
import { validate } from "./validate/validate.ts";

import type { Cli } from "../schemas/schema-types.ts";
import type { CliParseResult } from "../types.ts";

export function safeParse<T extends Cli>(stringOrArgv: string | string[], cli: T): CliParseResult<T> {
  const argv = typeof stringOrArgv === "string" ? parseArgv(stringOrArgv) : stringOrArgv;

  // validate input
  try {
    validateCliSchema(cli);
  } catch (error) {
    return { error: error as Error };
  }

  // Parse
  let parsedData;
  try {
    parsedData = createCliContext(argv, cli);
  } catch (error) {
    return { error: error as Error };
  }

  const subcommandObject = findSubcommand(parsedData.subcommand, cli);
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
  if (subcommandObject.action) {
    subcommandObject.action(validateResult);
  }

  return { error: undefined, value: validateResult } as CliParseResult<T>;
}

export async function safeParseAsync<T extends Cli>(
  stringOrArgv: string | string[],
  cli: T,
): Promise<CliParseResult<T>> {
  const argv = typeof stringOrArgv === "string" ? parseArgv(stringOrArgv) : stringOrArgv;

  // Parse
  let parsedData;
  try {
    parsedData = createCliContext(argv, cli);
  } catch (error) {
    return { error: error as Error };
  }

  const subcommandObject = findSubcommand(parsedData.subcommand, cli);
  if (!subcommandObject) {
    const error = new Error(`Subcommand "${parsedData.subcommand}" does not exist`, { cause: "zod-args-parser" });
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
  if (subcommandObject.action) {
    await subcommandObject.action(validateResult);
  }

  return { error: undefined, value: validateResult } as CliParseResult<T>;
}
