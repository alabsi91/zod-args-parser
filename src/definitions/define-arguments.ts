import { prepareDefinitionTypes } from "../utilities.ts";

import type { Argument } from "../types/definitions-types.ts";

export function defineArguments<const T extends Record<string, Argument>>(arguments_: {
  [K in keyof T]: T[K] & Argument<T[K]["schema"]>;
}): { [K in keyof T]: Argument<T[K]["schema"]> } {
  prepareDefinitionTypes(arguments_);
  return arguments_;
}
