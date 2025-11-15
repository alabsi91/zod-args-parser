import type { Cli, Option, Subcommand } from "../types/definitions-types.ts";

/**
 * Retrieves a subcommand object from an array of subcommands by matching the provided subcommand name against the
 * subcommand's name or its aliases.
 *
 * @param subcommandName - The name or alias of the subcommand to search for.
 * @param subcommandArr - An array of `Subcommand` objects to search within.
 * @returns The matching `Subcommand` object if found; otherwise, `undefined`.
 */
export function findSubcommandDefinition(
  subcommandName: string | undefined,
  cliDefinition: Cli,
): Subcommand | Cli | undefined {
  if (subcommandName === undefined) {
    return cliDefinition;
  }

  if (!cliDefinition.subcommands) {
    return;
  }

  return cliDefinition.subcommands.find(c => {
    // match for undefined too
    if (c.name === subcommandName) {
      return true;
    }

    // match for aliases
    return subcommandName && c.aliases && c.aliases.includes(subcommandName);
  });
}

/**
 * Finds and returns an `Option` object from the provided list that matches the given argument string.
 *
 * The function supports matching by option name, aliases, and their negated forms (e.g., `--no-` prefix).
 *
 * @param optionArgument - The argument string to match (e.g., `--foo`, `--no-bar`, `-f`).
 * @param options - An array of `Option` objects to search through.
 * @returns The matching `Option` object if found; otherwise, `undefined`.
 */
export function findOption(optionArgument: string, options: Record<string, Option>): [string, Option] | undefined {
  const validVariableNames = optionArgumentToVariableNames(optionArgument);
  const isNegated = optionArgument.startsWith("--no-");

  const option = Object.entries(options).find(([optionName, option]) => {
    if (validVariableNames.has(optionName)) {
      return true;
    }

    if (isNegated && validVariableNames.has(negateOption(optionName))) {
      return true;
    }

    if (!option.aliases) {
      return false;
    }

    if (option.aliases.some(a => validVariableNames.has(a))) {
      return true;
    }

    if (isNegated && option.aliases.map(alias => negateOption(alias)).some(a => validVariableNames.has(a))) {
      return true;
    }

    return false;
  });

  return option;
}

/** - Decouple flags E.g. `-rf` -> `-r, -f` */
export function decoupleFlags(arguments_: string[]): string[] {
  const flagsRe = /^-[a-z0-9]{2,}$/i;

  const result = [];
  for (const argument of arguments_) {
    const isCoupled = flagsRe.test(argument);

    if (!isCoupled) {
      result.push(argument);
      continue;
    }

    const decoupledArray = argument
      .slice(1)
      .split("")
      .map(c => "-" + c);

    result.push(...decoupledArray);
  }

  return result;
}

/**
 * Transforms an option name to a set of variants: `camelCase`, `PascalCase`, `snake_case`, `SCREAMING_SNAKE_CASE`.
 *
 * **Example** for `--input-dir`
 *
 * - CamelCase: `inputDir`
 * - PascalCase: `InputDir`
 * - Snake_case: `input_dir`
 * - SCREAMING_SNAKE_CASE: `INPUT_DIR`
 *
 * @param name - Should start with `'--'` or `'-'`
 */
export function optionArgumentToVariableNames(name: string): Set<string> {
  name = name.startsWith("--") ? name.slice(2) : name.slice(1); // remove prefix
  name = name.toLowerCase(); // lowercase

  const results = new Set<string>();

  // camelCase
  const camelCase = name.replace(/-(.)/g, m => m[1].toUpperCase());
  results.add(camelCase);

  // PascalCase (UpperCamelCase)
  results.add(camelCase.replace(/^(.)/, m => m.toUpperCase()));

  // snake_case
  const snake_case = name.replace(/-(.)/g, g => "_" + g[1]);
  results.add(snake_case);

  // SCREAMING_SNAKE_CASE
  results.add(snake_case.toUpperCase());

  return results;
}

/** - Check if an arg string is a short arg. E.g. `-i` -> `true` */
export function isFlagArgument(name: string): boolean {
  return /^-[A-Za-z]$/.test(name);
}

/**
 * - Check if an arg string is a long arg.
 * - `--input-dir` -> `true`
 * - `-h` -> `false`
 * - `--db.https` -> `true`
 */
function isLongArgument(name: string): boolean {
  return /^--.{2,}/.test(name);
}

/** - Check if an arg string is an options arg. E.g. `--input-dir` -> `true` , `-i` -> `true` */
export function isOptionArgument(name: string | boolean): boolean {
  if (typeof name !== "string") {
    return false;
  }

  return isFlagArgument(name) || isLongArgument(name);
}

/**
 * Transform option name to no name.
 *
 * - `verbose` -> `noVerbose`
 * - `v` -> `noV`
 */
export function negateOption(name: string): string {
  return "no" + name.replace(/^[a-z]/, g => g.toUpperCase());
}

/** - Reverse of `transformArg`. E.g. `InputDir` -> `--input-dir` , `i` -> `-i` */
export function transformOptionToArgument(name: string): string {
  // single letter option name
  if (name.length === 1) {
    return `-${name.toLowerCase()}`;
  }

  // snake_case, SCREAMING_SNAKE_CASE
  if (/^[a-z_]+$/.test(name) || /^[A-Z_]+$/.test(name)) {
    name = name.replace(/_/g, "-");
    return `--${name.toLowerCase()}`;
  }

  // camelCase, PascalCase

  // add "-" before camel case letters except for the first letter
  name = name.replace(/[A-Z]/g, (match, index: number) => (index > 0 ? "-" + match : match));

  return `--${name.toLowerCase()}`;
}

/**
 * Split an option with keys into name and a set of keys
 *
 * - `--foo` -> `[--foo, []]`
 * - `--foo.bar` -> `[--foo, ["bar"]]`
 * - `--foo.bar.baz` -> `[--foo, ["bar", "baz"]]`
 * - `--foo.bar.` -> `[--foo, Set(1) ["bar"]]`
 */
export function splitAndGetKeys(option: string): [string, string[]] {
  const parts = option.split(".");
  const optionName = parts[0];
  const keys = parts.slice(1).filter(Boolean);
  return [optionName, keys];
}
