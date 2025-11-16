import { Enum } from "../../utilities/utilities.ts";

import type { ParseErrorI } from "../../types/error-types.ts";

export const ParseErrorCode: { [K in keyof ParseErrorI]: K } = Enum({
  UnknownSubcommand: undefined,
  CommandWithoutOptions: undefined,
  UnknownOption: undefined,
  DuplicateOptionProvided: undefined,
  InvalidNegationForNonBooleanOption: undefined,
  PositionalArgumentNotAllowed: undefined,
  MissingRequiredOption: undefined,
  MissingRequiredArgument: undefined,
  OptionMissingValue: undefined,
  FlagAssignedValue: undefined,
});
