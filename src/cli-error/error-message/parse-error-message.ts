import { ParseErrorCode } from "../error-code/parse-error-code.ts";

import type { CliErrorOptionByCause } from "../../types/error-types.ts";

export function parseErrorMessage({ code, context }: CliErrorOptionByCause<"Parse">) {
  if (code === ParseErrorCode.UnknownSubcommand) {
    return `parsing error: unknown subcommand "${context.commandName}".`;
  }

  if (code === ParseErrorCode.CommandWithoutOptions) {
    return (
      `parsing error: the ${context.commandKind} "${context.commandName}" ` +
      `does not allow options, but received "${context.optionName}".`
    );
  }

  if (code === ParseErrorCode.UnknownOption) {
    return (
      `parsing error: unknown option "${context.optionName}" ` +
      `for the ${context.commandKind} "${context.commandName}".`
    );
  }

  if (code === ParseErrorCode.DuplicateOptionProvided) {
    return (
      `parsing error: duplicate option "${context.optionName}" ` +
      `provided for the ${context.commandKind} "${context.commandName}".`
    );
  }

  if (code === ParseErrorCode.InvalidNegationForNonBooleanOption) {
    return (
      `parsing error: option "${context.optionName}" cannot be negated ` +
      `because it is not a boolean option for the ${context.commandKind} "${context.commandName}".`
    );
  }

  if (code === ParseErrorCode.PositionalArgumentNotAllowed) {
    return (
      `parsing error: positional argument "${context.argumentName}" ` +
      `is not allowed for the ${context.commandKind} "${context.commandName}".`
    );
  }

  if (code === ParseErrorCode.MissingRequiredOption) {
    return (
      `parsing error: missing required option "${context.optionName}" ` +
      `for the ${context.commandKind} "${context.commandName}".`
    );
  }

  if (code === ParseErrorCode.MissingRequiredArgument) {
    return (
      `parsing error: missing required argument "${context.argumentName}" ` +
      `for the ${context.commandKind} "${context.commandName}".`
    );
  }

  if (code === ParseErrorCode.OptionMissingValue) {
    return (
      `parsing error: the option "${context.optionName}" ` +
      `for the ${context.commandKind} "${context.commandName}" expects a value but received none.`
    );
  }

  if (code === ParseErrorCode.FlagAssignedValue) {
    return (
      `parsing error: ` +
      `flag option "${context.flag}" in ${context.commandKind} "${context.commandName}" ` +
      `cannot be assigned a value using "=" (provided: "${context.value}").`
    );
  }

  const executiveCheck: never = code;
  return executiveCheck;
}
