import { walkObject } from "../utilities/utilities.ts";
import { stringToBooleanArray, stringToNumberArray, stringToStringArray } from "./string-to-array.ts";
import { stringToBigint, stringToBoolean, stringToNumber } from "./string-to-primitive.ts";
import { stringToBooleanSet, stringToNumberSet, stringToStringSet } from "./string-to-set.ts";

import type { ObjectCoerceMethodOptions } from "../types/types.ts";

const string = <T extends string | undefined>(terminalInput: string): T => terminalInput as T;
const number = <T extends number | undefined>(terminalInput: string): T => stringToNumber(terminalInput) as T;
const bigint = <T extends bigint | undefined>(terminalInput: string): T => stringToBigint(terminalInput) as T;
const json = <T>(terminalInput: string): T => JSON.parse(terminalInput) as T;
const boolean = <T extends boolean | undefined>(terminalInput: string): T => stringToBoolean(terminalInput) as T;
boolean.type = "boolean";

const stringArray = (separator: string) => {
  return <T extends string[] | undefined>(terminalInput: string): T =>
    stringToStringArray(terminalInput, separator) as T;
};

const numberArray = (separator: string) => {
  return <T extends number[] | undefined>(terminalInput: string): T =>
    stringToNumberArray(terminalInput, separator) as T;
};

const booleanArray = (separator: string) => {
  return <T extends boolean[] | undefined>(terminalInput: string): T =>
    stringToBooleanArray(terminalInput, separator) as T;
};

const stringSet = (separator: string) => {
  return <T extends Set<string> | undefined>(terminalInput: string): T =>
    stringToStringSet(terminalInput, separator) as T;
};

const numberSet = (separator: string) => {
  return <T extends Set<number> | undefined>(terminalInput: string): T =>
    stringToNumberSet(terminalInput, separator) as T;
};

const booleanSet = (separator: string) => {
  return <T extends Set<boolean> | undefined>(terminalInput: string): T =>
    stringToBooleanSet(terminalInput, separator) as T;
};

const object = (options: ObjectCoerceMethodOptions = {}) => {
  const coerceMethod = <T extends Record<string, unknown> | undefined>(terminalInput: string): T => {
    const object = JSON.parse(terminalInput) as T;

    if (!options.coerceBoolean && !options.coerceNumber && !options.coerceBigint && !options.coerceDate) {
      return object;
    }

    walkObject(object!, (_, value, path) => {
      if (typeof value !== "string") return value;

      const shouldCoerce = (boolOrArray: boolean | string[] | undefined) => {
        if (!boolOrArray) return false;
        if (typeof boolOrArray === "boolean") return boolOrArray;
        return boolOrArray.includes(path);
      };

      if (shouldCoerce(options.coerceBoolean)) {
        try {
          return stringToBoolean(value);
        } catch {
          return value;
        }
      }

      if (shouldCoerce(options.coerceNumber)) {
        try {
          return stringToNumber(value);
        } catch {
          return value;
        }
      }

      if (shouldCoerce(options.coerceBigint)) {
        try {
          return BigInt(value);
        } catch {
          return value;
        }
      }

      if (shouldCoerce(options.coerceDate)) {
        try {
          return new Date(value);
        } catch {
          return value;
        }
      }

      return value;
    });

    return object;
  };

  return coerceMethod;
};

export const coerce = {
  /**
   * Since the terminal input is a string, this method does nothing.
   *
   * @since 2.0.0
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  string,

  /**
   * Coerces a string matching `"true"` or `"false"` (case-insensitive) to a boolean value.
   *
   * @since 2.0.0
   * @throws {TypeError} If input is not a valid boolean string.
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  boolean,

  /**
   * Coerces a string matching a number to a number value.
   *
   * @since 2.0.0
   * @throws {TypeError} If input is empty or not a valid number.
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  number,

  /**
   * Coerces a string matching a number to a bigint value.
   *
   * @since 2.0.0
   * @throws {TypeError} If input is empty or not a valid bigint.
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  bigint,

  /**
   * Coerces a JSON string into a JavaScript object, optionally converting certain string values into native types such
   * as booleans, numbers, bigints, or dates.
   *
   * Each coercion option attempts conversion and silently falls back to the original string if the value cannot be
   * converted.
   *
   * @since 2.0.0
   * @throws {SyntaxError} If input is not a valid JSON string.
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/README.md##structured-object-options}
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  object,

  /**
   * Converts a string to an array of strings by splitting it on the specified separator.
   *
   * @since 2.0.0
   * @param separator - The separator to use to split the string.`
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  stringArray,

  /**
   * Converts a string to an array of numbers by splitting it on the specified separator.
   *
   * Items that match the number regex will be converted to numbers.
   *
   * @since 2.0.0
   * @param separator - The separator to use to split the string.`
   * @throws {TypeError} - When an item cannot be converted to a number
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  numberArray,

  /**
   * Converts a string to an array of booleans by splitting it on the specified separator.
   *
   * Items that match `"true"` or `"false"` (case-insensitive) will be converted to booleans.
   *
   * @since 2.0.0
   * @param separator - The separator to use to split the string.`
   * @throws {TypeError} - When an item cannot be converted to a boolean
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  booleanArray,

  /**
   * Converts a string to a set of strings by splitting it on the specified separator.
   *
   * Items that match the number regex will be converted to numbers.
   *
   * @since 2.0.0
   * @param separator - The separator to use to split the string.`
   * @throws {TypeError} - When an item cannot be converted to a number
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  stringSet,

  /**
   * Converts a string to a set of numbers by splitting it on the specified separator.
   *
   * Items that match the number regex will be converted to numbers.
   *
   * @since 2.0.0
   * @param separator - The separator to use to split the string.
   * @throws {TypeError} - When an item cannot be converted to a number
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  numberSet,

  /**
   * Converts a string to a set of booleans by splitting it on the specified separator.
   *
   * Items that match `"true"` or `"false"` (case-insensitive) will be converted to booleans.
   *
   * @since 2.0.0
   * @param separator - The separator to use to split the string.
   * @throws {TypeError} - When an item cannot be converted to a boolean
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  booleanSet,

  /**
   * Parses a JSON string into a JavaScript object.
   *
   * @since 2.0.0
   * @throws {SyntaxError} If input is not a valid JSON string.
   * @see {@link https://github.com/alabsi91/zod-args-parser/blob/main/docs/api-reference.md#coerce-helpers}
   */
  json,
};
