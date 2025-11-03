import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Coerce, Prettify, OutputTypeWide } from "../types.ts";

export type Cli = Prettify<
  Omit<Subcommand, "name" | "aliases" | "meta"> & {
    /** - The name of the CLI program. */
    readonly cliName: string;

    /** - Subcommands of the CLI. */
    subcommands?: readonly [Subcommand, ...Subcommand[]];

    /** - Metadata for the CLI. */
    meta?: Omit<SubcommandMeta, "placeholder" | "hidden">;
  }
>;

export interface MetaBase {
  /**
   * Short explanation.
   *
   * - Supports multi-line text.
   * - Console color styles (like `chalk`) can be used; they will be stripped out in markdown.
   *
   * **Note:** For terminal markdown, use `descriptionMarkdown` instead.
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
   * Example value shown to the user.
   *
   * - In markdown, this will be displayed inside a code block.
   */
  example?: string;

  /**
   * - Hide this argument from being documented (help message / markdown).
   * - This is useful for internal commands.
   */
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
   * - The subcommand name
   * - Make sure to not duplicate commands and aliases.
   *
   * @example
   *   name: "test";
   *   name: "run-app";
   */
  readonly name: string;

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
   * For the option name (the key), use a valid **JavaScript** variable name.\
   * **Supports:** `camelCase`, `PascalCase`, `snake_case`, and `SCREAMING_SNAKE_CASE`.\
   * **Examples:**
   *
   * - `I` or `i` ➡️ `-i`
   * - `InputDir`, `inputDir`, or `INPUT_DIR` ➡️ `--input-dir`
   * - `Help`, `help`, or `HELP` ➡️ `--help`
   */
  options?: Record<string, Option>;

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
  action?: (data: OutputTypeWide) => any;

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

export interface Option<Schema extends StandardSchemaV1 = StandardSchemaV1> {
  /**
   * - The aliases of the option, use `CamelCase`.
   * - Here you can specify short names or flags.
   * - Make sure to not duplicate aliases.
   */
  aliases?: string[];

  /** - The will be used to validate the user input. */
  type: Coerce<Schema>;

  /** Used for help message and documentation generation. */
  meta?: OptionMeta;
}

export interface ArgumentMeta extends MetaBase {
  /** - The name of the argument. */
  name?: string;

  /**
   * Custom default value.
   *
   * - Use an empty string to intentionally show no default.
   */
  default?: string;

  /** Override whether this option is considered optional. */
  optional?: boolean;
}

export interface Argument<Schema extends StandardSchemaV1 = StandardSchemaV1> {
  /** - The will be used to validate the user input. */
  type: Coerce<Schema>;

  /** Used for help message and documentation generation. */
  meta?: ArgumentMeta;
}
