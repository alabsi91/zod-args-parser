import type { Subcommand } from "./definitions-types.ts";
import type { Argument, Option } from "./definitions-types.ts";
import type { InferSchemaInputType, InferSchemaOutputType, SchemaType } from "./schema-types.ts";

export interface ContextBase<S extends SchemaType> {
  /** The schema that validates this option. */
  schema: S;

  /** Whether the schema is optional. */
  optional: boolean;

  /** The default value of the schema, if any. */
  defaultValue: InferSchemaOutputType<S> | undefined;
}

export interface OptionContextCli<S extends SchemaType> extends ContextBase<S> {
  /**
   * The CLI flag as provided by the user (e.g. `--foo` or `-f`).
   *
   * **Note:** This is only defined when the source is `terminal`.
   */
  flag: string;

  /**
   * The raw string value provided directly from the CLI.
   *
   * **Note:** This is only defined when the source is `terminal`.
   */
  stringValue: string;

  passedValue?: never;

  /**
   * The source of the option:
   *
   * - `terminal` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "terminal";
}

export interface OptionContextDefault<S extends SchemaType> extends ContextBase<S> {
  flag?: never;

  stringValue?: never;

  passedValue?: never;

  /**
   * The source of the option:
   *
   * - `terminal` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "default";
}

export interface OptionContextProgrammatic<S extends SchemaType> extends ContextBase<S> {
  flag?: never;

  stringValue?: never;

  /**
   * The value passed programmatically.
   *
   * **NOTE:** This is only defined when the source is `programmatic`.
   */
  passedValue: InferSchemaInputType<S>;

  /**
   * The source of the option:
   *
   * - `terminal` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "programmatic";
}

export type OptionContext<S extends SchemaType> =
  | OptionContextCli<S>
  | OptionContextDefault<S>
  | OptionContextProgrammatic<S>;

export interface ArgumentContextCli<S extends SchemaType> extends ContextBase<S> {
  /**
   * The raw string value provided directly from the CLI.
   *
   * **Note:** This is only defined when the source is `terminal`.
   */
  stringValue: string;

  passedValue?: never;

  /**
   * The source of the option:
   *
   * - `terminal` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "terminal";
}

export interface ArgumentContextDefault<S extends SchemaType> extends ContextBase<S> {
  stringValue?: never;

  passedValue?: never;

  /**
   * The source of the option:
   *
   * - `terminal` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "default";
}

export interface ArgumentContextProgrammatic<S extends SchemaType> extends ContextBase<S> {
  stringValue?: never;

  /**
   * The value passed programmatically.
   *
   * **NOTE:** This is only defined when the source is `programmatic`.
   */
  passedValue: InferSchemaInputType<S>;

  /**
   * The source of the option:
   *
   * - `terminal` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "programmatic";
}

export type ArgumentContext<S extends SchemaType> =
  | ArgumentContextCli<S>
  | ArgumentContextDefault<S>
  | ArgumentContextProgrammatic<S>;

export type OptionsRecordToOptionContext<T extends Record<string, Option>> = {
  [K in keyof T]: OptionContext<T[K]["type"]>;
};

export type ArgumentsRecordToArgumentContext<T extends Record<string, Argument>> = {
  [K in keyof T]: ArgumentContext<T[K]["type"]>;
};

export type Context<S extends readonly Partial<Subcommand>[]> = {
  [K in keyof S]: {
    subcommand: S[K]["name"] extends string ? S[K]["name"] : undefined;
    options: S[K]["options"] extends Record<string, Option> ? OptionsRecordToOptionContext<S[K]["options"]> : never;
    arguments: S[K]["arguments"] extends Record<string, Argument>
      ? ArgumentsRecordToArgumentContext<S[K]["arguments"]>
      : never;
    positionals: S[K]["allowPositionals"] extends true ? string[] : never;
  };
}[number];

export interface ContextWide {
  subcommand: string | undefined;
  options?: Record<string, OptionContext<SchemaType>>;
  arguments?: Record<string, ArgumentContext<SchemaType>>;
  positionals?: string[];
}
