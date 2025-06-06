import type {
  ActionFn,
  Argument,
  CheckDuplicatedOptions,
  Cli,
  Option,
  Prettify,
  Subcommand,
  UnSafeParseResult,
} from "./types.js";

/**
 * - Insures that there is no extra keys in `obj` compared to `shape`
 * - Also checks objects in arrays useful for the keys `options` and `arguments`
 */
type Exact<Obj extends object, Shape extends object> = {
  [K in keyof Obj]: K extends keyof Shape
    ? Obj[K] extends infer ObjArr extends object[]
      ? Required<Shape>[K] extends infer ShapeArr extends object[]
        ? ExactObjArr<ObjArr, ShapeArr[number]>
        : Obj[K]
      : Obj[K]
    : never;
};

/** - Insures that there is no extra keys in `obj` compared to `shape` */
type ExactKeys<T extends object, U extends object> = { [K in keyof T]: K extends keyof U ? T[K] : never };

/** - Insures that there is no extra keys in the objects in an array compared to `shape` */
type ExactObjArr<ObjArr extends object[], ShapeObj extends object> = {
  [K in keyof ObjArr]: ExactKeys<ObjArr[K], ShapeObj>;
};

/**
 * - Insures that there are no duplicated options
 * - Disallow extra keys
 */
type CliInput<T extends Cli> = CheckDuplicatedOptions<T> extends T ? Exact<T, Cli> : CheckDuplicatedOptions<T>;

export function createCli<const T extends Cli>(input: CliInput<T>) {
  const setAction = (action: (res: UnSafeParseResult<[T]>) => void) => {
    input.action = action;
  };

  return Object.assign(input, { setAction }) as Prettify<CliInput<T> & ActionFn<T>>;
}

/**
 * - Insures that there are no duplicated options
 * - Disallow extra keys
 */
type SubcommandInput<T extends Subcommand> =
  CheckDuplicatedOptions<T> extends T ? Exact<T, Subcommand> : CheckDuplicatedOptions<T>;

export function createSubcommand<const T extends Subcommand>(input: SubcommandInput<T>) {
  const setAction = (action: (res: UnSafeParseResult<[T]>) => void) => {
    input.action = action;
  };

  return Object.assign(input, { setAction }) as Prettify<SubcommandInput<T> & ActionFn<T>>;
}

/** - Insures that there are no duplicated options */
type CheckOptionsInput<T extends Option[]> =
  CheckDuplicatedOptions<{ options: T }> extends infer Err extends string ? Err : T;

export function createOptions<const T extends [Option, ...Option[]]>(options: CheckOptionsInput<T>) {
  return options;
}

export function createArguments<const T extends [Argument, ...Argument[]]>(args: T) {
  return args;
}

export { printCliHelp, printSubcommandHelp } from "./help-message/print-help-message.js";

export { parse } from "./parser/parse.js";
export { safeParse } from "./parser/safe-parse.js";

export { generateBashAutocompleteScript } from "./autocomplete-scripts/bash-autocomplete-script.js";
export { generatePowerShellAutocompleteScript } from "./autocomplete-scripts/powershell-autocomplete-script.js";
export { generateZshAutocompleteScript } from "./autocomplete-scripts/zsh-autocomplete-script.js";

export { getArgumentsMetadata } from "./metadata/get-arguments-metadata.js";
export { getCliMetadata } from "./metadata/get-cli-metadata.js";
export { getOptionsMetadata } from "./metadata/get-options-metadata.js";
export { getSubcommandsMetadata } from "./metadata/get-subcommands-metadata.js";

export { generateMarkdown } from "./markdown/generate-markdown.js";

export type * from "./types.js";
