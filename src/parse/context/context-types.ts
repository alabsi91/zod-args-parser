import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Subcommand } from "../../schemas/schema-types.ts";
import type { Argument, Option } from "../../schemas/schema-types.ts";
import type { Coerce } from "../../types.ts";

interface OptionContextCli<S extends StandardSchemaV1 = StandardSchemaV1, N extends string = string> {
  /** The name of the option as provided by the user. */
  name: N;

  /** The CLI flag as provided by the user (e.g. `--foo` or `-f`). */
  flag: string;

  /** The schema that validates this option. */
  schema: S;

  /** The string value supplied or inferred in case of a boolean. */
  stringValue: string;

  /** Undefined when the source is `cli`. */
  passedValue?: never;

  /**
   * The source of the option:
   *
   * - `cli` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "cli";
}

interface OptionContextDefault<S extends StandardSchemaV1 = StandardSchemaV1, N extends string = string> {
  /** The name of the option as provided by the user. */
  name: N;

  /** Undefined when the source is `default`. */
  flag?: never;

  /** The schema that validates this option. */
  schema: S;

  /** Undefined when the source is `default`. */
  stringValue?: never;

  /** Undefined when the source is `default`. */
  passedValue?: never;

  /**
   * The source of the option:
   *
   * - `cli` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "default";
}

interface OptionContextProgrammatic<S extends StandardSchemaV1 = StandardSchemaV1, N extends string = string> {
  /** The name of the option as provided by the user. */
  name: N;

  /** Undefined when the source is `value`. */
  flag?: never;

  /** The schema that validates this option. */
  schema: S;

  /** Undefined when the source is `value`. */
  stringValue?: never;

  /** The value passed programmatically. */
  passedValue: unknown;

  /**
   * The source of the option:
   *
   * - `cli` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "programmatic";
}

type OptionContext<S extends StandardSchemaV1 = StandardSchemaV1, N extends string = string> =
  | OptionContextCli<S, N>
  | OptionContextDefault<S, N>
  | OptionContextProgrammatic<S, N>;

interface ArgumentContextCli<S extends StandardSchemaV1 = StandardSchemaV1> {
  /** The raw string value provided directly from the CLI. */
  stringValue: string;

  /** Undefined when the source is `cli`. */
  passedValue?: never;

  /** The schema that validates this argument. */
  schema: S;

  /**
   * The source of the option:
   *
   * - `cli` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "cli";
}

interface ArgumentContextDefault<S extends StandardSchemaV1 = StandardSchemaV1> {
  /** Undefined when the source is `default`. */
  stringValue?: never;

  /** Undefined when the source is `default`. */
  passedValue?: never;

  /** The schema that validates this argument. */
  schema: S;

  /**
   * The source of the option:
   *
   * - `cli` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "default";
}

interface ArgumentContextProgrammatic<S extends StandardSchemaV1 = StandardSchemaV1> {
  /** Undefined when the source is `value`. */
  stringValue?: never;

  /** The value passed programmatically. */
  passedValue: unknown;

  /** The schema that validates this argument. */
  schema: S;

  /**
   * The source of the option:
   *
   * - `cli` — explicitly provided by the command-line interface.
   * - `default` — not provided by the user; a default value from the schema was used.
   * - `programmatic` — supplied directly from code (e.g., passed to a function or API).
   */
  source: "programmatic";
}

type ArgumentContext<S extends StandardSchemaV1 = StandardSchemaV1> =
  | ArgumentContextCli<S>
  | ArgumentContextDefault<S>
  | ArgumentContextProgrammatic<S>;

type OptionsArrayToOptionContext<T extends Record<string, Option>> = {
  [K in keyof T]: OptionContext<T[K]["type"]["schema"], Extract<K, string>>;
};

type ArgumentsArrayToArgumentContext<T extends [Argument, ...Argument[]]> = {
  [Index in keyof T]: ArgumentContext<T[Index] extends { type: Coerce } ? T[Index]["type"]["schema"] : never>;
};

export type Context<S extends readonly Partial<Subcommand>[]> = {
  [K in keyof S]: {
    subcommand: S[K]["name"] extends string ? S[K]["name"] : undefined;
    options: S[K]["options"] extends Record<string, Option> ? OptionsArrayToOptionContext<S[K]["options"]> : never;
    arguments: S[K]["arguments"] extends [Argument, ...Argument[]]
      ? ArgumentsArrayToArgumentContext<S[K]["arguments"]>
      : never;
    positionals: S[K]["allowPositionals"] extends true ? string[] : never;
  };
}[number];

/** Wide types of `ParseResult` */
export interface ContextWide {
  subcommand: string | undefined;
  options?: Record<string, OptionContext>;
  arguments?: ArgumentContext[];
  positionals?: string[];
}
