import { prepareOptionsTypes } from "../utilities.ts";

import type { Option } from "../types/definitions-types.ts";

export function defineOptions<T extends Record<string, Option>>(options: {
  [K in keyof T]: T[K] & Option<T[K]["type"]>;
}): {
  [K in keyof T]: Option<T[K]["type"]>;
} {
  prepareOptionsTypes(options);
  return options;
}
