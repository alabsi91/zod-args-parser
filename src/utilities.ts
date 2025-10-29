import { SubcommandMetadata } from "./metadata/metadata-types.js";

/**
 * Converts a string to its corresponding boolean value if the string is "true" or "false" (case-insensitive).
 *
 * @param string - The input string to convert.
 * @returns `true` if the input is "true", `false` if the input is "false", or the original string otherwise.
 */
export function stringToBoolean(string: string): boolean | string {
  if (string.toLowerCase() === "true") {
    return true;
  }

  if (string.toLowerCase() === "false") {
    return false;
  }

  return string;
}

/**
 * Converts a zero-based index into its human-readable ordinal form.
 *
 * Examples: 0 → "1st" 1 → "2nd" 2 → "3rd" 3 → "4th" 10 → "11th"
 *
 * Handles special cases for 11, 12, and 13.
 *
 * @param index - The zero-based index to convert.
 * @returns The ordinal string (e.g., "1st", "2nd", "3rd", "4th", ...).
 */
export function generateOrdinalSuffix(index: number): string {
  if (index < 0) return "";

  const number = index + 1;
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  let suffix = "th";

  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    switch (lastDigit) {
      case 1: {
        suffix = "st";
        break;
      }
      case 2: {
        suffix = "nd";
        break;
      }
      case 3: {
        suffix = "rd";
        break;
      }
    }
  }

  return `${number}${suffix}`;
}

/** New line */
export function ln(count: number) {
  return "\n".repeat(count);
}

/** Space */
export function indent(count: number) {
  if (count <= 0) return "";
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
    return (
      "new Set([" +
      Array.from(value)
        .map(element => stringifyValue(element))
        .join(", ") +
      "])"
    );
  }

  // unknown
  return JSON.stringify(value);
}

/** Insert text at the end of the first line */
export function insertAtEndOfFirstLine(string: string, insert: string) {
  const lines = string.split("\n");
  lines[0] += " " + insert;
  return lines.join("\n");
}

/** Get the placeholder for a subcommand */
export function subcommandPlaceholder(metadata: SubcommandMetadata): string {
  let placeholder = metadata.placeholder;

  if (!placeholder && metadata.options.length > 0) {
    placeholder = "[options]";
  }

  if (!placeholder && metadata.arguments.length > 0) {
    placeholder = "<arguments>";
  }

  if (metadata.allowPositionals) {
    placeholder += (placeholder ? " " : "") + "<positionals>";
  }

  if (!placeholder) {
    placeholder = " ";
  }

  return placeholder;
}
