import * as z from "zod/v4/core";

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
    const optionsValue = rawValue && isBooleanSchema(schema) ? stringToBoolean(rawValue) : rawValue;

    const res = safeParseSchema(schema, optionsValue);
    if (!res.success) {
      throw new Error(`Invalid value "${rawValue}" for "${flag}": ${z.prettifyError(res.error)}`);
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
          `The ${generateOrdinalSuffix(results.arguments.length)} argument "${rawValue}" is invalid: ${z.prettifyError(res.error)}`,
        );
      }

      results.arguments.push(res.data);
    }
  }

  return results;
}
