import { defaultValueAndIsOptional, validateSync } from "../utilities.ts";

import type { Coerce } from "../types.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";

interface CoerceMethod<Value, separator extends string = never> {
  <T extends StandardSchemaV1>(
    schema: StandardSchemaV1.InferOutput<T> extends Value | undefined ? T : never,
    separator?: separator,
  ): Coerce<T>;
}

function createCoerceObject<T extends StandardSchemaV1>(
  schema: T,
  coerceHandler: (value: string) => unknown,
  coerceTo: Coerce["coerceTo"],
): Coerce<T> {
  const { optional, defaultValue } = defaultValueAndIsOptional(schema);

  return {
    schema,
    optional,
    defaultValue,
    coerceTo,
    validate: (value?: string) => validateSync(schema, value && coerceHandler(value)),
  };
}

const string: CoerceMethod<string> = schema => createCoerceObject(schema, value => value, "string");
const boolean: CoerceMethod<boolean> = schema => createCoerceObject(schema, stringToBoolean, "boolean");
const number: CoerceMethod<number> = schema => createCoerceObject(schema, stringToNumber, "number");
const json: CoerceMethod<unknown> = schema => createCoerceObject(schema, value => JSON.parse(value), "json");

const stringArray: CoerceMethod<string[], string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToStringArray(value, separator), "array");
};

const numberArray: CoerceMethod<number[], string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToNumberArray(value, separator), "array");
};

const booleanArray: CoerceMethod<boolean[], string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToBooleanArray(value, separator), "array");
};

const stringSet: CoerceMethod<Set<string>, string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToStringSet(value, separator), "set");
};

const numberSet: CoerceMethod<Set<number>, string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToNumberSet(value, separator), "set");
};

const booleanSet: CoerceMethod<Set<boolean>, string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToBooleanSet(value, separator), "set");
};

const custom = <T extends StandardSchemaV1>(
  schema: T,
  coerceHandler: (value: string) => StandardSchemaV1.InferOutput<T>,
) => {
  return createCoerceObject(schema, coerceHandler, "custom");
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
  custom,
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
