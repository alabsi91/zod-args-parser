import type { SchemaType } from "./schema-types.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";

export interface ErrorCauseI {
  /** Unexpected errors caused by the library itself */
  readonly Internal: keyof InternalErrorI;

  /** Errors occurring while parsing terminal arguments, usually due to user input */
  readonly Parse: keyof ParseErrorI;

  /** Errors occurring during validation of parsed arguments, usually due to user input */
  readonly Validation: keyof ValidationErrorI;

  /** Errors caused by incorrect CLI or subcommand definitions */
  readonly Definition: keyof DefinitionErrorI;
}

export interface InternalErrorI {
  /** The option or argument definition has undefined `_preparedType` */
  readonly MissingPreparedTypes: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly kind: "option" | "argument";
    readonly name: string;
  };

  /** Occurs when attempting to access an undefined subcommand, which should return a CLI definition. */
  readonly CannotFindCliDefinition: {
    readonly cliName: string;
  };
}

export interface DefinitionErrorI {
  /** The CLI or subcommand definition is missing the required `name` or `cliName` property. */
  readonly MissingDefinitionName: {
    readonly commandKind: "command" | "subcommand";
  };

  /** Calling */
  readonly MissingOnExecute: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
  };

  /** An option or argument definition is missing the required `schema` property. */
  readonly MissingSchema: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly kind: "option" | "argument";
    readonly name: string;
  };

  /** The `options` record, `arguments` record, or `subcommands` array is defined but empty. */
  readonly EmptyDefinitionGroup: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly kind: "option" | "argument" | "subcommands";
  };

  /** An option or alias name is written as a negated name (e.g., `noFoo` → `--no-foo`). */
  readonly InvalidDefinitionOptionName: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName: string;
    readonly negatedAliasName?: string | undefined;
  };

  /** An option, option alias, or argument name is duplicated within the same CLI or subcommand. */
  readonly DuplicateDefinitionName: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly kind: "option" | "subcommand";
    readonly name: string;

    /** Present when the checked name is an alias. */
    readonly duplicatedAlias?: string | undefined;

    /** Where the duplicated name was found. */
    readonly foundInKind: "option" | "argument" | "subcommand";

    /** Present when the duplicate was found inside aliases of another kind. */
    readonly foundInName?: string;
  };

  /** Argument names cannot be numeric. */
  readonly InvalidDefinitionArgumentName: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly name: string;
  };

  /**
   * Argument optionality rules:
   *
   * - When `allowPositionals` is enabled, typed arguments cannot be optional.
   * - Otherwise, only the last typed argument may be optional.
   */
  readonly InvalidOptionalArgumentDefinition: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly name: string;
    readonly allowPositionals: boolean;
  };

  /** The option has an `aliases` array containing an empty string. */
  readonly EmptyStringAliasName: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName?: string;
  };

  /** The option or argument definition incorrectly requires itself. */
  readonly SelfRequire: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly kind: "option" | "argument";
    readonly name: string;
  };

  /** The `requires` list contains a name that does not exist. */
  readonly UnknownRequireName: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly kind: "option" | "argument";
    readonly name: string;
    readonly requiredName: string;
  };

  /** The `conflictWith` list contains the same name as the definition itself. */
  readonly SelfConflict: DefinitionErrorI["SelfRequire"];

  /** The `conflictWith` list contains a name that does not exist. */
  readonly UnknownConflictName: DefinitionErrorI["UnknownRequireName"];

  /** The `requires` list overlaps with the `conflictWith` list. */
  readonly DefinitionRequiresConflictOverlap: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly kind: "option" | "argument";
    readonly name: string;
    readonly intersectedNames: readonly string[];
  };

  /** Triggered when attempting to generate a help message for a subcommand that does not exist in the CLI definition. */
  readonly SubcommandHelpNotFound: {
    readonly cliName: string;
    readonly subcommandName: string;
  };
}

export interface ParseErrorI {
  /** The parser could not find a matching command in the CLI definition */
  readonly UnknownSubcommand: {
    readonly commandName: string;
  };

  /** Received an option for a cli or subcommand but no options were defined */
  readonly CommandWithoutOptions: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName: string;
  };

  /** The cli or subcommand define options but could not find a matching option */
  readonly UnknownOption: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName: string;
  };

  /** Triggered when a duplicate option is supplied to a command or subcommand. */
  readonly DuplicateOptionProvided: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName: string;
  };

  /** Triggered when a non-boolean option is incorrectly used with a negation prefix. */
  readonly InvalidNegationForNonBooleanOption: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName: string;
  };

  /** Triggered when a argument is provided to a command or subcommand that does not allow positional arguments. */
  readonly PositionalArgumentNotAllowed: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly argumentName: string;
  };

  /** Triggered when a required option is not provided to a command or subcommand. */
  readonly MissingRequiredOption: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName: string;
  };

  /** Triggered when a required argument is not provided to a command or subcommand. */
  readonly MissingRequiredArgument: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly argumentName: string;
  };

  /** Triggered when an option that requires a value is provided without one in a command or subcommand. */
  readonly OptionMissingValue: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName: string;
  };

  /** Triggered when a flag (single letter options: -v) argument is incorrectly assigned a value using "=". */
  readonly FlagAssignedValue: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly flag: string;
    readonly value: string;
  };
}

export interface ValidationErrorI {
  /** Triggered when validating an option on a command or subcommand that has no options defined. */
  readonly NoOptionsToValidate: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
  };

  /** Triggered when validating an argument on a command or subcommand that has no arguments defined. */
  readonly NoArgumentsToValidate: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
  };

  /** Triggered when attempting to validate an option that does not exist for a command or subcommand. */
  readonly UnknownOptionValidation: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly optionName: string;
  };

  /** Triggered when attempting to validate an argument that does not exist for a command or subcommand. */
  readonly UnknownArgumentValidation: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly argumentName: string;
  };

  /** Triggered when schema validation of an option or argument fails */
  readonly SchemaValidationFailed: {
    readonly commandKind: "command" | "subcommand";
    readonly commandName: string;
    readonly kind: "option" | "argument";
    readonly name: string;
    readonly inputValue: unknown;
    readonly issues: ReadonlyArray<StandardSchemaV1.Issue>;
  };

  /**
   * Triggered when an option or argument cannot be used together with certain other options or arguments due to mutual
   * exclusivity.
   */
  readonly MutuallyExclusiveConflict: {
    readonly kind: "option" | "argument";
    readonly name: string;
    readonly conflictedOptions: readonly string[];
    readonly conflictedArguments: readonly string[];
  };

  /** Triggered when an option or argument is missing a required dependent option or argument in a command or subcommand. */
  readonly RequiredDependencyMissing: {
    readonly kind: "option" | "argument";
    readonly name: string;
    readonly missingOptions: readonly string[];
    readonly missingArguments: readonly string[];
  };

  /** Triggered when attempting to perform synchronous validation on an asynchronous schema. */
  readonly AsyncSchemaNotSupported: {
    value: unknown;
    schema: SchemaType;
  };

  /** Triggered when coercion of a value to the expected type fails during validation. */
  readonly CoercionFailed: {
    readonly providedValue: unknown;
    readonly coerceToType: string;
  };
}

export interface CliErrorI extends DefinitionErrorI, ParseErrorI, ValidationErrorI, InternalErrorI {}
