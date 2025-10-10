/**
 * Converts a string to its corresponding boolean value if the string is "true" or "false" (case-insensitive).
 *
 * @param str - The input string to convert.
 * @returns `true` if the input is "true", `false` if the input is "false", or the original string otherwise.
 */
export function stringToBoolean(str: string): boolean | string {
  if (str.toLowerCase() === "true") {
    return true;
  }

  if (str.toLowerCase() === "false") {
    return false;
  }

  return str;
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

/** New line */
export function ln(count: number) {
  return "\n".repeat(count);
}

/** Space */
export function indent(count: number) {
  return " ".repeat(count);
}

/** Concat strings */
export function concat(...messages: string[]) {
  // messages = messages.filter(Boolean);
  return messages.join(" ");
}

export function stringifyValue(value: unknown): string {
  // Set
  if (value instanceof Set) {
    return "new Set([" + Array.from(value).map(stringifyValue).join(", ") + "])";
  }

  // unknown
  return JSON.stringify(value);
}

/** Insert text at the end of the first line */
export function insertAtEndOfFirstLine(str: string, insert: string) {
  const lines = str.split("\n");
  lines[0] += " " + insert;
  return lines.join("\n");
}
