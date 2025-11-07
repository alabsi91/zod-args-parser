import type { Cli, Option, Subcommand } from "../schemas/schema-types.ts";

/**
 * Retrieves a subcommand object from an array of subcommands by matching the provided subcommand name against the
 * subcommand's name or its aliases.
 *
 * @param subCmdName - The name or alias of the subcommand to search for.
 * @param subcommandArr - An array of `Subcommand` objects to search within.
 * @returns The matching `Subcommand` object if found; otherwise, `undefined`.
 */
export function findSubcommand(subCmdName: string | undefined, cli: Cli): Subcommand | undefined {
  if (subCmdName === undefined) {
    return cli as unknown as Subcommand;
  }

  if (!cli.subcommands) {
    return undefined;
  }

  return cli.subcommands.find(c => {
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
export function findOption(optionArgument: string, options: Record<string, Option>): [string, Option] | undefined {
  const validVariableNames = optionArgumentToVariableNames(optionArgument);
  const isNegative = optionArgument.startsWith("--no-");

  const option = Object.entries(options).find(([optionName, option]) => {
    if (validVariableNames.has(optionName)) {
      return true;
    }

    if (isNegative && validVariableNames.has(negateOption(optionName))) {
      return true;
    }

    if (!option.aliases) {
      return false;
    }

    if (option.aliases.some(a => validVariableNames.has(a))) {
      return true;
    }

    if (isNegative && option.aliases.map(alias => negateOption(alias)).some(a => validVariableNames.has(a))) {
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
 * - Transforms an option argument name to a valid JavaScript variable name
 *
 * @param name - Should start with `'--'` or `'-'`
 */
export function optionArgumentToVariableNames(name: string): Set<string> {
  if (!name.startsWith("-")) {
    throw new Error(`[parseArgOptionName] Invalid arg name: ${name}`);
  }

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

/** - Check if an arg string is a long arg. E.g. `--input-dir` -> `true` */
function isLongArgument(name: string): boolean {
  return /^--[A-Za-z-]+[A-Za-z0-9]$/.test(name);
}

/** - Check if an arg string is an options arg. E.g. `--input-dir` -> `true` , `-i` -> `true` */
export function isOptionArgument(name: string | boolean): boolean {
  if (typeof name !== "string") {
    return false;
  }

  return isFlagArgument(name) || isLongArgument(name);
}

/**
 * - Transform option name to no name. E.g. `include` -> `noInclude`
 * - For short name like `-i` it will be ignored
 */
export function negateOption(name: string): string {
  if (name.length === 1) {
    return name;
  }

  return "no" + name.replace(/^[a-z]/, g => g.toUpperCase());
}

/** - Reverse of `transformArg`. E.g. `InputDir` -> `--input-dir` , `i` -> `-i` */
export function transformOptionToArgument(name: string): string {
  // single letter option name
  if (name.length === 1) {
    return `-${name.toLowerCase()}`;
  }

  // snake_case, SCREAMING_SNAKE_CASE
  if (name.includes("_") || /[A-Z]+$/.test(name)) {
    name = name.replace(/_/g, "-");
    return `--${name.toLowerCase()}`;
  }

  // camelCase, PascalCase
  name = name.replace(/[A-Z]/g, (match, index: number) => (index > 0 ? "-" + match : match)); // add "-" before camel case letters except for the first letter
  return `--${name.toLowerCase()}`;
}
