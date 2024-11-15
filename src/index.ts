import { help } from "./help.js";
import { parse, safeParse } from "./parser.js";

import type {
  ActionFn,
  CheckDuplicatedOptions,
  Cli,
  Option,
  Prettify,
  Subcommand,
  UnSafeParseResult,
} from "./types.js";

function createSubcommand<const T extends Subcommand>(input: CheckDuplicatedOptions<T>): Prettify<T & ActionFn<T>> {
  return Object.assign(input, {
    setAction: (action: (res: UnSafeParseResult<[T]>) => void) => (input.action = action),
  });
}

function createCli<const T extends Cli>(input: CheckDuplicatedOptions<T>): Prettify<T & ActionFn<T>> {
  return Object.assign(input, {
    setAction: (action: (res: UnSafeParseResult<[T]>) => void) => (input.action = action),
  });
}

function createOptions<const T extends [Option, ...Option[]]>(options: T): T {
  return options;
}

const { printCliHelp, printSubcommandHelp } = help;

export { createCli, createSubcommand, createOptions, parse, printCliHelp, printSubcommandHelp, safeParse };

export type * from "./types.js";
