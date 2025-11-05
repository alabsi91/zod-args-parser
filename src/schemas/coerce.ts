import { defaultValueAndIsOptional, validateSync } from "./schema-utilities.ts";

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

const arrayOfStrings: CoerceMethod<string[], string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToArrayOfStrings(value, separator), "array");
};

const arrayOfNumbers: CoerceMethod<number[], string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToArrayOfNumbers(value, separator), "array");
};

const arrayOfBooleans: CoerceMethod<boolean[], string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToArrayOfBooleans(value, separator), "array");
};

const setOfStrings: CoerceMethod<Set<string>, string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToSetOfStrings(value, separator), "set");
};

const setOfNumbers: CoerceMethod<Set<number>, string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToSetOfNumbers(value, separator), "set");
};

const setOfBooleans: CoerceMethod<Set<boolean>, string> = (schema, separator = ",") => {
  return createCoerceObject(schema, value => stringToSetOfBooleans(value, separator), "set");
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
  arrayOfStrings,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  arrayOfNumbers,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  arrayOfBooleans,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  setOfStrings,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  setOfNumbers,
  /** @param separator- The separator to use to split the string. **Default** is `","` */
  setOfBooleans,
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

function stringToArrayOfStrings(stringValue: string, separator: string = ","): string[] {
  return stringValue
    .split(separator)
    .map(s => s.trim())
    .filter(Boolean);
}

/** @throws {TypeError} - Because of `stringToNumber` */
function stringToArrayOfNumbers(stringValue: string, separator: string = ","): number[] {
  return stringToArrayOfStrings(stringValue, separator).map(element => stringToNumber(element));
}

/** @throws {TypeError} - Because of `stringToBoolean` */
function stringToArrayOfBooleans(stringValue: string, separator: string = ","): boolean[] {
  return stringToArrayOfStrings(stringValue, separator).map(element => stringToBoolean(element));
}

function stringToSetOfStrings(stringValue: string, separator: string = ","): Set<string> {
  return new Set(stringToArrayOfStrings(stringValue, separator));
}

/** @throws {TypeError} - Because of `stringToNumber` */
function stringToSetOfNumbers(stringValue: string, separator: string = ","): Set<number> {
  return new Set(stringToArrayOfNumbers(stringValue, separator));
}

/** @throws {TypeError} - Because of `stringToBoolean` */
function stringToSetOfBooleans(stringValue: string, separator: string = ","): Set<boolean> {
  return new Set(stringToArrayOfBooleans(stringValue, separator));
}
