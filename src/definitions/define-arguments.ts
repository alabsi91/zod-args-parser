import { prepareArgumentsTypes } from "../utilities.ts";

import type { Argument } from "../types/definitions-types.ts";

export function defineArguments<const T extends Record<string, Argument>>(arguments_: {
  [K in keyof T]: T[K] & Argument;
}): { [I in keyof T]: Argument<T[I]["type"]> } {
  prepareArgumentsTypes(arguments_);
  return arguments_;
}
