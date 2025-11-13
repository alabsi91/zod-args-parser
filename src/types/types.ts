import type { Cli, Subcommand } from "./definitions-types.ts";
import type { PrintHelpOptions } from "./help-message-types.ts";
import type { InferInputType, InputTypeWide, OutputType, OutputTypeWide } from "./io-types.ts";

export type CoerceTypes = "boolean" | (string & {});

export interface ObjectCoerceMethodOptions {
  /**
   * Converts `'true'` or `'false'` (case-sensitive) strings to boolean values.
   *
   * The coercion is applied after parsing the string as JSON.
   *
   * ```bash
   * # coerced to boolean
   * --obj.key=true       # true
   * --obj.key false      # false
   *
   * # remains a string (case-sensitive)
   * --obj.key=FALSE      # "FALSE"
   * ```
   *
   * @example
   *   coerce: coerce.object({ coerceBoolean: true }); // coerce all boolean-like keys
   *   coerce: coerce.object({ coerceBoolean: ["key.nested"] }); // coerce only specific keys
   */
  coerceBoolean?: boolean | string[];

  /**
   * Converts strings matching a number regex to numbers.
   *
   * The coercion is applied after parsing the string as JSON.
   *
   * ```bash
   * # parsed as number
   * --obj.key=123
   * --obj.key 123.45
   * --obj.key -123.45
   * --obj.key +123.45
   *
   * # remains a string (invalid number)
   * --obj.key 1.23.45
   * --obj.key string
   * ```
   *
   * @example
   *   coerce: coerce.object({ coerceNumber: true }); // coerce all numeric keys
   *   coerce: coerce.object({ coerceNumber: ["key.nested"] }); // coerce only specific keys
   */
  coerceNumber?: boolean | string[];

  /**
   * Converts strings matching a number regex to bigints.
   *
   * The coercion is applied after parsing the string as JSON.
   *
   * ```bash
   * # parsed as bigint
   * --obj.key=12345678901234567890
   *
   * # remains a string (invalid bigint)
   * --obj.key 123.45
   * --obj.key string
   * ```
   *
   * @example
   *   coerce: coerce.object({ coerceBigint: true }); // coerce all bigint-like keys
   *   coerce: coerce.object({ coerceBigint: ["key.id"] }); // coerce only specific keys
   */
  coerceBigint?: boolean | string[];

  /**
   * Converts tries to convert any string to `Date` objects.
   *
   * The coercion is applied after parsing the string as JSON.
   *
   * ```bash
   * # parsed as Date
   * --obj.key="2024-03-12T10:30:00Z"
   * --obj.key "2025-11-13"
   *
   * # remains a string (invalid date)
   * --obj.key "invalid-date"
   * ```
   *
   * @example
   *   coerce: coerce.object({ coerceDate: true }); // coerce all date-like keys
   *   coerce: coerce.object({ coerceDate: ["user.createdAt"] }); // coerce only specific keys
   */
  coerceDate?: boolean | string[];
}

export interface CoerceMethod<Value> {
  (terminalInput: string): Value;
  type?: CoerceTypes;
}

type GetSubcommandsNames<T extends Partial<Subcommand>> = T extends Cli
  ? T["subcommands"] extends infer S extends readonly [Subcommand, ...Subcommand[]]
    ? { [Index in keyof S]: S[Index] extends { name: string } ? S[Index]["name"] : never }[number]
    : never
  : never;

type Unsubscribe = () => void;

export interface AttachedMethods<T extends Cli | Subcommand> {
  /**
   * Add a handler to be called when the subcommand/cli is executed.
   *
   * @example
   *   const unsubscribe = cli.onExecute(result => console.log(result));
   */
  onExecute: (handler: (data: OutputType<[T]>) => void) => Unsubscribe;

  /** Execute the main command/subcommand programmatically */
  execute: InferInputType<T> extends infer InputType
    ? undefined extends InputType
      ? (input?: InputType) => void
      : (input: InputType) => void
    : never;

  /** Execute the main command/subcommand programmatically */
  executeAsync: InferInputType<T> extends infer InputType
    ? undefined extends InputType
      ? (input?: InputType) => Promise<void>
      : (input: InputType) => Promise<void>
    : never;

  /** **WARNING**: This will only be available after the CLI schema has been created */
  generateCliHelpMessage?: (options?: PrintHelpOptions) => string;

  /**
   * **WARNING**: This will only be available after the CLI schema has been created
   *
   * @throws {Error} - When the subcommand is not found
   */
  generateSubcommandHelpMessage?: (
    subcommandName: GetSubcommandsNames<T> | (string & {}),
    options?: PrintHelpOptions,
  ) => string;
}

export interface AttachedMethodsWide {
  onExecute: (handler: (data: OutputTypeWide) => void | Promise<void>) => Unsubscribe;
  execute: (input?: InputTypeWide) => void;
  executeAsync: (input?: InputTypeWide) => Promise<void>;
  generateCliHelpMessage?: (options?: PrintHelpOptions) => void;
  /** @throws {Error} - When the subcommand is not found */
  generateSubcommandHelpMessage?: (subcommandName: string, options?: PrintHelpOptions) => void;
}

export type CliOutputType<S extends Cli> =
  | OutputType<[S]>
  | (S["subcommands"] extends readonly [Subcommand, ...Subcommand[]] ? OutputType<S["subcommands"]> : never);

export type CliParseResult<S extends Cli> =
  | { value: CliOutputType<S>; error?: undefined }
  | { value?: never; error: Error };

export type CliParseResultWide = { value: OutputTypeWide; error?: undefined } | { value?: never; error: Error };

export interface ValidateMethods<S extends Cli> {
  run(input: string | string[]): CliParseResult<S>;
  runAsync(input: string | string[]): Promise<CliParseResult<S>>;
}
