import type { Cli, Subcommand } from "./definitions-types.ts";
import type { PrintHelpOptions } from "./help-message-types.ts";
import type { InferInputType, InputTypeWide, OutputType, OutputTypeWide } from "./io-types.ts";

type PrimitiveTypeNames = "string" | "number" | "boolean" | "object" | "unknown";
export type CoerceTypes = PrimitiveTypeNames | `${PrimitiveTypeNames}[]` | `set<${PrimitiveTypeNames}>` | (string & {});

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

  // Make the argument optional if it has undefined type
  execute: InferInputType<T> extends infer InputType
    ? undefined extends InputType
      ? (input?: InputType) => void
      : (input: InputType) => void
    : never;

  /** **WARNING**: This will only be available after the CLI schema has been created */
  formatCliHelpMessage?: (options?: PrintHelpOptions) => string;

  /**
   * **WARNING**: This will only be available after the CLI schema has been created
   *
   * @throws {Error} - When the subcommand is not found
   */
  formatSubcommandHelpMessage?: (
    subcommandName: GetSubcommandsNames<T> | (string & {}),
    options?: PrintHelpOptions,
  ) => string;
}

export interface AttachedMethodsWide {
  onExecute: (handler: (data: OutputTypeWide) => void) => Unsubscribe;
  execute: (input?: InputTypeWide) => void;
  printCliHelp?: (options?: PrintHelpOptions) => void;
  printSubcommandHelp?: (subcommandName: string, options?: PrintHelpOptions) => void;
}

export type CliOutputType<S extends Cli> =
  | OutputType<[S]>
  | (S["subcommands"] extends readonly [Subcommand, ...Subcommand[]] ? OutputType<S["subcommands"]> : never);

export type CliParseResult<S extends Cli> =
  | { value: CliOutputType<S>; error?: undefined }
  | { value?: never; error: Error };

export interface ValidateMethods<S extends Cli> {
  run(input: string | string[]): CliParseResult<S>;
  runAsync(input: string | string[]): Promise<CliParseResult<S>>;
}
