import { validateSync } from "../../schemas/schema-utilities.ts";
import { generateOrdinalSuffix } from "../../utilities.ts";

import type { Cli, Subcommand } from "../../schemas/schema-types.ts";
import type { OutputTypeWide } from "../../types.ts";
import type { ContextWide } from "../context/context-types.ts";

/** @throws {Error} */
export function validate(parsedData: ContextWide, subcommand: Subcommand | Cli) {
  const result: OutputTypeWide = {
    subcommand: parsedData.subcommand,
    positionals: parsedData.positionals,
    context: parsedData,
  };

  // validate options
  if (parsedData.options) {
    result.options ??= {};

    if (!subcommand.options) {
      throw new Error(`Subcommand "${parsedData.subcommand}" does not have options`);
    }

    for (const [optionName, { passedValue, stringValue, name, flag, source, schema }] of Object.entries(
      parsedData.options,
    )) {
      const option = subcommand.options[optionName];
      if (!option) {
        throw new Error(`Subcommand "${parsedData.subcommand}" does not have option "${optionName}"`);
      }

      const isProgrammatic = source === "programmatic";

      const safeParseResult = isProgrammatic ? validateSync(schema, passedValue) : option.type.validate(stringValue);
      if (safeParseResult.issues) {
        throw new Error(
          `Invalid value ${isProgrammatic ? "" : `"${stringValue}"`} for "${isProgrammatic ? name : flag}": ${safeParseResult.issues.map(issue => issue.message).join(", ")}`,
        );
      }

      result.options[optionName] = safeParseResult.value;
    }
  }

  // validate arguments
  if (parsedData.arguments) {
    result.arguments ??= [];

    if (!subcommand.arguments) {
      throw new Error(`Subcommand "${parsedData.subcommand}" does not have arguments`);
    }

    for (let index = 0; index < parsedData.arguments.length; index++) {
      const { passedValue, stringValue, source, schema } = parsedData.arguments[index];

      const isProgrammatic = source === "programmatic";

      const argument = subcommand.arguments[index];
      if (!argument) {
        throw new Error(`Subcommand "${parsedData.subcommand}" does not have argument at index "${index}"`);
      }

      const safeParseResult = isProgrammatic ? validateSync(schema, passedValue) : argument.type.validate(stringValue);
      if (safeParseResult.issues) {
        throw new Error(
          `The ${generateOrdinalSuffix(result.arguments.length)} argument ${isProgrammatic ? "" : `"${stringValue}"`} is invalid: ${safeParseResult.issues.map(issue => issue.message).join(", ")}`,
        );
      }

      result.arguments.push(safeParseResult.value);
    }
  }

  return result;
}
