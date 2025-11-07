import { stringToBoolean, stringToNumber } from "./string-to-primitive.ts";

export function stringToStringArray(stringValue: string, separator: string = ","): string[] {
  return stringValue
    .split(separator)
    .map(s => s.trim())
    .filter(Boolean);
}

/** @throws {TypeError} - Because of `stringToNumber` */
export function stringToNumberArray(stringValue: string, separator: string = ","): number[] {
  return stringToStringArray(stringValue, separator).map(element => stringToNumber(element));
}

/** @throws {TypeError} - Because of `stringToBoolean` */
export function stringToBooleanArray(stringValue: string, separator: string = ","): boolean[] {
  return stringToStringArray(stringValue, separator).map(element => stringToBoolean(element));
}
