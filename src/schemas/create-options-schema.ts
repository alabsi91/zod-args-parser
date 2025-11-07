import { prepareOptionsTypes } from "../utilities.ts";

import type { Option } from "./schema-types.ts";

export function createOptions<T extends Record<string, Option>>(options: { [K in keyof T]: T[K] & Option }): {
  [K in keyof T]: Option<T[K]["type"]>;
} {
  prepareOptionsTypes(options);
  return options;
}
