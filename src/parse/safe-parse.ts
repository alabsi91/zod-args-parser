import { validateCliSchema } from "../schemas/validate-cli-schema.ts";
import { parseArgv } from "../utilities.ts";
import { createCliContext } from "./context/create-cli-context.ts";
import { findSubcommand } from "./context/parser-helpers.ts";
import { validate } from "./validate/validate.ts";

import type { Cli } from "../schemas/schema-types.ts";
import type { SafeParseResult } from "../types.ts";

export function safeParse<T extends Cli>(stringOrArgv: string | string[], cli: T): SafeParseResult<T> {
  const argv = typeof stringOrArgv === "string" ? parseArgv(stringOrArgv) : stringOrArgv;

  // validate input
  try {
    validateCliSchema(cli);
  } catch (error) {
    return { success: false, error: error as Error };
  }

  // Parse
  let parsedData;
  try {
    parsedData = createCliContext(argv, cli);
  } catch (error) {
    return { success: false, error: error as Error };
  }

  const subcommandObject = findSubcommand(parsedData.subcommand, cli);
  if (!subcommandObject) {
    const error = new Error(`Subcommand "${parsedData.subcommand}" does not exist`, { cause: "zod-args-parser" });
    return { success: false, error };
  }

  // Fire preValidation hook (throw errors caused by the usage of the preValidation hook)
  if (subcommandObject.preValidation) {
    subcommandObject.preValidation(parsedData);
  }

  // Validate
  let validateResult;
  try {
    validateResult = validate(parsedData, subcommandObject);
  } catch (error) {
    return { success: false, error: error as Error };
  }

  // Fire action (throw errors caused by the usage of the action hook)
  if (subcommandObject.action) {
    subcommandObject.action(validateResult);
  }

  return { success: true, data: validateResult } as SafeParseResult<T>;
}

export async function safeParseAsync<T extends Cli>(argv: string[], cli: T): Promise<SafeParseResult<T>> {
  // Parse
  let parsedData;
  try {
    parsedData = createCliContext(argv, cli);
  } catch (error) {
    return { success: false, error: error as Error };
  }

  const subcommandObject = findSubcommand(parsedData.subcommand, cli);
  if (!subcommandObject) {
    const error = new Error(`Subcommand "${parsedData.subcommand}" does not exist`, { cause: "zod-args-parser" });
    return { success: false, error };
  }

  // Fire preValidation hook (throw errors caused by the usage of the preValidation hook)
  if (subcommandObject.preValidation) {
    await subcommandObject.preValidation(parsedData);
  }

  // Validate
  let validateResult;
  try {
    validateResult = validate(parsedData, subcommandObject);
  } catch (error) {
    return { success: false, error: error as Error };
  }

  // Fire action (throw errors caused by the usage of the action hook)
  if (subcommandObject.action) {
    await subcommandObject.action(validateResult);
  }

  return { success: true, data: validateResult } as SafeParseResult<T>;
}
