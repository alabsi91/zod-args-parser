import { CliError, ErrorCause, ValidationErrorCode } from "../../../utilities/cli-error.ts";
import { isOptionOrArgumentExplicitlyPassed } from "./explicitly-passed.ts";

import type { ContextWide } from "../../../types/context-types.ts";
import type { Argument, Option } from "../../../types/definitions-types.ts";

interface ValidateExclusiveOptions {
  /** The option or argument name to check its `requires` */
  name: string;

  /** The option or argument to check */
  optionOrArgument: Option | Argument;

  /** The parsed context */
  context: ContextWide;

  /** What we're checking */
  kind: "option" | "argument";
}

/** @throws {CliError} */
export function validateExclusive({ name, optionOrArgument, context, kind }: ValidateExclusiveOptions) {
  const exclusive = optionOrArgument.exclusive;
  if (!exclusive) return;

  // Check if the options/argument is passed
  if (!isOptionOrArgumentExplicitlyPassed(name, context)) return;

  const requires = optionOrArgument.requires ?? [];

  const conflictedOptions: string[] = [];
  const conflictedArguments: string[] = [];

  if (context.options) {
    for (const [optionName, optionContext] of Object.entries(context.options)) {
      if (optionName === name) continue; // don't check self
      if (requires.includes(optionName)) continue; // allow required options
      if (optionContext.source === "default") continue; // not explicitly passed
      conflictedOptions.push(optionName);
    }
  }

  if (context.arguments) {
    for (const [argumentName, argumentContext] of Object.entries(context.arguments)) {
      if (argumentName === name) continue; // don't check self
      if (requires.includes(argumentName)) continue; // allow required arguments
      if (argumentContext.source === "default") continue; // not explicitly passed
      conflictedArguments.push(argumentName);
    }
  }

  if (conflictedOptions.length === 0 && conflictedArguments.length === 0) return;

  throw new CliError({
    cause: ErrorCause.Validation,
    code: ValidationErrorCode.MutuallyExclusiveConflict,
    context: { kind, name, conflictedOptions, conflictedArguments },
  });
}
