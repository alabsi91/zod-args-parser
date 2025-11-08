import type { Subcommand } from "./definitions-types.ts";
import type { Argument, Option } from "./definitions-types.ts";
import type { SchemaType } from "./schema-types.ts";

export interface ContextBase<S extends SchemaType, N extends string = string> {
  /** The name of the argument/option as provided in the schema. */
  name: N;

  /** The schema that validates this option. */
  schema: S;

  /** Whether the schema is optional. */
  optional: boolean;

  /** The default value of the schema, if any. */
  defaultValue: unknown;
}

export interface OptionContextCli<S extends SchemaType, N extends string> extends ContextBase<S, N> {
  /** The CLI flag as provided by the user (e.g. `--foo` or `-f`). */
  flag: string;

  /** The string value supplied or inferred in case of a boolean. */
  stringValue: string;

  /** Undefined when the source is `terminal`. */
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

export interface OptionContextDefault<S extends SchemaType, N extends string> extends ContextBase<S, N> {
  /** Undefined when the source is `default`. */
  flag?: never;

  /** Undefined when the source is `default`. */
  stringValue?: never;

  /** Undefined when the source is `default`. */
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

export interface OptionContextProgrammatic<S extends SchemaType, N extends string> extends ContextBase<S, N> {
  /** Undefined when the source is `programmatic`. */
  flag?: never;

  /** Undefined when the source is `programmatic`. */
  stringValue?: never;

  /** The value passed programmatically. */
  passedValue: unknown;

  /**
   * The source of the option:
   *
   * - `terminal` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "programmatic";
}

export type OptionContext<S extends SchemaType, N extends string> =
  | OptionContextCli<S, N>
  | OptionContextDefault<S, N>
  | OptionContextProgrammatic<S, N>;

export interface ArgumentContextCli<S extends SchemaType, N extends string> extends ContextBase<S, N> {
  /** The raw string value provided directly from the CLI. */
  stringValue: string;

  /** Undefined when the source is `terminal`. */
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

export interface ArgumentContextDefault<S extends SchemaType, N extends string> extends ContextBase<S, N> {
  /** Undefined when the source is `default`. */
  stringValue?: never;

  /** Undefined when the source is `default`. */
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

export interface ArgumentContextProgrammatic<S extends SchemaType, N extends string> extends ContextBase<S, N> {
  /** Undefined when the source is `programmatic`. */
  stringValue?: never;

  /** The value passed programmatically. */
  passedValue: unknown;

  /**
   * The source of the option:
   *
   * - `terminal` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "programmatic";
}

export type ArgumentContext<S extends SchemaType, N extends string> =
  | ArgumentContextCli<S, N>
  | ArgumentContextDefault<S, N>
  | ArgumentContextProgrammatic<S, N>;

export type OptionsRecordToOptionContext<T extends Record<string, Option>> = {
  [K in keyof T]: OptionContext<T[K]["type"], Extract<K, string>>;
};

export type ArgumentsRecordToArgumentContext<T extends Record<string, Argument>> = {
  [K in keyof T]: ArgumentContext<T[K]["type"], Extract<K, string>>;
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
  options?: Record<string, OptionContext<SchemaType, string>>;
  arguments?: Record<string, ArgumentContext<SchemaType, string>>;
  positionals?: string[];
}
