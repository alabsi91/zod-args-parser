import type { CoerceMethod } from "../types.ts";

const string: CoerceMethod<string> = terminalInput => terminalInput;
string.type = "string";

const boolean: CoerceMethod<boolean> = terminalInput => stringToBoolean(terminalInput);
boolean.type = "boolean";

const number: CoerceMethod<number> = terminalInput => stringToNumber(terminalInput);
number.type = "number";

const json: CoerceMethod<unknown> = terminalInput => JSON.parse(terminalInput);
json.type = "unknown";

const stringArray = (separator: string): CoerceMethod<string[]> => {
  const coerceMethod: CoerceMethod<string[]> = terminalInput => stringToStringArray(terminalInput, separator);
  coerceMethod.type = "string[]";
  return coerceMethod;
};

const numberArray = (separator: string) => {
  const coerceMethod: CoerceMethod<number[]> = terminalInput => stringToNumberArray(terminalInput, separator);
  coerceMethod.type = "number[]";
  return coerceMethod;
};

const booleanArray = (separator: string) => {
  const coerceMethod: CoerceMethod<boolean[]> = terminalInput => stringToBooleanArray(terminalInput, separator);
  coerceMethod.type = "boolean[]";
  return coerceMethod;
};

const stringSet = (separator: string) => {
  const coerceMethod: CoerceMethod<Set<string>> = terminalInput => stringToStringSet(terminalInput, separator);
  coerceMethod.type = "set<string>";
  return coerceMethod;
};

const numberSet = (separator: string) => {
  const coerceMethod: CoerceMethod<Set<number>> = terminalInput => stringToNumberSet(terminalInput, separator);
  coerceMethod.type = "set<number>";
  return coerceMethod;
};

const booleanSet = (separator: string) => {
  const coerceMethod: CoerceMethod<Set<boolean>> = terminalInput => stringToBooleanSet(terminalInput, separator);
  coerceMethod.type = "set<boolean>";
  return coerceMethod;
};

export const coerce = {
  string,
  boolean,
  number,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  stringArray,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  numberArray,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  booleanArray,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  stringSet,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  numberSet,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  booleanSet,
  json,
};

/** @throws {TypeError} */
function stringToNumber(string: string): number {
  const trimmed = string.trim();

  // Reject empty, whitespace-only, or signs without digits
  if (trimmed === "" || trimmed === "+" || trimmed === "-") {
    throw new TypeError(`Invalid number: "${string}"`);
  }

  const result = Number(trimmed);

  // Reject NaN, Infinity, and -Infinity
  if (!Number.isFinite(result)) {
    throw new TypeError(`Invalid number: "${string}"`);
  }

  return result;
}

/** @throws {TypeError} */
function stringToBoolean(string: string): boolean {
  if (string.toLowerCase() === "true") {
    return true;
  }

  if (string.toLowerCase() === "false") {
    return false;
  }

  throw new TypeError(`Invalid boolean value: ${string}`, { cause: "zod-args-parser" });
}

function stringToStringArray(stringValue: string, separator: string = ","): string[] {
  return stringValue
    .split(separator)
    .map(s => s.trim())
    .filter(Boolean);
}

/** @throws {TypeError} - Because of `stringToNumber` */
function stringToNumberArray(stringValue: string, separator: string = ","): number[] {
  return stringToStringArray(stringValue, separator).map(element => stringToNumber(element));
}

/** @throws {TypeError} - Because of `stringToBoolean` */
function stringToBooleanArray(stringValue: string, separator: string = ","): boolean[] {
  return stringToStringArray(stringValue, separator).map(element => stringToBoolean(element));
}

function stringToStringSet(stringValue: string, separator: string = ","): Set<string> {
  return new Set(stringToStringArray(stringValue, separator));
}

/** @throws {TypeError} - Because of `stringToNumber` */
function stringToNumberSet(stringValue: string, separator: string = ","): Set<number> {
  return new Set(stringToNumberArray(stringValue, separator));
}

/** @throws {TypeError} - Because of `stringToBoolean` */
function stringToBooleanSet(stringValue: string, separator: string = ","): Set<boolean> {
  return new Set(stringToBooleanArray(stringValue, separator));
}
