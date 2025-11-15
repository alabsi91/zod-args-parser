import { stringToBooleanArray, stringToNumberArray, stringToStringArray } from "./string-to-array.ts";

export function stringToStringSet(stringValue: string, separator: string = ","): Set<string> {
  return new Set(stringToStringArray(stringValue, separator));
}

/** @throws {CliError} - Because of `stringToNumber` */
export function stringToNumberSet(stringValue: string, separator: string = ","): Set<number> {
  return new Set(stringToNumberArray(stringValue, separator));
}

/** @throws {CliError} - Because of `stringToBoolean` */
export function stringToBooleanSet(stringValue: string, separator: string = ","): Set<boolean> {
  return new Set(stringToBooleanArray(stringValue, separator));
}
