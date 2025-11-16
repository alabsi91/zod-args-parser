import { InternalErrorCode } from "../error-code/internal-error-code.ts";

import type { CliErrorOptionByCause } from "../../types/error-types.ts";

export function internalErrorMessage({ code, context }: CliErrorOptionByCause<"Internal">) {
  if (code === InternalErrorCode.MissingPreparedTypes) {
    return (
      `internal error: missing prepared type ` +
      `for option "${context.name}" in ${context.commandKind} "${context.commandName}"`
    );
  }

  if (code === InternalErrorCode.CannotFindCliDefinition) {
    return `internal error: cannot find cli definition "${context.cliName}"`;
  }

  const executiveCheck: never = code;
  return executiveCheck;
}
