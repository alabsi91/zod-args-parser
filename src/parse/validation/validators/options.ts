import { CliError, ErrorCause, InternalErrorCode, ValidationErrorCode } from "../../../utilities/cli-error.ts";
import { validateSync } from "../../../utilities/schema-utilities.ts";
import { validateConflictWith } from "./conflict.ts";
import { validateExclusive } from "./exclusive.ts";
import { validateRequires } from "./requires.ts";

import type { ContextWide } from "../../../types/context-types.ts";
import type { Cli, Subcommand } from "../../../types/definitions-types.ts";
import type { OutputTypeWide } from "../../../types/io-types.ts";

interface ValidateOptions {
  commandDefinition: Subcommand | Cli;
  context: ContextWide;
  output: OutputTypeWide;
}

/** @throws {CliError} */
export function validateOptions({ commandDefinition, context, output }: ValidateOptions) {
  if (!context.options) return;

  output.options ??= {};

  const commandKind = "cliName" in commandDefinition ? "command" : "subcommand";
  const commandName = "cliName" in commandDefinition ? commandDefinition.cliName : commandDefinition.name;

  const optionsDefinition = commandDefinition.options;
  if (!optionsDefinition) {
    throw new CliError({
      cause: ErrorCause.Validation,
      code: ValidationErrorCode.NoOptionsToValidate,
      context: { commandKind, commandName },
    });
  }

  for (const [optionName, option] of Object.entries(optionsDefinition)) {
    validateRequires({ name: optionName, commandDefinition, optionOrArgument: option, context, kind: "option" });
    validateExclusive({ name: optionName, optionOrArgument: option, context, kind: "option" });
    validateConflictWith({ name: optionName, optionOrArgument: option, context, kind: "option" });
  }

  const optionContextEntries = Object.entries(context.options);

  for (const [optionName, { passedValue, stringValue, source, schema }] of optionContextEntries) {
    const option = optionsDefinition[optionName];
    if (!option) {
      throw new CliError({
        cause: ErrorCause.Validation,
        code: ValidationErrorCode.UnknownOptionValidation,
        context: { commandKind, commandName, optionName },
      });
    }

    if (!option._preparedType) {
      throw new CliError({
        cause: ErrorCause.Internal,
        code: InternalErrorCode.MissingPreparedTypes,
        context: { commandKind, commandName, kind: "option", name: optionName },
      });
    }

    const isProgrammatic = source === "programmatic";

    const safeParseResult = isProgrammatic
      ? validateSync(schema, passedValue)
      : option._preparedType.validate(stringValue);

    if (safeParseResult.issues) {
      throw new CliError({
        cause: ErrorCause.Validation,
        code: ValidationErrorCode.SchemaValidationFailed,
        context: {
          commandKind,
          commandName,
          kind: "option",
          name: optionName,
          inputValue: isProgrammatic ? passedValue : stringValue,
          issues: safeParseResult.issues,
        },
      });
    }

    output.options[optionName] = safeParseResult.value;
  }
}
