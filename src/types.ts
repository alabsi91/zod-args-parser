import type * as Z3 from "zod/v3";
import type * as Z4 from "zod/v4/core";
import type { ParseResult } from "./parser/parse/parse-types.js";
import type { ValidateResult } from "./parser/validate/validate-type.js";

export type SchemaV3 = Z3.ZodTypeAny;
export type SchemaV4 = Z4.$ZodType;
export type Schema = SchemaV3 | SchemaV4;

export type ZodInferOutput<T extends Schema> = T extends SchemaV4
  ? Z4.infer<T>
  : T extends SchemaV3
    ? Z3.infer<T>
    : never;

export type ZodInferInput<T extends Schema> = T extends SchemaV4
  ? Z4.input<T>
  : T extends SchemaV3
    ? Z3.input<T>
    : never;

export interface SubcommandMeta {
  /** Text to display as a placeholder for the expected arguments (e.g. `[options] <arg1> <arg2>`). */
  placeholder?: string;

  /**
   * Short explanation of what this cli/subcommand does.
   *
   * - Supports multi-line text.
   * - Console color styles (like `chalk`) can be used; they will be stripped out in markdown.
   */
  description?: string;

  /** E.g. `cliName subcommand [options] <arg1> <arg2>` */
  usage?: string;

  /**
   * Example value shown to the user.
   *
   * - In markdown, this will be displayed inside a code block.
   */
  example?: string;
}

export interface Subcommand {
  /**
   * - The subcommand name
   * - Make sure to not duplicate commands and aliases.
   *
   * @example
   *   name: "test";
   *   name: "run-app";
   */
  name: string;

  /**
   * - The aliases of the subcommand.
   * - Make sure to not duplicate aliases and commands.
   */
  aliases?: string[];

  /**
   * - Allows positionals arguments for this subcommand.
   * - Unlike `arguments`, which are strictly typed, positionals arguments are untyped and represented as a string array
   *   of variable length.
   * - When enabled and `arguments` are provided, `arguments` will be parsed first. Any remaining arguments will be
   *   considered positionals arguments and added to the `positionals` property in the result.
   */
  allowPositionals?: boolean;

  /**
   * - The options of the command.
   * - Those options are specific to this subcommand.
   */
  options?: [Option, ...Option[]];

  /**
   * - Specifies a list of strictly typed arguments.
   * - The order is important; for example, the first argument will be validated against the first specified type.
   * - It is recommended to not use optional arguments as the parser will fill the arguments by order and can't determine
   *   which arguments are optional.
   */
  arguments?: [Argument, ...Argument[]];

  /**
   * - The action is executed with the result of the parsed arguments.
   * - To get typescript types use `setAction` instead of this.
   *
   * @example
   *   const helpCommand = createSubcommand({ name: "help", options: [...] });
   *   helpCommand.setAction(res => console.log(res));
   */
  action?: (data?: any) => any;

  /**
   * - The preValidation hook is executed before the action.
   * - To get typescript types use `setPreValidationHook` instead of this.
   *
   * @example
   *   const helpCommand = createSubcommand({ name: "help", options: [...] });
   *   helpCommand.setPreValidationHook(ctx => console.log(ctx));
   */
  preValidation?: (context?: any) => any;

  /** - Metadata for the subcommand. */
  meta?: SubcommandMeta;
}

export type Cli = Prettify<
  Omit<Subcommand, "name" | "aliases" | "meta"> & {
    /** - The name of the CLI program. */
    cliName: string;

    /** - Metadata for the CLI. */
    meta?: Omit<SubcommandMeta, "placeholder">;
  }
>;

export interface OptionMeta {
  /** Text to display as a placeholder for the expected value (e.g. `<path>`, `<value>`). */
  placeholder?: string;

  /**
   * Short explanation of what this option does.
   *
   * - Supports multi-line text.
   * - Console color styles (like `chalk`) can be used; they will be stripped out in markdown.
   */
  description?: string;

  /**
   * Example value shown to the user.
   *
   * - In markdown, this will be displayed inside a code block.
   */
  example?: string;

  /**
   * Custom default value.
   *
   * - Use an empty string to intentionally show no default.
   */
  default?: string;

  /** Override whether this option is considered optional. */
  optional?: boolean;
}

export interface Option {
  /**
   * The name of the option, use a valid **JavaScript** variable name.\
   * **Supports:** `camelCase`, `PascalCase`, `snake_case`, and `SCREAMING_SNAKE_CASE`.\
   * **Examples:**
   *
   * - `I` or `i` ➡️ `-i`
   * - `InputDir`, `inputDir`, or `INPUT_DIR` ➡️ `--input-dir`
   * - `Help`, `help`, or `HELP` ➡️ `--help`
   */
  name: string;

  /**
   * - The aliases of the option, use `CamelCase`.
   * - Here you can specify short names or flags.
   * - Make sure to not duplicate aliases.
   */
  aliases?: [string, ...string[]];

  /**
   * - The will be used to validate the user input.
   *
   * @see https://zod.dev/api
   */
  type: Schema;

  /** Used for help message and documentation generation. */
  meta?: OptionMeta;
}

export interface ArgumentMeta {
  /** - The name of the argument. */
  name?: string;

  /**
   * Short explanation of what this argument does.
   *
   * - Supports multi-line text.
   * - Console color styles (like `chalk`) can be used; they will be stripped out in markdown.
   */
  description?: string;

  /**
   * Example value shown to the user.
   *
   * - In markdown, this will be displayed inside a code block.
   */
  example?: string;

  /**
   * Custom default value.
   *
   * - Use an empty string to intentionally show no default.
   */
  default?: string;

  /** Override whether this option is considered optional. */
  optional?: boolean;
}

export interface Argument {
  /**
   * - The will be used to validate the user input.
   *
   * @see https://zod.dev/api
   */
  type: Schema;

  /** Used for help message and documentation generation. */
  meta?: ArgumentMeta;
}

export type ColorFunctionType = (...text: unknown[]) => string;

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

/**
 * - Infer the options type from a subcommand.
 *
 * @deprecated Use `InferOptionsOutput` instead.
 */
export type InferOptionsType<T extends Partial<Subcommand>> = InferOptionsOutput<T>;

/**
 * - Infer the options output type (after zod validation) from a subcommand.
 *
 * @example
 *   const subcommand = createSubcommand({ name: "build", options: [...] });
 *   type OptionsType = InferOptionsOutput<typeof subcommand>;
 */
export type InferOptionsOutput<T extends Partial<Subcommand>> = T["options"] extends infer U extends Option[]
  ? ToOptional<{ [K in U[number]["name"]]: ZodInferOutput<Extract<U[number], { name: K }>["type"]> }>
  : undefined;

/**
 * - Infer the options input type (before zod validation) from a subcommand.
 *
 * @example
 *   const subcommand = createSubcommand({ name: "build", options: [...] });
 *   type OptionsType = InferOptionsInput<typeof subcommand>;
 */
export type InferOptionsInput<T extends Partial<Subcommand>> = T["options"] extends infer U extends Option[]
  ? ToOptional<{ [K in U[number]["name"]]: ZodInferInput<Extract<U[number], { name: K }>["type"]> }>
  : undefined;

/**
 * - Infer the arguments output type (after zod validation) from a subcommand.
 *
 * @deprecated Use `InferArgumentsOutput` instead.
 */
export type InferArgumentsType<T extends Partial<Subcommand>> = InferArgumentsOutput<T>;

/**
 * - Infer the arguments output type (after zod validation) from a subcommand.
 *
 * @example
 *   const subcommand = createSubcommand({ name: "build", arguments: [...] });
 *   type ArgumentsType = InferArgumentsOutput<typeof subcommand>;
 */
export type InferArgumentsOutput<T extends Partial<Subcommand>> = T["arguments"] extends infer U extends Argument[]
  ? { [K in keyof U]: U[K] extends { type: Schema } ? ZodInferOutput<U[K]["type"]> : never }
  : undefined;

/**
 * - Infer the arguments Input type (before zod validation) from a subcommand.
 *
 * @example
 *   const subcommand = createSubcommand({ name: "build", arguments: [...] });
 *   type ArgumentsType = InferArgumentsInput<typeof subcommand>;
 */
export type InferArgumentsInput<T extends Partial<Subcommand>> = T["arguments"] extends infer U extends Argument[]
  ? { [K in keyof U]: U[K] extends { type: Schema } ? ZodInferInput<U[K]["type"]> : never }
  : undefined;

/** `{ some props } & { other props }` => `{ some props, other props }` */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Allow string type for literal union and get auto completion */
export type LiteralUnion<T extends string> = T | (string & {});

/** Extract the undefined properties from an object */
export type UndefinedProperties<T> = { [P in keyof T]-?: undefined extends T[P] ? P : never }[keyof T];

/** Make undefined properties optional? */
export type ToOptional<T> = Prettify<
  Partial<Pick<T, UndefinedProperties<T>>> & Pick<T, Exclude<keyof T, UndefinedProperties<T>>>
>;

export type NoSubcommand = { name: undefined };

export type PrintMethods<N extends Subcommand["name"]> = {
  printCliHelp: (style?: Partial<HelpMessageStyle>) => void;
  printSubcommandHelp: (subcommand: LiteralUnion<NonNullable<N>>, style?: Partial<HelpMessageStyle>) => void;
};

export type UnsafeParseResult<S extends Partial<Subcommand>[]> =
  CheckDuplicatedSubcommands<S> extends infer E extends string
    ? E
    : Prettify<ValidateResult<S> & PrintMethods<NonNullable<S[number]["name"]>>>;

export type SafeParseResult<S extends Partial<Subcommand>[]> =
  CheckDuplicatedSubcommands<S> extends infer E extends string
    ? E
    : Prettify<
        ({ success: false; error: Error } | { success: true; data: ValidateResult<S> }) &
          PrintMethods<NonNullable<S[number]["name"]>>
      >;

export type ActionsFunctions<T extends Subcommand | Cli> = {
  setAction: (actions: (data: UnsafeParseResult<[T]>) => void) => void;
  setPreValidationHook: (hook: (context: ParseResult<[T]>) => void) => void;
};

/** - Combine `name` and `aliases` to a `string[]` */
type MapNameAndAliasesToStringArray<T extends { name?: string; aliases?: string[] }[]> = T extends [
  infer First extends Subcommand,
  ...infer Rest,
]
  ? Rest extends { name?: string; aliases?: string[] }[]
    ? [
        First["name"],
        ...(First["aliases"] extends string[] ? First["aliases"] : []),
        ...MapNameAndAliasesToStringArray<Rest>,
      ]
    : [First["name"], ...(First["aliases"] extends string[] ? First["aliases"] : [])]
  : [];

/**
 * - Find duplicated items in an array and return it
 * - Return `false` if not found
 */
type IsDuplicatesInArray<Input extends any[]> = Input extends [infer Item, ...infer Rest]
  ? Rest extends any[]
    ? Item extends Rest[number]
      ? Item
      : IsDuplicatesInArray<Rest>
    : false
  : false;

/**
 * - Check if there are duplicated options including aliases in `subcommand`
 * - Return an error message if duplicated is found
 * - Return `undefined` if not found
 */
export type CheckDuplicatedOptions<T extends { options?: Option[] }> = T["options"] extends infer O extends Option[]
  ? IsDuplicatesInArray<MapNameAndAliasesToStringArray<O>> extends infer Name extends string
    ? `❌>>> Error: Duplicated Options. Check the options with the name \`${Name}\` <<<❌`
    : undefined
  : undefined;

/**
 * - Check for duplicated subcommands including aliases
 * - Return an error message if duplicated is found
 * - Return the `undefined` if no error
 */
type CheckDuplicatedSubcommands<T extends Partial<Subcommand>[]> =
  IsDuplicatesInArray<MapNameAndAliasesToStringArray<T>> extends infer Name extends string
    ? `❌>>> Error: Duplicated Subcommand. Check the subcommands with the name \`${Name}\` <<<❌`
    : undefined;

type OptionalUnion = Z3.ZodOptional<Z3.ZodAny> | Z4.$ZodOptional | Z3.ZodDefault<Z3.ZodAny> | Z4.$ZodDefault;

/**
 * - Insures that only the last argument is optional
 * - Insures no optional arguments are allowed when `allowPositionals` is enabled
 */
export type CheckArgumentsOptional<T extends { allowPositionals?: boolean; arguments?: readonly Argument[] }> =
  T["arguments"] extends readonly [...infer Rest, infer Last]
    ? Last extends { type: OptionalUnion }
      ? T["allowPositionals"] extends true
        ? `❌>>> Error: Cannot have optional arguments when \`allowPositionals\` is enabled. The argument \`${Last extends { meta: { name: string } } ? Last["meta"]["name"] : ""}\` should not be optional <<<❌`
        : T
      : Extract<Rest[number], { type: OptionalUnion }> extends never
        ? T
        : T["allowPositionals"] extends true
          ? `❌>>> Error: Cannot have optional arguments when \`allowPositionals\` is enabled. The argument \`${Rest[number] extends { name: string } ? Rest[number]["name"] : ""}\` should not be optional <<<❌`
          : `❌>>> Error: Only the last argument may be optional. The argument \`${Rest[number] extends { meta: { name: string } } ? Rest[number]["meta"]["name"] : ""}\` should not be optional <<<❌`
    : T;
