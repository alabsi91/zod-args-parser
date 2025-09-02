import type {
  ActionsFn,
  Argument,
  CheckArgumentsOptional,
  CheckDuplicatedArguments,
  CheckDuplicatedOptions,
  Cli,
  Option,
  Prettify,
  Subcommand,
} from "./types.js";

/**
 * - Insures that there are no duplicated options
 * - Insures that there are no duplicated arguments
 * - Insures that only the last argument is optional
 * - Insures no optional arguments are allowed when `allowPositional` is enabled
 */
type CheckCliSubcommandInput<T extends Cli | Subcommand> =
  CheckDuplicatedOptions<T> extends infer Err extends string
    ? Err
    : CheckDuplicatedArguments<T> extends infer Err extends string
      ? Err
      : CheckArgumentsOptional<T> extends infer Err extends string
        ? Err
        : T;

export function createCli<const T extends Cli>(input: CheckCliSubcommandInput<T>) {
  const setAction = (action: (res: any) => any) => {
    if (typeof input === "string") return;
    input.action = action;
  };

  const setPreValidationHook = (hook: (ctx: any) => any) => {
    if (typeof input === "string") return;
    input.preValidation = hook;
  };

  return Object.assign(input, { setAction, setPreValidationHook }) as Prettify<typeof input & ActionsFn<T>>;
}

export function createSubcommand<const T extends Subcommand>(input: CheckCliSubcommandInput<T>) {
  const setAction = (action: (res: any) => any) => {
    if (typeof input === "string") return;
    input.action = action as T["action"];
  };

  const setPreValidationHook = (hook: (ctx: any) => any) => {
    if (typeof input === "string") return;
    input.preValidation = hook;
  };

  return Object.assign(input, { setAction, setPreValidationHook }) as Prettify<typeof input & ActionsFn<T>>;
}

/** - Insures that there are no duplicated options */
type CheckOptionsInput<T extends Option[]> =
  CheckDuplicatedOptions<{ options: T }> extends infer Err extends string ? Err : T;

export function createOptions<const T extends [Option, ...Option[]]>(options: CheckOptionsInput<T>) {
  return options;
}

/** - Insures that only the last argument is optional */
type CheckArgumentsInput<T extends Argument[]> =
  CheckArgumentsOptional<{ arguments: T }> extends infer Err extends string ? Err : T;

export function createArguments<const T extends [Argument, ...Argument[]]>(args: CheckArgumentsInput<T>) {
  return args;
}

export {
  formatCliHelpMsg,
  printCliHelp,
  formatSubcommandHelpMsg,
  printSubcommandHelp,
} from "./help-message/format-cli.js";
export { helpMsgStyles } from "./help-message/styles.js";

export { unsafeParse as parse, unsafeParseAsync as parseAsync } from "./parser/unsafe-parse.js";
export { safeParse, safeParseAsync } from "./parser/safe-parse.js";

export { isOptionalSchema, schemaDefaultValue, isBooleanSchema, stringToArray, stringToSet } from "./zod-utils.js";

export { generateBashAutocompleteScript } from "./autocomplete-scripts/bash-autocomplete-script.js";
export { generatePowerShellAutocompleteScript } from "./autocomplete-scripts/powershell-autocomplete-script.js";
export { generateZshAutocompleteScript } from "./autocomplete-scripts/zsh-autocomplete-script.js";

export { getArgumentsMetadata } from "./metadata/get-arguments-metadata.js";
export { getCliMetadata } from "./metadata/get-cli-metadata.js";
export { getOptionsMetadata } from "./metadata/get-options-metadata.js";
export { getSubcommandsMetadata } from "./metadata/get-subcommands-metadata.js";

export { generateMarkdown } from "./markdown/generate-markdown.js";

export type * from "./types.js";
export type * from "./metadata/metadata-types.js";
