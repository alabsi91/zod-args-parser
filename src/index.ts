import { help } from "./help.js";
import { parse, safeParse } from "./parser.js";

import type { ActionFn, Cli, Prettify, Subcommand, UnSafeParseResult } from "./types.js";

function createSubcommand<const T extends Subcommand>(input: T & Subcommand): Prettify<T & ActionFn<T>> {
  return Object.assign(input, {
    setAction: (action: (res: UnSafeParseResult<[T]>) => void) => (input.action = action),
  });
}

function createCli<const T extends Cli>(input: T & Cli): Prettify<T & ActionFn<T>> {
  return Object.assign(input, {
    setAction: (action: (res: UnSafeParseResult<[T]>) => void) => (input.action = action),
  });
}

const { printCliHelp, printSubcommandHelp } = help;

export { createCli, createSubcommand, parse, printCliHelp, printSubcommandHelp, safeParse };

export type * from "./types.js";
