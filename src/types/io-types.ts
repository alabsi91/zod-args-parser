import type { Context, ContextWide } from "./context-types.ts";
import type { Argument, Cli, Option, Subcommand } from "./definitions-types.ts";
import type { InferSchemaInputType, InferSchemaOutputType } from "./schema-types.ts";
import type {
  MakeTailOptional,
  Prettify,
  ToOptional,
  WidenIfAllItemsOptional,
  WidenIfAllPropertiesOptional,
} from "./utilities-types.ts";

/** Output options type */
type OptionsOutputType<T extends Record<string, Option>> = Prettify<
  ToOptional<{ [K in keyof T]: InferSchemaOutputType<T[K]["type"]> }>
>;

/** Input options type */
type OptionsInputType<T extends Record<string, Option>> = Prettify<
  ToOptional<{ [K in keyof T]: InferSchemaInputType<T[K]["type"]> }>
>;

/** Output arguments type */
type ArgumentsOutputType<T extends [Argument, ...Argument[]]> = Prettify<{
  [K in keyof T]: T[K] extends Argument ? InferSchemaOutputType<T[K]["type"]> : never;
}>;

/** Input arguments type */
type ArgumentsInputType<T extends [Argument, ...Argument[]]> = Prettify<{
  [K in keyof T]: T[K] extends Argument ? InferSchemaInputType<T[K]["type"]> : never;
}>;

/**
 * - Infer options output type.
 *
 * @example
 *   const myCommand = defineSubcommand({ name: "my-command", options: [...] });
 *   type MyCommandOptionsOutput = InferOptionsOutputType<typeof myCommand>;
 */
export type InferOptionsOutputType<T extends Cli | Subcommand> =
  T["options"] extends Record<string, Option> ? OptionsOutputType<T["options"]> : undefined;

/**
 * - Infer arguments output type.
 *
 * @example
 *   const myCommand = defineSubcommand({ name: "my-command", arguments: [...] });
 *   type MyCommandArgumentsOutput = InferArgumentsOutputType<typeof myCommand>;
 */
export type InferArgumentsOutputType<T extends Cli | Subcommand> = T["arguments"] extends [Argument, ...Argument[]]
  ? ArgumentsOutputType<T["arguments"]>
  : undefined;

/**
 * - Infer arguments input type.
 *
 * @example
 *   const myCommand = defineSubcommand({ name: "my-command", arguments: [...] });
 *   type MyCommandArgumentsInput = InferArgumentsInputType<typeof myCommand>;
 */
export type InferArgumentsInputType<T extends Cli | Subcommand> = T["arguments"] extends [Argument, ...Argument[]]
  ? // Make the tail of a tuple optional if it extends undefined
    MakeTailOptional<ArgumentsInputType<T["arguments"]>>
  : undefined;

/**
 * - Infer options input type.
 *
 * @example
 *   const myCommand = defineSubcommand({ name: "my-command", options: [...] });
 *   type MyCommandOptionsInput = inferOptionsInputType<typeof myCommand>;
 */
export type inferOptionsInputType<T extends Cli | Subcommand> =
  T["options"] extends Record<string, Option> ? OptionsInputType<T["options"]> : undefined;

/**
 * - Infer schema input type.
 *
 * @example
 *   const myCommand = defineSubcommand({ name: "my-command", ... });
 *   type MyCommandInput = InferInputType<typeof myCommand>;
 */
export type InferInputType<T extends Cli | Subcommand> = Prettify<
  // Add undefined if all properties are optional
  WidenIfAllPropertiesOptional<
    // Make properties that can be undefined optional
    ToOptional<{
      positionals: T["allowPositionals"] extends true ? string[] : undefined;

      options: T["options"] extends Record<string, Option>
        ? // Add undefined if all properties are optional
          WidenIfAllPropertiesOptional<
            // Options types as record
            OptionsInputType<T["options"]>
          >
        : undefined;

      arguments: T["arguments"] extends [Argument, ...Argument[]]
        ? // Add undefined if all items are optional
          WidenIfAllItemsOptional<
            // Make the tail of a tuple optional if it extends undefined
            MakeTailOptional<
              // Arguments types as tuple
              ArgumentsInputType<T["arguments"]>
            >
          >
        : undefined;
    }>
  >
>;

export interface InputTypeWide {
  arguments?: unknown[];
  options?: Record<string, unknown>;
  positionals?: string[];
}

/**
 * - Infer schema output type.
 *
 * @example
 *   const myCommand = defineSubcommand({ name: "my-command", ... });
 *   type MyCommandOutput = InferOutputType<typeof myCommand>;
 */
export type InferOutputType<T extends Cli | Subcommand> = Prettify<{
  subcommand: "name" extends keyof T ? T["name"] : undefined;
  options: T["options"] extends Record<string, Option> ? OptionsOutputType<T["options"]> : never;
  arguments: T["arguments"] extends [Argument, ...Argument[]] ? ArgumentsOutputType<T["arguments"]> : never;
  positionals: T["allowPositionals"] extends true ? string[] : never;
  context: Context<[T]>;
}>;

/** Same as `InferOutputType` but for multiple subcommands/cli */
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
