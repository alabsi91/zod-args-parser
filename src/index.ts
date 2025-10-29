import type {
  ActionsFunctions,
  Argument,
  CheckArgumentsOptional,
  CheckDuplicatedOptions,
  Cli,
  Option,
  Prettify,
  Subcommand,
} from "./types.js";

/**
 * - Insures that there are no duplicated options
 * - Insures that only the last argument is optional
 * - Insures no optional arguments are allowed when `allowPositionals` is enabled
 */
type CheckCliSubcommandInput<T extends Cli | Subcommand> =
  CheckDuplicatedOptions<T> extends infer Error extends string
    ? Error
    : CheckArgumentsOptional<T> extends infer Error extends string
      ? Error
      : T;

type KeyOnlyInFirst<First, Second> = Exclude<keyof First, keyof Second>;

type Exact<Actual extends Wanted, Wanted> = {
  [Key in keyof Actual]: Key extends KeyOnlyInFirst<Actual, Wanted> ? never : Actual[Key];
};

export function createCli<const T extends Cli>(input: T & NoInfer<Cli & CheckCliSubcommandInput<Exact<T, Cli>>>) {
  const inputSchema = input as T;

  const setAction = (action: (data: any) => any) => {
    if (typeof inputSchema === "string") return;
    inputSchema.action = action;
  };

  const setPreValidationHook = (hook: (context: any) => any) => {
    if (typeof input === "string") return;
    inputSchema.preValidation = hook;
  };

  return Object.assign(inputSchema, { setAction, setPreValidationHook }) as Prettify<T & ActionsFunctions<T>>;
}

export function createSubcommand<const T extends Subcommand>(
  input: T & NoInfer<Subcommand & CheckCliSubcommandInput<Exact<T, Subcommand>>>,
) {
  const inputSchema = input as T;

  const setAction = (action: (data: any) => any) => {
    if (typeof inputSchema === "string") return;
    inputSchema.action = action as T["action"];
  };

  const setPreValidationHook = (hook: (context: any) => any) => {
    if (typeof inputSchema === "string") return;
    inputSchema.preValidation = hook;
  };

  return Object.assign(inputSchema, { setAction, setPreValidationHook }) as Prettify<T & ActionsFunctions<T>>;
}

/** - Insures that there are no duplicated options */
type CheckOptionsInput<T extends Option[]> =
  CheckDuplicatedOptions<{ options: T }> extends infer Error extends string ? Error : T;

export function createOptions<const T extends [Option, ...Option[]]>(
  options: T & NoInfer<[Option, ...Option[]] & CheckOptionsInput<T>>,
) {
  return options as T;
}

/** - Insures that only the last argument is optional */
type CheckArgumentsInput<T extends Argument[]> =
  CheckArgumentsOptional<{ arguments: T }> extends infer Error extends string ? Error : T;

export function createArguments<const T extends [Argument, ...Argument[]]>(
  arguments_: T & NoInfer<[Argument, ...Argument[]] & CheckArgumentsInput<T>>,
) {
  return arguments_ as T;
}

export {
  formatCliHelpMessage as formatCliHelpMsg,
  formatSubcommandHelpMessage as formatSubcommandHelpMsg,
  printCliHelp,
  printSubcommandHelp,
} from "./help-message/format-cli.js";
export { helpMessageStyles } from "./help-message/styles.js";

export { safeParse, safeParseAsync } from "./parser/safe-parse.js";
export { unsafeParse as parse, unsafeParseAsync as parseAsync } from "./parser/unsafe-parse.js";

export { isOptionalSchema, schemaDefaultValue, stringToArray, stringToSet } from "./zod-utilities.js";

export { generateBashAutocompleteScript } from "./autocomplete-scripts/bash-autocomplete-script.js";
export { generatePowerShellAutocompleteScript } from "./autocomplete-scripts/powershell-autocomplete-script.js";
export { generateZshAutocompleteScript } from "./autocomplete-scripts/zsh-autocomplete-script.js";

export { getArgumentsMetadata } from "./metadata/get-arguments-metadata.js";
export { getCliMetadata } from "./metadata/get-cli-metadata.js";
export { getOptionsMetadata } from "./metadata/get-options-metadata.js";
export { getSubcommandsMetadata } from "./metadata/get-subcommands-metadata.js";

export { generateMarkdown } from "./markdown/generate-markdown.js";

export type * from "./metadata/metadata-types.js";
export type * from "./types.js";
