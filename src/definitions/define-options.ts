import { prepareDefinitionTypes } from "../utilities/schema-utilities.ts";

import type { Option } from "../types/definitions-types.ts";

export function defineOptions<T extends Record<string, Option>>(options: {
  [K in keyof T]: T[K] & Option<T[K]["schema"]>;
}): {
  [K in keyof T]: Option<T[K]["schema"]>;
} {
  prepareDefinitionTypes(options);
  return options;
}
