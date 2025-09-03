import type { Option, Subcommand } from "../../types.js";

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
  const validVarNames = optionArgToVarNames(optionArg);
  const isNegative = optionArg.startsWith("--no-");

  const option = options.find(o => {
    if (validVarNames.has(o.name)) {
      return true;
    }

    if (isNegative && validVarNames.has(negateOption(o.name))) {
      return true;
    }

    if (!o.aliases) {
      return false;
    }

    if (o.aliases.some(a => validVarNames.has(a))) {
      return true;
    }

    if (isNegative && o.aliases.map(negateOption).some(a => validVarNames.has(a))) {
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

/**
 * - Transforms an option argument name to a valid JavaScript variable name
 *
 * @param name - Should start with `'--'` or `'-'`
 */
function optionArgToVarNames(name: string): Set<string> {
  if (!name.startsWith("-")) {
    throw new Error(`[parseArgOptionName] Invalid arg name: ${name}`);
  }

  name = name.startsWith("--") ? name.substring(2) : name.substring(1); // remove prefix
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
export function isFlagArg(name: string): boolean {
  return /^-[A-Z-a-z]$/.test(name);
}

/** - Check if an arg string is a long arg. E.g. `--input-dir` -> `true` */
function isLongArg(name: string): boolean {
  return /^--[A-Z-a-z-]+[A-Z-a-z-0-9]$/.test(name);
}

/** - Check if an arg string is an options arg. E.g. `--input-dir` -> `true` , `-i` -> `true` */
export function isOptionArg(name: string | boolean): boolean {
  if (typeof name !== "string") {
    return false;
  }

  return isFlagArg(name) || isLongArg(name);
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
export function transformOptionToArg(name: string): string {
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
  name = name.replace(/[A-Z]/g, (m, i) => (i ? "-" + m : m)); // add "-" before camel case letters except for the first letter
  return `--${name.toLowerCase()}`;
}
