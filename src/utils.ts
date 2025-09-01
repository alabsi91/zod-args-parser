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
