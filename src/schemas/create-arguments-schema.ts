import { prepareArgumentsTypes } from "../utilities.ts";

import type { Argument } from "./schema-types.ts";

type Exact<Actual extends Wanted, Wanted> = {
  [Key in keyof Actual]: Key extends Exclude<keyof Actual, keyof Wanted> ? never : unknown;
};

export function createArguments<const T extends [Argument, ...Argument[]]>(
  ...arguments_: { [I in keyof T]: T[I] & Exact<T[I], Argument> & Argument }
): { [I in keyof T]: Argument<T[I]["type"]> } {
  prepareArgumentsTypes(arguments_);
  return arguments_;
}
