import type { Argument, Option, Prettify, Schema, Subcommand } from "../../types.js";

type ParsedOption<S extends Schema = Schema, N extends string = string> =
  | {
      /** The name of the option as provided by the user. */
      name: N;
      /** The CLI flag as provided by the user (e.g. `--foo` or `-f`). */
      flag: string;
      /** The schema that validates this option. */
      schema: S;
      /** The raw string value supplied for this option from the CLI. */
      rawValue: string;
      /**
       * The source of the option:
       *
       * - `cli`: provided explicitly in the CLI
       * - `default`: not provided, and the schema has a default.
       */
      source: "cli";
    }
  | {
      /** The name of the option as provided by the user. */
      name: N;
      /** Undefined when the source is `default`. */
      flag?: never;
      /** The schema that validates this option. */
      schema: S;
      /** Undefined when the source is `default`. */
      rawValue?: string | undefined;
      /**
       * The source of the option:
       *
       * - `cli`: provided explicitly in the CLI
       * - `default`: not provided, and the schema has a default.
       */
      source: "default";
    };

type ParsedArgument<S extends Schema = Schema> =
  | {
      /** The raw string value provided directly from the CLI. */
      rawValue: string;
      /** The schema that validates this argument. */
      schema: S;
      /**
       * The source of the option:
       *
       * - `cli`: provided explicitly in the CLI
       * - `default`: not provided, and the schema has a default.
       */
      source: "cli";
    }
  | {
      /** Undefined when the source is `default`. */
      rawValue?: never;
      /** The schema that validates this argument. */
      schema: S;
      /**
       * The source of the option:
       *
       * - `cli`: provided explicitly in the CLI
       * - `default`: not provided, and the schema has a default.
       */
      source: "default";
    };

type OptionsArr2Record<T extends Option[] | undefined> = T extends Option[]
  ? { [K in T[number]["name"]]: ParsedOption<Extract<T[number], { name: K }>["type"], K> }
  : Record<never, never>;

type ArgumentsArr2ArrType<T extends Argument[] | undefined> = T extends Argument[]
  ? { [K in keyof T]: ParsedArgument<T[K] extends { type: Schema } ? T[K]["type"] : never> }
  : never;

export type ParseResult<S extends Partial<Subcommand>[]> = {
  [K in keyof S]: Prettify<{
    subcommand: S[K]["name"] extends string ? S[K]["name"] : undefined;
    positional: S[K]["allowPositional"] extends true ? string[] : never;
    options: OptionsArr2Record<S[K]["options"]>;
    arguments: ArgumentsArr2ArrType<S[K]["arguments"]>;
  }>;
}[number];

export type ParseCtx = {
  subcommand: string | undefined;
  options: Record<string, ParsedOption>;
  arguments?: ParsedArgument[];
  positional?: string[];
};
