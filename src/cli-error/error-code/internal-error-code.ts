import { Enum } from "../../utilities/utilities.ts";

import type { InternalErrorI } from "../../types/error-types.ts";

export const InternalErrorCode: { [K in keyof InternalErrorI]: K } = Enum({
  MissingPreparedTypes: undefined,
  CannotFindCliDefinition: undefined,
});
