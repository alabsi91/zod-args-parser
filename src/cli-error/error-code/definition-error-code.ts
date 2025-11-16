import { Enum } from "../../utilities/utilities.ts";

import type { DefinitionErrorI } from "../../types/error-types.ts";

export const DefinitionErrorCode: { [K in keyof DefinitionErrorI]: K } = Enum({
  MissingSchema: undefined,
  EmptyDefinitionGroup: undefined,
  MissingDefinitionName: undefined,
  InvalidDefinitionOptionName: undefined,
  InvalidDefinitionArgumentName: undefined,
  InvalidOptionalArgumentDefinition: undefined,
  DuplicateDefinitionName: undefined,
  EmptyStringAliasName: undefined,
  SelfRequire: undefined,
  UnknownRequireName: undefined,
  SelfConflict: undefined,
  UnknownConflictName: undefined,
  DefinitionRequiresConflictOverlap: undefined,
  MissingOnExecute: undefined,
  SubcommandHelpNotFound: undefined,
});
