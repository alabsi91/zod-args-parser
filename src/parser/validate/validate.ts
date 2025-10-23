import { prettifyError } from "zod/v4/core";

import { generateOrdinalSuffix, stringToBoolean } from "../../utilities.ts";
import { isBooleanSchema, safeParseSchema } from "../../zod-utilities.ts";

import type { ParsedContext } from "../parse/parse-types.js";

/** The return result object temporarily type. used inside the `parse` function */
type ResultsTemporaryType = Record<string, unknown> & {
  subcommand: string | undefined;
  positional?: string[];
  arguments?: unknown[];
  ctx: ParsedContext;
};

export function validate(parsedData: ParsedContext) {
  const results: ResultsTemporaryType = {
    subcommand: parsedData.subcommand,
    positional: parsedData.positional,
    ctx: parsedData,
  };

  // validate options
  for (const [optionName, { schema, rawValue, flag }] of Object.entries(parsedData.options)) {
    let optionsValue: string | boolean | undefined = rawValue;

    // infer boolean value if possible
    if (flag && rawValue && isBooleanSchema(schema)) {
      const booleanValue = stringToBoolean(rawValue);
      if (typeof booleanValue === "boolean") {
        const isNegated = flag.startsWith("--no");
        optionsValue = isNegated ? !booleanValue : booleanValue;
      }
    }

    const safeParseResult = safeParseSchema(schema, optionsValue);
    if (!safeParseResult.success) {
      throw new Error(`Invalid value "${rawValue}" for "${flag}": ${prettifyError(safeParseResult.error)}`, {
        cause: "zod-args-parser",
      });
    }

    results[optionName] = safeParseResult.data;
  }

  // validate arguments
  if (parsedData.arguments) {
    if (!results.arguments) results.arguments = [];

    for (const { schema, rawValue } of parsedData.arguments) {
      const argumentValue = rawValue && isBooleanSchema(schema) ? stringToBoolean(rawValue) : rawValue;

      const safeParseResult = safeParseSchema(schema, argumentValue);
      if (!safeParseResult.success) {
        throw new Error(
          `The ${generateOrdinalSuffix(results.arguments.length)} argument "${rawValue}" is invalid: ${prettifyError(safeParseResult.error)}`,
          { cause: "zod-args-parser" },
        );
      }

      results.arguments.push(safeParseResult.data);
    }
  }

  return results;
}
