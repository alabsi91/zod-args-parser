import { prettifyError } from "./schema-utilities.ts";

import type {
  CliErrorI,
  DefinitionErrorI,
  ErrorCauseI,
  InternalErrorI,
  ParseErrorI,
  ValidationErrorI,
} from "../types/error-types.ts";

/** Determines the cause key associated with a given error code. */
type FindCause<Code extends ErrorCauseI[keyof ErrorCauseI]> = {
  [K in keyof ErrorCauseI]: Code extends ErrorCauseI[K] ? K : never;
}[keyof ErrorCauseI];

/** Creates a typed link between cause, code, and context for stricter narrowing. */
type ErrorMessageOptions<LimitByCause extends keyof ErrorCauseI = keyof ErrorCauseI> = {
  [Code in keyof CliErrorI]: FindCause<Code> extends infer Cause extends LimitByCause
    ? { cause: Cause; code: Code; context: CliErrorI[Code] }
    : never;
}[keyof CliErrorI];

interface CliErrorOptions<T extends ErrorCauseI[keyof ErrorCauseI]> {
  cause: FindCause<T>;
  code: T;
  context: CliErrorI[T];
  message?: string;
}

export class CliError<T extends ErrorCauseI[keyof ErrorCauseI] = ErrorCauseI[keyof ErrorCauseI]> extends Error {
  readonly code: T;
  readonly context: CliErrorI[T];
  readonly cause: FindCause<T>;

  constructor({ cause, code, context, message }: CliErrorOptions<T>) {
    super(message ?? CliError.errorMessage({ cause, code, context } as ErrorMessageOptions));

    this.cause = cause;
    this.code = code;
    this.context = context;
  }

  static errorMessage(options: ErrorMessageOptions): string {
    const defaultErrorMessage = "unknown error";

    if (options.cause === ErrorCause.Internal) {
      return CliError.internalErrorMessage(options) ?? defaultErrorMessage;
    }

    if (options.cause === ErrorCause.Parse) {
      return CliError.parseErrorMessage(options) ?? defaultErrorMessage;
    }

    if (options.cause === ErrorCause.Definition) {
      return CliError.definitionErrorMessage(options) ?? defaultErrorMessage;
    }

    if (options.cause === ErrorCause.Validation) {
      return CliError.validationErrorMessage(options) ?? defaultErrorMessage;
    }

    const executiveCheck: never = options;
    return executiveCheck;
  }

  static parseErrorMessage({ code, context }: ErrorMessageOptions<"Parse">) {
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

  static internalErrorMessage({ code, context }: ErrorMessageOptions<"Internal">) {
    if (code === InternalErrorCode.MissingPreparedTypes) {
      return (
        `internal error: missing prepared type ` +
        `for option "${context.name}" in ${context.commandKind} "${context.commandName}"`
      );
    }

    if (code === InternalErrorCode.CannotFindCliDefinition) {
      return `internal error: cannot find cli definition "${context.cliName}"`;
    }

    const executiveCheck: never = code;
    return executiveCheck;
  }

  static definitionErrorMessage({ code, context }: ErrorMessageOptions<"Definition">) {
    if (code === DefinitionErrorCode.MissingDefinitionName) {
      const propertyName = context.commandKind === "command" ? "cliName" : "name";
      return `invalid ${context.commandKind} definition: "${propertyName}" property is required.`;
    }

    if (code === DefinitionErrorCode.EmptyDefinitionGroup) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `"${context.kind}" property is optional but cannot be empty.`
      );
    }

    if (code === DefinitionErrorCode.MissingSchema) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the ${context.kind} "${context.name}" is missing the "schema" property.`
      );
    }

    if (code === DefinitionErrorCode.InvalidDefinitionOptionName) {
      if (context.negatedAliasName) {
        return (
          `invalid ${context.commandKind} definition "${context.commandName}": ` +
          `the option "${context.optionName}" has the alias "${context.negatedAliasName}" which cannot be named as a negated option.`
        );
      }

      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the option "${context.optionName}" cannot be named as a negated option.`
      );
    }

    if (code === DefinitionErrorCode.InvalidDefinitionArgumentName) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the argument "${context.name}" cannot be a number..`
      );
    }

    if (code === DefinitionErrorCode.DuplicateDefinitionName) {
      const foundIn = context.foundInName
        ? `conflict with the ${context.foundInKind} "${context.foundInName}" alias name`
        : `conflict with other ${context.foundInKind} name`;

      if (context.duplicatedAlias) {
        return (
          `invalid ${context.commandKind} definition "${context.commandName}": ` +
          `the ${context.kind} "${context.name}" has the alias "${context.duplicatedAlias}" which ${foundIn}.`
        );
      }

      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the ${context.kind} "${context.name}" name ${foundIn}.`
      );
    }

    if (code === DefinitionErrorCode.EmptyStringAliasName) {
      if (context.optionName) {
        return (
          `invalid ${context.commandKind} definition "${context.commandName}": ` +
          `the option "${context.optionName}" has an empty string alias name.`
        );
      }

      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `empty string alias name is not allowed.`
      );
    }

    if (code === DefinitionErrorCode.SelfRequire) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the ${context.kind} "${context.name}" cannot require itself.`
      );
    }

    if (code === DefinitionErrorCode.UnknownRequireName) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the ${context.kind} "${context.name}" requires a non-existent name "${context.requiredName}".`
      );
    }

    if (code === DefinitionErrorCode.SelfConflict) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the ${context.kind} "${context.name}" cannot conflict with itself.`
      );
    }

    if (code === DefinitionErrorCode.UnknownConflictName) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the ${context.kind} "${context.name}" conflicts with a non-existent name "${context.requiredName}".`
      );
    }

    if (code === DefinitionErrorCode.DefinitionRequiresConflictOverlap) {
      const s = context.intersectedNames.length > 1 ? "s" : "";
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the ${context.kind} "${context.name}" has overlapping 'requires' and 'conflictsWith' name${s}: ` +
        context.intersectedNames.join(", ")
      );
    }

    if (code === DefinitionErrorCode.InvalidOptionalArgumentDefinition) {
      if (context.allowPositionals) {
        return (
          `invalid ${context.commandKind} definition "${context.commandName}": ` +
          `the argument "${context.name}" cannot be optional when "allowPositionals" is enabled.`
        );
      }

      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the argument "${context.name}" cannot be optional unless it is the last argument.`
      );
    }

    if (code === DefinitionErrorCode.MissingOnExecute) {
      return (
        `trying to execute ${context.commandKind} "${context.commandName}" ` +
        `which does not have an "onExecute" handler.`
      );
    }

    if (code === DefinitionErrorCode.SubcommandHelpNotFound) {
      return (
        `cannot generate help message for subcommand "${context.subcommandName}" ` +
        `because it does not exist in CLI "${context.cliName}".`
      );
    }

    const executiveCheck: never = code;
    return executiveCheck;
  }

  static validationErrorMessage({ code, context }: ErrorMessageOptions<"Validation">) {
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

  /** Checks if this error was caused by a specific reason */
  isCause<C extends this["cause"]>(cause: C): this is CliError<ErrorCauseI[C]> {
    return this.cause === cause;
  }

  /** Checks if this error has a specific code */
  isCode<Code extends T>(code: Code): this is CliError<Code> {
    return this.code === code;
  }
}

export const ErrorCause = Enum<{ [K in keyof ErrorCauseI]: undefined }>({
  Internal: undefined,
  Parse: undefined,
  Validation: undefined,
  Definition: undefined,
});

export const DefinitionErrorCode = Enum<{ [K in keyof DefinitionErrorI]: undefined }>({
  MissingSchema: undefined,
  EmptyDefinitionGroup: undefined,
  MissingDefinitionName: undefined,
  InvalidDefinitionOptionName: undefined,
  InvalidDefinitionArgumentName: undefined,
  InvalidOptionalArgumentDefinition: undefined,
  DuplicateDefinitionName: undefined,
  EmptyStringAliasName: undefined,
  SelfRequire: undefined,
  UnknownRequireName: undefined,
  SelfConflict: undefined,
  UnknownConflictName: undefined,
  DefinitionRequiresConflictOverlap: undefined,
  MissingOnExecute: undefined,
  SubcommandHelpNotFound: undefined,
});

export const InternalErrorCode = Enum<{ [K in keyof InternalErrorI]: undefined }>({
  MissingPreparedTypes: undefined,
  CannotFindCliDefinition: undefined,
});

export const ParseErrorCode = Enum<{ [K in keyof ParseErrorI]: undefined }>({
  UnknownSubcommand: undefined,
  CommandWithoutOptions: undefined,
  UnknownOption: undefined,
  DuplicateOptionProvided: undefined,
  InvalidNegationForNonBooleanOption: undefined,
  PositionalArgumentNotAllowed: undefined,
  MissingRequiredOption: undefined,
  MissingRequiredArgument: undefined,
  OptionMissingValue: undefined,
  FlagAssignedValue: undefined,
});

export const ValidationErrorCode = Enum<{ [K in keyof ValidationErrorI]: undefined }>({
  NoOptionsToValidate: undefined,
  NoArgumentsToValidate: undefined,
  UnknownOptionValidation: undefined,
  UnknownArgumentValidation: undefined,
  SchemaValidationFailed: undefined,
  MutuallyExclusiveConflict: undefined,
  RequiredDependencyMissing: undefined,
  AsyncSchemaNotSupported: undefined,
  CoercionFailed: undefined,
});

function Enum<const T extends Record<string, undefined>>(value: T) {
  const casted = value as Record<string, unknown>;
  for (const [key] of Object.entries(casted)) casted[key] = key;
  return Object.freeze(casted) as { [K in keyof T]: K };
}
