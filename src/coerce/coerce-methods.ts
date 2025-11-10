import { stringToBooleanArray, stringToNumberArray, stringToStringArray } from "./string-to-array.ts";
import { stringToBoolean, stringToNumber } from "./string-to-primitive.ts";
import { stringToBooleanSet, stringToNumberSet, stringToStringSet } from "./string-to-set.ts";

import type { CoerceMethod } from "../types/types.ts";

const string: CoerceMethod<string> = terminalInput => terminalInput;
string.type = "string";

const boolean: CoerceMethod<boolean> = terminalInput => stringToBoolean(terminalInput);
boolean.type = "boolean";

const number: CoerceMethod<number> = terminalInput => stringToNumber(terminalInput);
number.type = "number";

const json = <T>(reviver?: (this: any, key: string, value: any) => any): CoerceMethod<T> => {
  const coerceMethod: CoerceMethod<T> = terminalInput => JSON.parse(terminalInput, reviver) as T;
  coerceMethod.type = "unknown";
  return coerceMethod;
};

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
  /** @param separator - The separator to use to split the string. **Default** is `","` */
  stringArray,
  /** @param separator - The separator to use to split the string. **Default** is `","` */
  numberArray,
  /** @param separator - The separator to use to split the string. **Default** is `","` */
  booleanArray,
  /** @param separator - The separator to use to split the string. **Default** is `","` */
  stringSet,
  /** @param separator - The separator to use to split the string. **Default** is `","` */
  numberSet,
  /** @param separator - The separator to use to split the string. **Default** is `","` */
  booleanSet,
  json,
};
