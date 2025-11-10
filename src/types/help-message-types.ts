export interface PrintHelpOptions {
  /** The style to use for the help message. */
  style?: Partial<HelpMessageStyleImpl>;

  /**
   * Whether to transform the argument (not option) name to kebab case.
   *
   * @default true
   */
  kebabCaseArgumentName?: boolean;

  /**
   * The renderer to use for the markdown.
   *
   * @default terminal
   */
  markdownRenderer?: "terminal" | "html";

  /**
   * The number of spaces to put before the name of (option/argument/subcommand).
   *
   * @default 2
   */
  indentBeforeName?: number;

  /**
   * The number of spaces to put after the name of (option/argument/subcommand), between the name and the description
   * (space between columns).
   *
   * @default 4
   */
  indentAfterName?: number;

  /**
   * The number of spaces to put before the placeholder.
   *
   * @default 1
   */
  indentBeforePlaceholder?: number;

  /**
   * The number of spaces to put before a new line:
   *
   * - Description new lines.
   * - Example under description.
   *
   * @default 0
   */
  newLineIndent?: number;

  /**
   * The number of empty lines to put between lines.
   *
   * @default 0
   */
  emptyLines?: number;

  /**
   * The number of empty lines to put before the title.
   *
   * @default 1
   */
  emptyLinesBeforeTitle?: number;

  /**
   * The number of empty lines to put after the title.
   *
   * @default 0
   */
  emptyLinesAfterTitle?: number;

  /**
   * The keyword to use for the example.
   *
   * @default "Example:"
   */
  exampleKeyword?: string;

  /**
   * The keyword to use for the optional.
   *
   * @default "(optional)"
   */
  optionalKeyword?: string;

  /**
   * The keyword to use for the default. where `{{ value }}` will be replaced with the default value.
   *
   * @default "(default: {{ value }})"
   */
  defaultKeyword?: string;

  /**
   * The title to use for the usage.
   *
   * @default "USAGE"
   */
  usageTitle?: string;

  /**
   * The title to use for the description.
   *
   * @default "DESCRIPTION"
   */
  descriptionTitle?: string;

  /**
   * The title to use for the commands.
   *
   * @default "COMMANDS"
   */
  commandsTitle?: string;

  /**
   * The title to use for the options.
   *
   * @default "OPTIONS"
   */
  optionsTitle?: string;

  /**
   * The title to use for the arguments.
   *
   * @default "ARGUMENTS"
   */
  argumentsTitle?: string;

  /**
   * The title to use for the examples.
   *
   * @default "EXAMPLE"
   */
  exampleTitle?: string;
}

export interface ColorFunctionType {
  (...text: unknown[]): string;
}

/** - The colors to use for the help message. */
export interface HelpMessageStyleImpl {
  title: ColorFunctionType;
  description: ColorFunctionType;
  default: ColorFunctionType;
  optional: ColorFunctionType;
  exampleTitle: ColorFunctionType;
  example: ColorFunctionType;
  command: ColorFunctionType;
  option: ColorFunctionType;
  argument: ColorFunctionType;
  placeholder: ColorFunctionType;
  punctuation: ColorFunctionType;
}
