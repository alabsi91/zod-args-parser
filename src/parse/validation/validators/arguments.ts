import { CliError, ErrorCause, InternalErrorCode, ValidationErrorCode } from "../../../utilities/cli-error.ts";
import { validateSync } from "../../../utilities/schema-utilities.ts";
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

/** @throws {CliError} */
export function validateArguments({ commandDefinition, context, output }: ValidateArgument) {
  if (!context.arguments) return;

  output.arguments ??= {};

  const commandKind = "cliName" in commandDefinition ? "command" : "subcommand";
  const commandName = "cliName" in commandDefinition ? commandDefinition.cliName : commandDefinition.name;

  const argumentsDefinition = commandDefinition.arguments;
  if (!argumentsDefinition) {
    throw new CliError({
      cause: ErrorCause.Validation,
      code: ValidationErrorCode.NoArgumentsToValidate,
      context: { commandKind, commandName },
    });
  }

  for (const [argumentName, argument] of Object.entries(argumentsDefinition)) {
    validateRequires({ name: argumentName, commandDefinition, optionOrArgument: argument, context, kind: "option" });
    validateExclusive({ name: argumentName, optionOrArgument: argument, context, kind: "option" });
    validateConflictWith({ name: argumentName, optionOrArgument: argument, context, kind: "option" });
  }

  const argumentContextEntries = Object.entries(context.arguments);

  for (const [argumentName, { passedValue, stringValue, source, schema }] of argumentContextEntries) {
    const isProgrammatic = source === "programmatic";

    const argument = argumentsDefinition[argumentName];
    if (!argument) {
      throw new CliError({
        cause: ErrorCause.Validation,
        code: ValidationErrorCode.UnknownArgumentValidation,
        context: { commandKind, commandName, argumentName },
      });
    }

    if (!argument._preparedType) {
      throw new CliError({
        cause: ErrorCause.Internal,
        code: InternalErrorCode.MissingPreparedTypes,
        context: { commandKind, commandName, kind: "argument", name: argumentName },
      });
    }

    const safeParseResult = isProgrammatic
      ? validateSync(schema, passedValue)
      : argument._preparedType.validate(stringValue);

    if (safeParseResult.issues) {
      throw new CliError({
        cause: ErrorCause.Validation,
        code: ValidationErrorCode.SchemaValidationFailed,
        context: {
          commandKind,
          commandName,
          kind: "option",
          name: argumentName,
          inputValue: isProgrammatic ? passedValue : stringValue,
          issues: safeParseResult.issues,
        },
      });
    }

    output.arguments[argumentName] = safeParseResult.value;
  }
}
