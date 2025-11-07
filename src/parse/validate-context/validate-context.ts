import { generateOrdinalSuffix, validateSync } from "../../utilities.ts";
import { validateConflictWith } from "./validate-conflict-with.ts";
import { validateExclusive } from "./validate-exclusive.ts";
import { validateRequires } from "./validate-requires.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Cli, Subcommand } from "../../types/definitions-types.ts";
import type { OutputTypeWide } from "../../types/io-types.ts";

/** @throws {Error} */
export function validate(context: ContextWide, commandDefinition: Subcommand | Cli) {
  const result: OutputTypeWide = {
    subcommand: context.subcommand,
    positionals: context.positionals,
    context: context,
  };

  // validate `requires` - `exclusive` - `conflictWith`
  if (commandDefinition.options) {
    for (const [optionName, option] of Object.entries(commandDefinition.options)) {
      validateRequires({ name: optionName, commandDefinition, optionOrArgument: option, context });
      validateExclusive({ name: optionName, optionOrArgument: option, context });
      validateConflictWith({ name: optionName, optionOrArgument: option, context });
    }
  }

  if (commandDefinition.arguments) {
    for (const argument of commandDefinition.arguments) {
      validateRequires({ name: argument.name, commandDefinition, optionOrArgument: argument, context });
      validateExclusive({ name: argument.name, optionOrArgument: argument, context });
      validateConflictWith({ name: argument.name, optionOrArgument: argument, context });
    }
  }

  // validate options
  if (context.options) {
    result.options ??= {};

    if (!commandDefinition.options) {
      throw new Error(`Subcommand "${context.subcommand}" does not have options`);
    }

    for (const [optionName, { passedValue, stringValue, name, flag, source, schema }] of Object.entries(
      context.options,
    )) {
      const option = commandDefinition.options[optionName];
      if (!option) {
        throw new Error(`Subcommand "${context.subcommand}" does not have option "${optionName}"`);
      }

      if (!option._preparedType) {
        throw new Error(`internal error: missing prepared type for option "${optionName}"`);
      }

      const isProgrammatic = source === "programmatic";

      const safeParseResult = isProgrammatic
        ? validateSync(schema, passedValue)
        : option._preparedType.validate(stringValue);

      if (safeParseResult.issues) {
        throw new Error(
          `Invalid value ${isProgrammatic ? "" : `"${stringValue}"`} for "${isProgrammatic ? name : flag}": ${safeParseResult.issues.map(issue => issue.message).join(", ")}`,
        );
      }

      result.options[optionName] = safeParseResult.value.value;
    }
  }

  // validate arguments
  if (context.arguments) {
    result.arguments ??= [];

    if (!commandDefinition.arguments) {
      throw new Error(`Subcommand "${context.subcommand}" does not have arguments`);
    }

    for (let index = 0; index < context.arguments.length; index++) {
      const { passedValue, stringValue, source, schema } = context.arguments[index];

      const isProgrammatic = source === "programmatic";

      const argument = commandDefinition.arguments[index];
      if (!argument) {
        throw new Error(`Subcommand "${context.subcommand}" does not have argument at index "${index}"`);
      }

      if (!argument._preparedType) {
        throw new Error(`internal error: missing prepared type for argument at index "${index}"`);
      }

      const safeParseResult = isProgrammatic
        ? validateSync(schema, passedValue)
        : argument._preparedType.validate(stringValue);

      if (safeParseResult.issues) {
        throw new Error(
          `The ${generateOrdinalSuffix(result.arguments.length)} argument ${isProgrammatic ? "" : `"${stringValue}"`} is invalid: ${safeParseResult.issues.map(issue => issue.message).join(", ")}`,
        );
      }

      result.arguments.push(safeParseResult.value.value);
    }
  }

  return result;
}
