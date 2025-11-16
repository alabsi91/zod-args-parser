import { Enum } from "../utilities/utilities.ts";

import type { ErrorCauseI } from "../types/error-types.ts";

export const ErrorCause: { [K in keyof ErrorCauseI]: K } = Enum({
  Internal: undefined,
  Parse: undefined,
  Validation: undefined,
  Definition: undefined,
});
