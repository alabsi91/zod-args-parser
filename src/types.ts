import type { z } from "zod";

export type Subcommand = {
  /**
   * - The subcommand name, use `kebab-case`.
   * - Make sure to not duplicate commands and aliases.
   *
   * @example
   *   name: "test";
   *   name: "run-app";
   */
  name: string;

  /**
   * - The action is executed with the result of the parsed arguments.
   * - To get typescript types use `setAction` instead of this.
   *
   * @example
   *   const helpCommand = createSubcommand({ name: "help", options: [...] });
   *   helpCommand.setAction(res => console.log(res));
   */
  action?: (results?: any) => void;

  /**
   * - The description of the subcommand.
   * - Used for generating the help message.
   */
  description?: string;

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
};

export type Cli = Prettify<
  Omit<Subcommand, "name"> & {
    /** - The name of the CLI program. */
    cliName: string;

    /**
     * - The usage of the CLI program.
     * - Used for generating the help message.
     */
    usage?: string;
  }
>;

export type Option = {
  /**
   * - The name of the option, use `CamelCase`.
   * - For example: the syntax for the option `rootPath` is `--root-path`.
   */
  name: string;

  /**
   * - The will be used to validate the user input.
   *
   * @example
   *   type: z.boolean().default(false);
   *   type: z.coerce.number(); // will be coerced to number by Zod
   *   type: z.preprocess(parseStringToArrFn, z.array(z.coerce.number())); // array of numbers
   *
   * @see https://zod.dev/?id=types
   */
  type: z.ZodTypeAny;

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
};

export type Argument = {
  /** - The name of the argument. */
  name: string;

  /**
   * - The will be used to validate the user input.
   *
   * @example
   *   type: z.boolean();
   *   type: z.coerce.number(); // will be coerced to number by Zod
   *   type: z.preprocess(ParseStringToArrFn, z.array(z.coerce.number())); // array of numbers
   *
   * @see https://zod.dev/?id=types
   */
  type: z.ZodTypeAny;

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
};

export type ColorFnType = (...text: unknown[]) => string;

export type PrintHelpOpt = {
  /**
   * - **Optional** `boolean`
   * - Whether to print colors or not.
   * - Default: `true`
   */
  colors?: boolean;

  /**
   * - **Optional** `object`
   * - The colors to use for the help message.
   */
  customColors?: {
    title?: ColorFnType;
    description?: ColorFnType;
    default?: ColorFnType;
    optional?: ColorFnType;
    exampleTitle?: ColorFnType;
    example?: ColorFnType;
    command?: ColorFnType;
    option?: ColorFnType;
    argument?: ColorFnType;
    placeholder?: ColorFnType;
    punctuation?: ColorFnType;
  };
};

export type _Info = {
  /**
   * - The raw argument as it was passed in
   * - For options that have a default value and are not passed in, the raw argument will be `undefined`
   */
  rawArg?: string;
  /**
   * - The raw value of the argument as it was passed in
   * - It will be empty string for `boolean` options. E.g. `--help` or `-h`
   * - For options that have a default value and are not passed in, the raw value will be `undefined`
   */
  rawValue?: string;
  /**
   * - The source value of the argument:
   * - `cli`: The argument was passed in by the user
   * - `default`: The argument was not passed in and has a default value
   */
  source: "cli" | "default";
};

/**
 * - Infer the options type from a subcommand.
 *
 * @example
 *   const subcommand = createSubcommand({ name: "build", options: [...] });
 *   type OptionsType = InferOptionsType<typeof subcommand>;
 */
export type InferOptionsType<T extends Partial<Subcommand>> = T["options"] extends infer U extends Option[]
  ? ToOptional<{ [K in U[number]["name"]]: z.infer<Extract<U[number], { name: K }>["type"]> }>
  : undefined;

/**
 * - Infer the arguments type from a subcommand.
 *
 * @example
 *   const subcommand = createSubcommand({ name: "build", arguments: [...] });
 *   type ArgumentsType = InferArgumentsType<typeof subcommand>;
 */
export type InferArgumentsType<T extends Partial<Subcommand>> = T["arguments"] extends infer U extends Argument[]
  ? { [K in keyof U]: U[K] extends { type: z.ZodTypeAny } ? z.infer<U[K]["type"]> : never }
  : undefined;

/** `{ some props } & { other props }` => `{ some props, other props }` */
export type Prettify<T> = { [K in keyof T]: T[K] } & {};

/** Allow string type for literal union and get auto completion */
export type LiteralUnion<T extends string> = T | (string & {});

/** Extract the undefined properties from an object */
type UndefinedProperties<T> = { [P in keyof T]-?: undefined extends T[P] ? P : never }[keyof T];

/** Make undefined properties optional? */
type ToOptional<T> = Prettify<
  Partial<Pick<T, UndefinedProperties<T>>> & Pick<T, Exclude<keyof T, UndefinedProperties<T>>>
>;

export type OptionsArr2RecordType<T extends Option[] | undefined> = T extends Option[]
  ? ToOptional<{ [K in T[number]["name"]]: z.infer<Extract<T[number], { name: K }>["type"]> }>
  : object;

export type ArgumentsArr2ArrType<T extends Argument[] | undefined> = T extends Argument[]
  ? { arguments: { [K in keyof T]: T[K] extends { type: z.ZodTypeAny } ? z.infer<T[K]["type"]> : never } }
  : object;

export type Positional<S extends Partial<Subcommand>> = S["allowPositional"] extends true
  ? { positional: string[] }
  : object;

export type Info<T extends Option[] | undefined> = T extends Option[]
  ? {
      _info: ToOptional<{
        [K in T[number]["name"]]: Extract<T[number], { name: K }> extends infer U extends Option
          ? undefined extends z.infer<U["type"]>
            ? undefined | Prettify<_Info & U> // if optional add undefined
            : Prettify<_Info & U>
          : never;
      }>;
    }
  : object;

export type NoSubcommand = { name: undefined };

export type ParseResult<S extends Partial<Subcommand>[]> = {
  [K in keyof S]: Prettify<
    { subcommand: S[K]["name"] } & Positional<S[K]> &
      Info<S[K]["options"]> &
      OptionsArr2RecordType<S[K]["options"]> &
      ArgumentsArr2ArrType<S[K]["arguments"]>
  >;
}[number];

export type PrintMethods<N extends Subcommand["name"] | undefined> = {
  printCliHelp: (options?: PrintHelpOpt) => void;
  printSubcommandHelp: (subcommand: LiteralUnion<NonNullable<N>>, options?: PrintHelpOpt) => void;
};

export type UnSafeParseResult<S extends Partial<Subcommand>[]> =
  CheckDuplicatedSubcommands<S> extends infer E extends string
    ? E
    : Prettify<ParseResult<S> & PrintMethods<S[number]["name"]>>;

export type SafeParseResult<S extends Partial<Subcommand>[]> =
  CheckDuplicatedSubcommands<S> extends infer E extends string
    ? E
    : Prettify<
        ({ success: false; error: Error } | { success: true; data: ParseResult<S> }) & PrintMethods<S[number]["name"]>
      >;

export type ActionFn<T extends Subcommand | Cli> = {
  setAction: (actions: (res: UnSafeParseResult<[T]>) => void) => void;
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
 * - Return `subcommand` if not found
 */
export type CheckDuplicatedOptions<T extends Subcommand | Cli> = T["options"] extends infer O extends Option[]
  ? IsDuplicatesInArr<MapNameAndAliases2StrArr<O>> extends infer D extends string
    ? `>>> Error: Duplicated Options \`${D}\` <<<`
    : T
  : T;

/**
 * - Check for duplicated subcommands including aliases
 * - Return an error message if duplicated is found
 * - Return the `subcommand[]` if no error
 */
export type CheckDuplicatedSubcommands<T extends Partial<Subcommand>[]> =
  IsDuplicatesInArr<MapNameAndAliases2StrArr<T>> extends infer D extends string
    ? `>>> Error: Duplicated Subcommand \`${D}\` <<<`
    : T;
