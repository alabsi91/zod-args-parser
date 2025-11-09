import type { Argument, Option, PreparedType } from "./types/definitions-types.ts";
import type { SubcommandMetadata } from "./types/metadata-types.ts";
import type { SchemaResult, SchemaType } from "./types/schema-types.ts";
import type { CoerceMethod } from "./types/types.ts";

/** @throws */
export function validateSync(schema: SchemaType, value?: unknown): SchemaResult {
  const results = schema["~standard"].validate(value);
  if (results instanceof Promise) {
    throw new TypeError("async schema validation not supported");
  }

  return results;
}

export function defaultValueAndIsOptional(schema: SchemaType): { defaultValue: unknown; optional: boolean } {
  const results = validateSync(schema);

  if (results.issues) {
    return { defaultValue: undefined, optional: false };
  }

  return { defaultValue: results.value, optional: true };
}

export function PrepareType(schema: SchemaType, coerceHandler: CoerceMethod<unknown>): PreparedType {
  const { optional, defaultValue } = defaultValueAndIsOptional(schema);

  return {
    schema,
    optional,
    defaultValue,
    coerceTo: coerceHandler.type,
    validate: (value?: string) => validateSync(schema, value && coerceHandler(value)),
  };
}

export function prepareDefinitionTypes(definition: Record<string, Argument> | Record<string, Option> | undefined) {
  if (!definition) return;

  for (const object of Object.values<Argument | Option>(definition)) {
    if (!object._preparedType) {
      object._preparedType = PrepareType(object.schema, object.coerce);
    }
  }
}

export function toKebabCase(input: string): string {
  return input.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
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

/** Indents every line in the given text by the provided number of spaces. Empty lines are preserved. */
export function indentLines(text: string, spaces: number): string {
  return text.replace(/\n/g, "\n" + indent(spaces));
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
  lines[0] += (lines[0] ? " " : "") + insert;
  return lines.join("\n");
}

/** Get the placeholder for a subcommand */
export function subcommandPlaceholder(metadata: SubcommandMetadata): string {
  let placeholder = metadata.placeholder;

  if (placeholder) {
    return placeholder;
  }

  if (metadata.options.length > 0) {
    placeholder += (placeholder ? " " : "") + "[options]";
  }

  if (metadata.arguments.length > 0) {
    placeholder += (placeholder ? " " : "") + "<arguments>";
  }

  if (metadata.allowPositionals) {
    placeholder += (placeholder ? " " : "") + "<positionals>";
  }

  if (!placeholder) {
    placeholder = " ";
  }

  return placeholder;
}

/** Parse a string into an argv (array of arguments) */
export function parseArgv(input: string): string[] {
  const argv = [];

  let currentQuote: string | undefined = undefined;
  let currentArgument: string | undefined = undefined;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    const previousChar = input[index - 1];
    const nextChar = input[index + 1];
    const end = index === input.length - 1;

    // entering/leaving quote
    if ((char === '"' || char === "'") && previousChar !== "\\") {
      // leaving quote
      if (currentQuote === char) {
        currentQuote = undefined;
        continue;
      }

      // entering quote
      if (currentQuote === undefined) {
        currentQuote = char;
        continue;
      }

      // error
      continue;
    }

    // new line
    if (char === "\\" && nextChar === "\n") {
      index++;
      continue;
    }

    // Add to argv
    if (currentArgument !== undefined && currentQuote === undefined) {
      if (char === " ") {
        argv.push(currentArgument);
        currentArgument = undefined;
        continue;
      }

      if (end) {
        currentArgument += char;
        argv.push(currentArgument);
        currentArgument = undefined;
        continue;
      }
    }

    // Ignore spaces outside of quotes
    if (char === " " && currentQuote === undefined) {
      continue;
    }

    // Ignore escaped characters
    if (char === "\\" && (nextChar === "'" || nextChar === '"')) {
      continue;
    }

    currentArgument ??= "";
    currentArgument += char;
  }

  // Add last argument
  if (currentArgument !== undefined) {
    argv.push(currentArgument);
  }

  return argv;
}

/**
 * Escape HTML characters inside HTML tags in a Markdown string, but leave code blocks, inline code, and HTML comments
 * unchanged.
 */
export function escapeHtmlTags(markdown: string): string {
  const escapeMap: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;" };

  // Captures:
  // 1) fenced code blocks or inline code
  // 2) HTML comments <!-- ... -->
  // 3) other HTML tags like <b>, <div attr="x">, etc.
  const re = /(```[\s\S]*?```|`[^`]*`)|(<!--[\s\S]*?-->)|(<[^>]+>)/g;

  return markdown.replace(re, (fullMatch: string, code?: string, comment?: string, tag?: string) => {
    if (code) return code;
    if (comment) return comment;
    if (!tag) return fullMatch;

    return tag.replace(/[&<>]/g, ch => escapeMap[ch]);
  });
}

/** Credits: https://github.com/chalk/ansi-regex */
function ansiRegex({ onlyFirst = false } = {}) {
  // Valid string terminator sequences are BEL, ESC\, and 0x9c
  const ST = String.raw`(?:\u0007|\u001B\u005C|\u009C)`;

  // OSC sequences only: ESC ] ... ST (non-greedy until the first ST)
  const osc = String.raw`(?:\u001B\][\s\S]*?${ST})`;

  // CSI and related: ESC/C1, optional intermediates, optional params (supports ; and :) then final byte
  const csi = String.raw`[\u001B\u009B][[\]()#;?]*(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]`;

  const pattern = `${osc}|${csi}`;

  return new RegExp(pattern, onlyFirst ? undefined : "g");
}

const regex = ansiRegex();

export function stripAnsi(string: string): string {
  return string.replace(regex, "");
}

export function findDuplicateStrings(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
      continue;
    }

    seen.add(value);
  }

  return Array.from(duplicates);
}
