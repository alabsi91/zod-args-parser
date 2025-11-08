import { validateSync } from "../../../utilities.ts";
import { validateConflictWith } from "./conflict.ts";
import { validateExclusive } from "./exclusive.ts";
import { validateRequires } from "./requires.ts";

import type { ContextWide } from "../../../types/context-types.ts";
import type { Cli, Subcommand } from "../../../types/definitions-types.ts";
import type { OutputTypeWide } from "../../../types/io-types.ts";

interface ValidateArgument {
  commandDefinition: Subcommand | Cli;
  context: ContextWide;
  output: OutputTypeWide;
}

export function validateArguments({ commandDefinition, context, output }: ValidateArgument) {
  if (!context.arguments) return;

  output.arguments ??= {};

  const argumentsDefinition = commandDefinition.arguments;
  if (!argumentsDefinition) {
    throw new Error(`Subcommand "${context.subcommand}" does not have arguments`);
  }

  for (const [argumentName, argument] of Object.entries(argumentsDefinition)) {
    validateRequires({ name: argumentName, commandDefinition, optionOrArgument: argument, context, type: "option" });
    validateExclusive({ name: argumentName, optionOrArgument: argument, context, type: "option" });
    validateConflictWith({ name: argumentName, optionOrArgument: argument, context, type: "option" });
  }

  const argumentContextEntries = Object.entries(context.arguments);

  for (const [name, { passedValue, stringValue, source, schema }] of argumentContextEntries) {
    const isProgrammatic = source === "programmatic";

    const argument = argumentsDefinition[name];
    if (!argument) {
      throw new Error(`Subcommand "${context.subcommand}" does not have the argument "${name}"`);
    }

    if (!argument._preparedType) {
      throw new Error(`internal error: missing prepared type for the argument "${name}"`);
    }

    const safeParseResult = isProgrammatic
      ? validateSync(schema, passedValue)
      : argument._preparedType.validate(stringValue);

    if (safeParseResult.issues) {
      throw new Error(
        `The argument ${name} argument ${isProgrammatic ? "" : `"${stringValue}"`} is invalid: ${safeParseResult.issues.map(issue => issue.message).join(", ")}`,
      );
    }

    output.arguments[name] = safeParseResult.value.value;
  }
}
