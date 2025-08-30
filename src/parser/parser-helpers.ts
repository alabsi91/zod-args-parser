import { negateOption, parseArgOptionName } from "../utils.js";

import type { Option, Subcommand } from "../types.js";

/**
 * Retrieves a subcommand object from an array of subcommands by matching the provided subcommand name against the
 * subcommand's name or its aliases.
 *
 * @param subCmdName - The name or alias of the subcommand to search for.
 * @param subcommandArr - An array of `Subcommand` objects to search within.
 * @returns The matching `Subcommand` object if found; otherwise, `undefined`.
 */
export function findSubcommand(subCmdName: string | undefined, subcommandArr: Subcommand[]): Subcommand | undefined {
  return subcommandArr.find(c => {
    // match for undefined too
    if (c.name === subCmdName) {
      return true;
    }

    // match for aliases
    return subCmdName && c.aliases && c.aliases.includes(subCmdName);
  });
}

/**
 * Finds and returns an `Option` object from the provided list that matches the given argument string.
 *
 * The function supports matching by option name, aliases, and their negated forms (e.g., `--no-` prefix).
 *
 * @param optionArg - The argument string to match (e.g., `--foo`, `--no-bar`, `-f`).
 * @param options - An array of `Option` objects to search through.
 * @returns The matching `Option` object if found; otherwise, `undefined`.
 */
export function findOption(optionArg: string, options: [Option, ...Option[]]): Option | undefined {
  const optionName = parseArgOptionName(optionArg);
  const isNegative = optionArg.startsWith("--no-");

  const option = options.find(o => {
    if (o.name === optionName) {
      return true;
    }

    if (isNegative && negateOption(o.name) === optionName) {
      return true;
    }

    if (!o.aliases) {
      return false;
    }

    if (o.aliases.includes(optionName)) {
      return true;
    }

    if (isNegative && o.aliases.map(negateOption).includes(optionName)) {
      return true;
    }

    return false;
  });

  return option;
}

/** - Decouple flags E.g. `-rf` -> `-r, -f` */
export function decoupleFlags(args: string[]): string[] {
  const flagsRe = /^-[a-z]{2,}$/i;

  const result = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const isCoupled = flagsRe.test(arg);

    if (!isCoupled) {
      result.push(arg);
      continue;
    }

    const decoupledArr = arg
      .substring(1)
      .split("")
      .map(c => "-" + c);

    result.push(...decoupledArr);
  }

  return result;
}
