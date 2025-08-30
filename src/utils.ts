import assert from "node:assert";

/**
 * - Transforms an argument name to a valid option name
 *
 * @param name - Should start with `'--'` or `'-'`
 * @returns - The transformed name E.g. `--input-dir` -> `InputDir` or `-i` -> `i`
 */
export function parseArgOptionName(name: string): string {
  assert(name.startsWith("-"), `[parseArgOptionName] Invalid arg name: ${name}`);

  name = name.startsWith("--") ? name.substring(2) : name.substring(1);

  return name.replace(/-([a-z])/g, g => g[1].toUpperCase());
}

/** - Reverse of `transformArg`. E.g. `InputDir` -> `--input-dir` , `i` -> `-i` */
export function transformOptionToArg(name: string): string {
  // first letter always lower case
  name = name.replace(/^[A-Z]/g, g => g.toLowerCase());

  if (name.length === 1) {
    return `-${name}`;
  }

  return `--${name.replace(/[A-Z]/g, g => "-" + g.toLowerCase())}`;
}

/** - Check if an arg string is a short arg. E.g. `-i` -> `true` */
export function isFlagArg(name: string): boolean {
  return /^-[A-Z-a-z]$/.test(name);
}

/** - Check if an arg string is a long arg. E.g. `--input-dir` -> `true` */
export function isLongArg(name: string): boolean {
  return /^--[A-Z-a-z-]+[A-Z-a-z]$/.test(name);
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

/** - Convert string to boolean. E.g. `"true"` -> `true` , `"false"` -> `false` */
export function stringToBoolean(str: string): boolean {
  if (str.toLowerCase() === "true") {
    return true;
  }

  if (str.toLowerCase() === "false") {
    return false;
  }

  throw new Error(`[stringToBoolean] Invalid boolean value: "${str}"; Expected "true" or "false"`);
}

/**
 * Returns the ordinal representation of a given zero-based index.
 *
 * For example, passing `0` returns `"1st"`, `1` returns `"2nd"`, and so on.
 *
 * Handles special cases for numbers ending in 11, 12, or 13 (e.g., `10` returns `"11th"`).
 *
 * @param index - The zero-based index to convert to an ordinal string.
 * @returns The ordinal string representation (e.g., `"1st"`, `"2nd"`, `"3rd"`, `"4th"`, ...).
 */
export function generateOrdinalSuffix(index: number): string {
  if (index < 0) return "";

  const suffixes = ["th", "st", "nd", "rd"];
  const lastDigit = index % 10;
  const lastTwoDigits = index % 100;

  const suffix =
    lastDigit === 1 && lastTwoDigits !== 11
      ? suffixes[1]
      : lastDigit === 2 && lastTwoDigits !== 12
        ? suffixes[2]
        : lastDigit === 3 && lastTwoDigits !== 13
          ? suffixes[3]
          : suffixes[0];

  return `${index + 1}${suffix}`;
}
