import { prettifyError } from "zod/v4";

import { generateOrdinalSuffix, stringToBoolean } from "../../utils.js";
import { isBooleanSchema, safeParseSchema } from "../../zod-utils.js";

import type { ParseCtx } from "../parse/parse-types.js";

/** The return result object temporarily type. used inside the `parse` function */
type ResultsTempType = Record<string, unknown> & {
  subcommand: string | undefined;
  positional?: string[];
  arguments?: unknown[];
  ctx: ParseCtx;
};

export function validate(parsedData: ParseCtx) {
  const results: ResultsTempType = {
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

    const res = safeParseSchema(schema, optionsValue);
    if (!res.success) {
      throw new Error(`Invalid value "${rawValue}" for "${flag}": ${prettifyError(res.error)}`, {
        cause: "zod-args-parser",
      });
    }

    results[optionName] = res.data;
  }

  // validate arguments
  if (parsedData.arguments) {
    if (!results.arguments) results.arguments = [];

    for (const { schema, rawValue } of parsedData.arguments) {
      const argValue = rawValue && isBooleanSchema(schema) ? stringToBoolean(rawValue) : rawValue;

      const res = safeParseSchema(schema, argValue);
      if (!res.success) {
        throw new Error(
          `The ${generateOrdinalSuffix(results.arguments.length)} argument "${rawValue}" is invalid: ${prettifyError(res.error)}`,
          { cause: "zod-args-parser" },
        );
      }

      results.arguments.push(res.data);
    }
  }

  return results;
}
