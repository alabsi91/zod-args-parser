import { Enum } from "../../utilities/utilities.ts";

import type { ValidationErrorI } from "../../types/error-types.ts";

export const ValidationErrorCode: { [K in keyof ValidationErrorI]: K } = Enum({
  NoOptionsToValidate: undefined,
  NoArgumentsToValidate: undefined,
  UnknownOptionValidation: undefined,
  UnknownArgumentValidation: undefined,
  SchemaValidationFailed: undefined,
  MutuallyExclusiveConflict: undefined,
  RequiredDependencyMissing: undefined,
  AsyncSchemaNotSupported: undefined,
  CoercionFailed: undefined,
});
