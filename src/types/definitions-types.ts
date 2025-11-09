import type { OutputTypeWide } from "./io-types.ts";
import type { InferSchemaOutputType, SchemaResult, SchemaType } from "./schema-types.ts";
import type { CoerceMethod, CoerceTypes } from "./types.ts";
import type { Widen } from "./utilities-types.ts";

export interface PreparedType {
  schema: SchemaType;
  coerceTo: CoerceTypes | undefined;
  optional: boolean;
  defaultValue: unknown;
  validate: (value: string | undefined) => SchemaResult;
}

// Derived from `Subcommand`
export interface Cli extends Omit<Subcommand, "name" | "aliases" | "meta"> {
  /** The name of the CLI program (main command). */
  cliName: string;

  /** Array of subcommands. Do not pass them directly instead use `defineSubcommand` */
  subcommands?: [Subcommand, ...Subcommand[]];

  /** The metadata for the CLI. */
  meta?: Omit<SubcommandMeta, "placeholder" | "hidden">;
}

export interface MetaBase {
  /**
   * Short explanation.
   *
   * Supports multi-line text and ansi color styles (like `chalk`).
   *
   * **NOTE:** For terminal markdown, use `descriptionMarkdown` instead.
   */
  description?: string;

  /**
   * Enables Markdown formatting for terminal output and generated documentation.
   *
   * Most common Markdown features (headings, lists, code, links, etc.) are supported when displayed in a terminal.
   *
   * **Terminal help output**
   *
   * - If both `description` and `descriptionMarkdown` are provided, only `description` is shown.
   *
   * **Markdown file generation**
   *
   * - If both fields are provided, only `descriptionMarkdown` is used.
   */
  descriptionMarkdown?: string;

  /**
   * Example to shown to the user.
   *
   * - In markdown, this will be displayed inside a code block.
   */
  example?: string;

  /** Hide this argument from being documented (help message / markdown). This is useful for internal use. */
  hidden?: boolean;
}

export interface SubcommandMeta extends MetaBase {
  /** Text to display as a placeholder for the expected arguments (e.g. `[options] <arg1> <arg2>`). */
  placeholder?: string;

  /** E.g. `cliName subcommand [options] <arg1> <arg2>` */
  usage?: string;
}

export interface Subcommand {
  /**
   * The subcommand name
   *
   * - Make sure there are no duplicates across names and aliases in the same CLI.
   *
   * @example
   *   name: "test-app";
   *   name: "run-app";
   */
  name: string;

  /**
   * A list of aliases that can be used to invoke this subcommand.
   *
   * **NOTE:** Make sure there are no duplicates across names and aliases in the same CLI.
   *
   * @example
   *   name: "test-app";
   *   aliases: ["test"];
   *
   *   name: "run-app";
   *   aliases: ["run"];
   */
  aliases?: string[];

  /**
   * - Allows positionals arguments for this subcommand.
   * - Unlike `arguments`, which are strictly typed tuples, positionals arguments are untyped and represented as a string
   *   array of variable length.
   * - When enabled and typed `arguments` are provided, `arguments` will be parsed first. Any remaining arguments will be
   *   considered positionals arguments and added to the `positionals` property in the result.
   */
  allowPositionals?: boolean;

  /**
   * For the option name (the key), use a valid **JavaScript** variable name.\
   * **Supports:** `camelCase`, `PascalCase`, `snake_case`, and `SCREAMING_SNAKE_CASE`.\
   * **Examples:**
   *
   * - `I` or `i` => `-i`
   * - `InputDir`, `inputDir`, or `INPUT_DIR` => `--input-dir`
   * - `Help`, `help`, or `HELP` => `--help`
   */
  options?: Record<string, Option>;

  /**
   * - Specifies a list of strictly typed arguments.
   * - The order is important; for example, the first argument will be validated against the first specified type.
   * - When **`allowPositional`** is **disabled**, the last argument can be optional.
   * - When **`allowPositional`** is **enabled**, no optional arguments are allowed.
   *
   * **IMPORTANT:** The order of arguments matters!
   */
  arguments?: Record<string, Argument>;

  /** Metadata used for help messages and documentation generation */
  meta?: SubcommandMeta;

  /**
   * - A list of functions to execute when the subcommand/CLI is executed.
   * - Do not use this directly instead use `onExecute` after creating the subcommand/cli.
   *
   * @deprecated For internal use only
   * @example
   *   const helpCommand = defineSubcommand({ name: "help", options: [...] });
   *   helpCommand.onExecute((result) => console.log(result));
   *
   *   const myCli = defineCLI({ name: "my-cli", subcommands: [helpCommand] });
   *   myCli.onExecute((result) => console.log(result));
   */
  _onExecute?: ((result: OutputTypeWide) => void)[];
}

export interface OptionMeta extends MetaBase {
  /** Text to display as a placeholder for the expected value (e.g. `<path>`, `<value>`). */
  placeholder?: string;

  /**
   * Custom default value.
   *
   * - Use an empty string to intentionally show no default.
   */
  default?: string;

  /** Override whether this option is considered optional. */
  optional?: boolean;
}

export interface Option<Schema extends SchemaType = SchemaType> {
  /**
   * For the option alias, use a valid **JavaScript** variable name.\
   * **Supports:** `camelCase`, `PascalCase`, `snake_case`, and `SCREAMING_SNAKE_CASE`.\
   * **Examples:**
   *
   * - `I` or `i` => `-i`
   * - `InputDir`, `inputDir`, or `INPUT_DIR` => `--input-dir`
   * - `Help`, `help`, or `HELP` => `--help`
   */
  aliases?: string[];

  /**
   * A schema to validate the user input.
   *
   * - Any validation library that supports `StandardSchemaV1` can be used.
   * - Use an object schema with the key `value` to specify the type. The reason behind that is that not all validation
   *   libraries support **optional** and **default values** for primitive types.
   *
   * @example
   *   type: z.object({ value: z.string().optional() }); // Zod
   *   type: type({ "value?": "string" }); // ArkType
   */
  type: Schema;

  /**
   * Since the terminal input is a string, we need to coerce it.
   *
   * **NOTE:**
   *
   * - You can use the provided `coerce` methods to coerce the terminal input.
   * - The output type of the `coerce` method should match the output type of the schema.
   *
   * @example
   *   type: z.object({ value: z.boolean() });
   *   coerce: coerce.boolean;
   *
   *   type: z.object({ value: z.string().array() });
   *   coerce: coerce.stringArray(",");
   */
  coerce: CoerceMethod<Widen<InferSchemaOutputType<Schema>>>;

  /**
   * When `true`, this option must appear on its own. It cannot be used together with any other option or argument,
   * except those explicitly listed in `requires`.
   *
   * Only explicitly provided inputs are checked — options or arguments that are present only through default values are
   * ignored.
   *
   * @example
   *   defineOptions({
   *     // nothing else can be used with this option (no other options or arguments)
   *     output: {
   *       exclusive: true,
   *     },
   *   });
   *
   *   defineOptions({
   *     // only `input` (could be an option or argument name) can be used with this option
   *     output: {
   *       exclusive: true,
   *       requires: ["input"],
   *     },
   *   });
   */
  exclusive?: boolean;

  /**
   * Declares other options ir arguments that must be provided when this option is used.
   *
   * If this option appears in the parsed input, each entry listed in `requires` must also be present. Default values do
   * not satisfy this requirement — the user must explicitly provide the required option(s).
   *
   * Example:
   *
   * @example
   *   defineOptions({
   *     // using the option `output` also requires `input` (could be an option or argument name)
   *     output: {
   *       requires: ["input"],
   *     },
   *   });
   */
  requires?: string[];

  /**
   * Declares options or arguments that conflict with this option.
   *
   * If any entry in `conflictWith` is provided alongside this option, the parser will report an error. Conflicts are
   * only checked against explicitly supplied values — defaults do not trigger conflicts.
   *
   * @example
   *   defineOptions({
   *     // the option `help` cannot be used together with `version` (could be an option or argument name)
   *     help: {
   *       conflictWith: ["version"],
   *     },
   *   });
   */
  conflictWith?: string[];

  /** Used for help message and documentation generation. */
  meta?: OptionMeta;

  /** @deprecated For internal use only */
  _preparedType?: PreparedType;
}

export interface ArgumentMeta extends MetaBase {
  /** Override the argument name in the help message and documentation. */

  name?: string;

  /**
   * Custom default value.
   *
   * Use an empty string to intentionally show no default.
   */
  default?: string;

  /** Override whether this option is considered optional. */
  optional?: boolean;
}

export interface Argument<Schema extends SchemaType = SchemaType> {
  /** The schema to validate the user input. */
  type: Schema;

  /**
   * Since the terminal input is a string, we need to coerce it.
   *
   * **NOTE:**
   *
   * - You can use the provided `coerce` methods to coerce the user input.
   * - The output type of the `coerce` method should match the output type of the schema.
   *
   * @example
   *   type: z.object({ value: z.boolean() });
   *   coerce: coerce.boolean;
   */
  coerce: CoerceMethod<Widen<InferSchemaOutputType<Schema>>>;

  /**
   * When `true`, this argument must appear on its own. It cannot be used together with any other option or argument,
   * except those explicitly listed in `requires`.
   *
   * Only explicitly provided inputs are checked — options or arguments that are present only through default values are
   * ignored.
   *
   * @example
   *   defineArguments({
   *     // nothing else can be used with this argument (no other options or arguments)
   *     output: {
   *       exclusive: true,
   *     },
   *   });
   *
   *   defineArguments({
   *     // only `input` (could be an option or argument name) can be used with this argument
   *     output: {
   *       exclusive: true,
   *       requires: ["input"],
   *     },
   *   });
   */
  exclusive?: boolean;

  /**
   * Declares other options/arguments that must be provided when this argument is used.
   *
   * If this argument appears in the parsed input, each entry listed in `requires` must also be present. Default values
   * do not satisfy this requirement — the user must explicitly provide the required option(s).
   *
   * @example
   *   defineArguments({
   *     // using the argument `output` also requires `input` (could be an option or argument name)
   *     output: {
   *       requires: ["input"],
   *     },
   *   });
   */
  requires?: string[];

  /**
   * Declares options or arguments that conflict with this argument.
   *
   * If any entry in `conflictWith` is provided alongside this argument, the parser will report an error. Conflicts are
   * only checked against explicitly supplied values — defaults do not trigger conflicts.
   *
   * @example
   *   defineArguments({
   *     // the argument `help` cannot be used together with `version` (could be an option or argument name)
   *     help: {
   *       conflictWith: ["version"],
   *     },
   *   });
   */
  conflictWith?: string[];

  /** Used for help message and documentation generation. */
  meta?: ArgumentMeta;

  /** @deprecated For internal use only */
  _preparedType?: PreparedType;
}
