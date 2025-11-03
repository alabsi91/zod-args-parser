import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Argument, Cli, Option, Subcommand } from "./schemas/schema-types.ts";
import type { Context, ContextWide } from "./parse/context/context-types.ts";

/** `{ some props } & { other props }` => `{ some props, other props }` */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Extract the undefined properties from an object */
type UndefinedProperties<T> = { [P in keyof T]-?: undefined extends T[P] ? P : never }[keyof T];

/** Make undefined properties optional? */
type ToOptional<T> = Partial<Pick<T, UndefinedProperties<T>>> & Pick<T, Exclude<keyof T, UndefinedProperties<T>>>;

/** If every property in a record is optional, widen the type to `T | undefined`. */
type WidenIfAllPropertiesOptional<T> = {
  [K in keyof T]-?: object extends Pick<T, K> ? never : K;
}[keyof T] extends never
  ? T | undefined
  : T;

/** If every tuple element can be undefined, widen the type to `T | undefined`. */
type WidenIfAllItemsOptional<T extends any[]> = {
  [Index in keyof T]-?: undefined extends T[Index] ? never : T[Index];
}[number] extends never
  ? T | undefined
  : T;

/** Make the tail of a tuple optional if it extends undefined */
type MakeTailOptional<T extends readonly unknown[]> = T extends [...infer H, infer L]
  ? undefined extends L
    ? [...MakeTailOptional<H>, L?]
    : T
  : T;

/** Output options type */
type OptionsOutputType<T extends Record<string, Option>> = Prettify<
  ToOptional<{
    [K in keyof T]: StandardSchemaV1.InferOutput<T[K]["type"]["schema"]>;
  }>
>;

/** Input options type */
type OptionsInputType<T extends Record<string, Option>> = Prettify<
  ToOptional<{
    [K in keyof T]: StandardSchemaV1.InferInput<T[K]["type"]["schema"]>;
  }>
>;

/** Output arguments type */
type ArgumentsOutputType<T extends [Argument, ...Argument[]]> = Prettify<{
  [K in keyof T]: T[K] extends Argument ? StandardSchemaV1.InferOutput<T[K]["type"]["schema"]> : never;
}>;

/** Input arguments type */
type ArgumentsInputType<T extends [Argument, ...Argument[]]> = Prettify<{
  [K in keyof T]: T[K] extends Argument ? StandardSchemaV1.InferInput<T[K]["type"]["schema"]> : never;
}>;

/**
 * - Infer schema output type.
 *
 * @example
 *   const subcommand = createSubcommand({ name: "build", options: [...] });
 *   type OptionsType = InferOutputType<typeof subcommand>["options"];
 */
export type InferOutputType<T extends Cli | Subcommand> = Prettify<{
  subcommand: "name" extends keyof T ? T["name"] : undefined;
  options: T["options"] extends Record<string, Option> ? OptionsOutputType<T["options"]> : never;
  arguments: T["arguments"] extends [Argument, ...Argument[]] ? ArgumentsOutputType<T["arguments"]> : never;
  positionals: T["allowPositionals"] extends true ? string[] : never;
  context: Context<[T]>;
}>;

/**
 * - Infer schema input type.
 *
 * @example
 *   const subcommand = createSubcommand({ name: "build", options: [...] });
 *   type OptionsType = InferInputType<typeof subcommand>["options"];
 */
export type InferInputType<T extends Cli | Subcommand> = Prettify<
  WidenIfAllPropertiesOptional<
    ToOptional<{
      positionals: T["allowPositionals"] extends true ? string[] : undefined;
      options: T["options"] extends Record<string, Option>
        ? WidenIfAllPropertiesOptional<OptionsInputType<T["options"]>>
        : undefined;
      arguments: T["arguments"] extends [Argument, ...Argument[]]
        ? WidenIfAllItemsOptional<MakeTailOptional<ArgumentsInputType<T["arguments"]>>>
        : undefined;
    }>
  >
>;

export type OutputType<S extends readonly (Cli | Subcommand)[]> = {
  [K in keyof S]: InferOutputType<S[K]>;
}[number];

export interface OutputTypeWide {
  subcommand: string | undefined;
  positionals?: string[];
  arguments?: unknown[];
  options?: Record<string, unknown>;
  context: ContextWide;
}

export interface InputTypeWide {
  arguments?: unknown[];
  options?: Record<string, unknown>;
  positionals?: string[];
}

export interface Coerce<Schema extends StandardSchemaV1 = StandardSchemaV1> {
  schema: Schema;
  defaultValue: unknown;
  isOptional: boolean;
  isBoolean?: boolean;
  validate: (value: string | undefined) => StandardSchemaV1.Result<unknown>;
}

export interface PrintHelpOptions {
  /** The style to use for the help message. */
  style?: Partial<HelpMessageStyle>;

  /**
   * The number of spaces to put before the name.
   *
   * @default 2
   */
  indentBeforeName?: number;

  /**
   * The number of spaces to put after the name between the name and the description (space between columns).
   *
   * @default 4
   */
  indentAfterName?: number;

  /**
   * The number of spaces to put before the placeholder.
   *
   * @default 1
   */
  indentBeforePlaceholder?: number;

  /**
   * The number of spaces to put before a new line:
   *
   * - Description new lines.
   * - Example under description.
   *
   * @default 0
   */
  newLineIndent?: number;

  /**
   * The number of empty lines to put between lines.
   *
   * @default 0
   */
  emptyLines?: number;

  /**
   * The number of empty lines to put before the title.
   *
   * @default 1
   */
  emptyLinesBeforeTitle?: number;

  /**
   * The number of empty lines to put after the title.
   *
   * @default 0
   */
  emptyLinesAfterTitle?: number;

  /**
   * The keyword to use for the example.
   *
   * @default "Example:"
   */
  exampleKeyword?: string;

  /**
   * The keyword to use for the optional.
   *
   * @default "(optional)"
   */
  optionalKeyword?: string;

  /**
   * The keyword to use for the default. where `{{ value }}` will be replaced with the default value.
   *
   * @default "(default: {{ value }})"
   */
  defaultKeyword?: string;

  /**
   * The title to use for the usage.
   *
   * @default "USAGE"
   */
  usageTitle?: string;

  /**
   * The title to use for the description.
   *
   * @default "DESCRIPTION"
   */
  descriptionTitle?: string;

  /**
   * The title to use for the commands.
   *
   * @default "COMMANDS"
   */
  commandsTitle?: string;

  /**
   * The title to use for the options.
   *
   * @default "OPTIONS"
   */
  optionsTitle?: string;

  /**
   * The title to use for the arguments.
   *
   * @default "ARGUMENTS"
   */
  argumentsTitle?: string;

  /**
   * The title to use for the examples.
   *
   * @default "EXAMPLE"
   */
  exampleTitle?: string;
}

export interface ColorFunctionType {
  (...text: unknown[]): string;
}

/** - The colors to use for the help message. */
export type HelpMessageStyle = Record<
  | "title"
  | "description"
  | "default"
  | "optional"
  | "exampleTitle"
  | "example"
  | "command"
  | "option"
  | "argument"
  | "placeholder"
  | "punctuation",
  ColorFunctionType
>;

export type SafeParseResult<S extends Cli> =
  | { success: false; error: Error }
  | {
      success: true;
      data:
        | OutputType<[S]>
        | (S["subcommands"] extends readonly [Subcommand, ...Subcommand[]] ? OutputType<S["subcommands"]> : never);
    };

export interface AttachedMethods<T extends Cli | Subcommand> {
  setAction: (actions: (data: OutputType<[T]>) => void) => void;

  // Make the argument optional if it has undefined type
  execute: InferInputType<T> extends infer InputType
    ? undefined extends InputType
      ? (input?: InputType) => void
      : (input: InputType) => void
    : never;

  /** **WARNING**: This will only be available after the CLI schema has been created */
  printCliHelp?: (options?: PrintHelpOptions) => void;

  /**
   * **WARNING**: This will only be available after the CLI schema has been created
   *
   * @throws {Error} - When the subcommand is not found
   */
  printSubcommandHelp?: (subcommandName: GetSubcommandsNames<T> | (string & {}), options?: PrintHelpOptions) => void;
}

type GetSubcommandsNames<T extends Partial<Subcommand>> = T extends Cli
  ? T["subcommands"] extends infer S extends readonly [Subcommand, ...Subcommand[]]
    ? { [Index in keyof S]: S[Index] extends { name: string } ? S[Index]["name"] : never }[number]
    : never
  : never;

export interface ActionsFunctionsWide {
  setAction: (actions: (data: OutputTypeWide) => void) => void;
  execute: (input?: InputTypeWide) => void;
  printCliHelp?: (options?: PrintHelpOptions) => void;
  printSubcommandHelp?: (subcommandName: string, options?: PrintHelpOptions) => void;
}
