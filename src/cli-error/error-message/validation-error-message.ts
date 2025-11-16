import { prettifyError } from "../../utilities/schema-utilities.ts";
import { ValidationErrorCode } from "../error-code/validation-error-code.ts";

import type { CliErrorOptionByCause } from "../../types/error-types.ts";

export function validationErrorMessage({ code, context }: CliErrorOptionByCause<"Validation">) {
  if (code === ValidationErrorCode.NoOptionsToValidate) {
    return (
      `validation error: trying to validate options ` +
      `for ${context.commandKind} "${context.commandName}" which does not define any.`
    );
  }

  if (code === ValidationErrorCode.NoArgumentsToValidate) {
    return (
      `validation error: trying to validate typed arguments ` +
      `for ${context.commandKind} "${context.commandName}" which does not define any.`
    );
  }

  if (code === ValidationErrorCode.UnknownOptionValidation) {
    return (
      `validation error: trying to validate a non-existent option "${context.optionName}" ` +
      `for ${context.commandKind} "${context.commandName}".`
    );
  }

  if (code === ValidationErrorCode.UnknownArgumentValidation) {
    return (
      `validation error: trying to validate a non-existent typed argument "${context.argumentName}" ` +
      `for ${context.commandKind} "${context.commandName}".`
    );
  }

  if (code === ValidationErrorCode.SchemaValidationFailed) {
    return (
      `validation error: ` +
      `the ${context.kind} "${context.name}" for ${context.commandKind} "${context.commandName}" failed to validate ` +
      `"${typeof context.inputValue === "string" ? context.inputValue : JSON.stringify(context.inputValue)}": ` +
      prettifyError(context.issues)
    );
  }

  if (code === ValidationErrorCode.MutuallyExclusiveConflict) {
    const parts: string[] = [];

    if (context.conflictedOptions.length > 0) {
      const formatted = context.conflictedOptions.map(o => `"${o}"`).join(", ");
      const s = context.conflictedOptions.length > 1 ? "s" : "";
      parts.push(`option${s} ${formatted}`);
    }

    if (context.conflictedArguments.length > 0) {
      const formatted = context.conflictedArguments.map(a => `"${a}"`).join(", ");
      const s = context.conflictedArguments.length > 1 ? "s" : "";
      parts.push(`argument${s} ${formatted}`);
    }

    return (
      `validation error: the ${context.kind} "${context.name}" ` +
      `cannot be used with the ${parts.join(" and ")} because they are mutually exclusive.`
    );
  }

  if (code === ValidationErrorCode.RequiredDependencyMissing) {
    const parts: string[] = [];

    if (context.missingOptions.length > 0) {
      const formatted = context.missingOptions.map(o => `"${o}"`).join(", ");
      const s = context.missingOptions.length > 1 ? "s" : "";
      parts.push(`option${s} ${formatted}`);
    }

    if (context.missingArguments.length > 0) {
      const formatted = context.missingArguments.map(a => `"${a}"`).join(", ");
      const s = context.missingArguments.length > 1 ? "s" : "";
      parts.push(`argument${s} ${formatted}`);
    }

    return (
      `validation error: the ${context.kind} "${context.name}" ` +
      `cannot be used without the required "${parts.join(" and ")}".`
    );
  }

  if (code === ValidationErrorCode.AsyncSchemaNotSupported) {
    return (
      `validation error: cannot validate async schema: ` +
      `received ${typeof context.value === "string" ? context.value : JSON.stringify(context.value)}`
    );
  }

  if (code === ValidationErrorCode.CoercionFailed) {
    return (
      `validation error: ` +
      `failed to coerce the value ` +
      `"${typeof context.providedValue === "string" ? context.providedValue : JSON.stringify(context.providedValue)}" ` +
      `of type "${typeof context.providedValue}" to type "${context.coerceToType}".`
    );
  }

  const executiveCheck: never = code;
  return executiveCheck;
}
