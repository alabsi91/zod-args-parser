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
   * - The description of the subcommand.
   * - Used for generating the help message.
   */
  description?: string;

  /** - The usage message in the help message. */
  usage?: string;

  /** - Used for generating the help message. */
  placeholder?: string;

  /**
   * - Provide an example to show to the user.
   * - Used for generating the help message.
   */
  example?: string;

  /**
   * - The aliases of the subcommand.
   * - Make sure to not duplicate aliases and commands.
   */
  aliases?: string[];

  /**
   * - Allows positional arguments for this subcommand.
   * - Unlike `arguments`, which are strictly typed, positional arguments are untyped and represented as a string array of
   *   variable length.
   * - When enabled and `arguments` are provided, `arguments` will be parsed first. Any remaining arguments will be
   *   considered positional arguments and added to the `positional` property in the result.
   */
  allowPositional?: boolean;

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
  action?: (results?: any) => any;

  /**
   * - The preValidation hook is executed before the action.
   * - To get typescript types use `setPreValidationHook` instead of this.
   *
   * @example
   *   const helpCommand = createSubcommand({ name: "help", options: [...] });
   *   helpCommand.setPreValidationHook(ctx => console.log(ctx));
   */
  preValidation?: (ctx?: any) => any;
}

export type Cli = Prettify<
  Omit<Subcommand, "name" | "aliases" | "placeholder"> & {
    /** - The name of the CLI program. */
    cliName: string;
  }
>;

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
   * - The will be used to validate the user input.
   *
   * @see https://zod.dev/api
   */
  type: Schema;

  /**
   * - The description of the option.
   * - Used for generating the help message.
   */
  description?: string;

  /** - Used for generating the help message. */
  placeholder?: string;

  /**
   * - The example of using the option.
   * - Used for generating the help message.
   */
  example?: string;

  /**
   * - The aliases of the option, use `CamelCase`.
   * - Here you can specify short names or flags.
   * - Make sure to not duplicate aliases.
   */
  aliases?: [string, ...string[]];
}

export interface Argument {
  /** - The name of the argument. */
  name: string;

  /**
   * - The will be used to validate the user input.
   *
   * @see https://zod.dev/api
   */
  type: Schema;

  /**
   * - The description of the argument.
   * - Used for generating the help message.
   */
  description?: string;

  /**
   * - The example of using the argument.
   * - Used for generating the help message.
   */
  example?: string;
}

export type ColorFnType = (...text: unknown[]) => string;

/** - The colors to use for the help message. */
export type HelpMsgStyle = Record<
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
  ColorFnType
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
  printCliHelp: (style?: Partial<HelpMsgStyle>) => void;
  printSubcommandHelp: (subcommand: LiteralUnion<NonNullable<N>>, style?: Partial<HelpMsgStyle>) => void;
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

export type ActionsFn<T extends Subcommand | Cli> = {
  setAction: (actions: (res: UnsafeParseResult<[T]>) => void) => void;
  setPreValidationHook: (hookFn: (ctx: ParseResult<[T]>) => void) => void;
};

/** - Combine `name` and `aliases` to a `string[]` */
type MapNameAndAliases2StrArr<T extends { name?: string; aliases?: string[] }[]> = T extends [
  infer First extends Subcommand,
  ...infer Rest,
]
  ? Rest extends { name?: string; aliases?: string[] }[]
    ? [First["name"], ...(First["aliases"] extends string[] ? First["aliases"] : []), ...MapNameAndAliases2StrArr<Rest>]
    : [First["name"], ...(First["aliases"] extends string[] ? First["aliases"] : [])]
  : [];

/**
 * - Find duplicated items in an array and return it
 * - Return `false` if not found
 */
type IsDuplicatesInArr<Input extends any[]> = Input extends [infer Item, ...infer Rest]
  ? Rest extends any[]
    ? Item extends Rest[number]
      ? Item
      : IsDuplicatesInArr<Rest>
    : false
  : false;

/**
 * - Check if there are duplicated options including aliases in `subcommand`
 * - Return an error message if duplicated is found
 * - Return `undefined` if not found
 */
export type CheckDuplicatedOptions<T extends { options?: Option[] }> = T["options"] extends infer O extends Option[]
  ? IsDuplicatesInArr<MapNameAndAliases2StrArr<O>> extends infer Name extends string
    ? `>>> Error: Duplicated Options. Check the options with the name \`${Name}\` <<<`
    : undefined
  : undefined;

/**
 * - Check for duplicated subcommands including aliases
 * - Return an error message if duplicated is found
 * - Return the `undefined` if no error
 */
type CheckDuplicatedSubcommands<T extends Partial<Subcommand>[]> =
  IsDuplicatesInArr<MapNameAndAliases2StrArr<T>> extends infer Name extends string
    ? `>>> Error: Duplicated Subcommand. Check the subcommands with the name \`${Name}\` <<<`
    : undefined;

/**
 * - Check for duplicated arguments
 * - Return an error message if duplicated is found
 * - Return the `undefined` if no error
 */
export type CheckDuplicatedArguments<T extends { arguments?: Argument[] }> = T["arguments"] extends infer A extends
  Argument[]
  ? IsDuplicatesInArr<MapNameAndAliases2StrArr<A>> extends infer Name extends string
    ? `>>> Error: Duplicated Arguments. Check the arguments with the name \`${Name}\` <<<`
    : undefined
  : undefined;

type OptionalUnion = Z3.ZodOptional<Z3.ZodAny> | Z4.$ZodOptional | Z3.ZodDefault<Z3.ZodAny> | Z4.$ZodDefault;

/**
 * - Insures that only the last argument is optional
 * - Insures no optional arguments are allowed when `allowPositional` is enabled
 */
export type CheckArgumentsOptional<T extends { allowPositional?: boolean; arguments?: readonly Argument[] }> =
  T["arguments"] extends readonly [...infer Rest, infer Last]
    ? Last extends { type: OptionalUnion }
      ? T["allowPositional"] extends true
        ? `>>> Error: Cannot have optional arguments when \`allowPositional\` is enabled. The argument \`${Last extends { name: string } ? Last["name"] : ""}\` should not be optional <<<`
        : T
      : Extract<Rest[number], { type: OptionalUnion }> extends never
        ? T
        : T["allowPositional"] extends true
          ? `>>> Error: Cannot have optional arguments when \`allowPositional\` is enabled. The argument \`${Rest[number] extends { name: string } ? Rest[number]["name"] : ""}\` should not be optional <<<`
          : `>>> Error: Only the last argument may be optional. The argument \`${Rest[number] extends { name: string } ? Rest[number]["name"] : ""}\` should not be optional <<<`
    : T;
