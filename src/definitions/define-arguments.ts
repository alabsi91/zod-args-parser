import { prepareArgumentsTypes } from "../utilities.ts";

import type { Argument } from "../types/definitions-types.ts";

export function defineArguments<const T extends Record<string, Argument>>(arguments_: {
  [K in keyof T]: T[K] & Argument<T[K]["type"]>;
}): { [K in keyof T]: Argument<T[K]["type"]> } {
  prepareArgumentsTypes(arguments_);
  return arguments_;
}
