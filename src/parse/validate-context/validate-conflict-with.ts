import { isArgument, isOptionOrArgumentExplicitlyPassed } from "./is-explicitly-passed.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Argument, Option } from "../../types/definitions-types.ts";

interface ValidateConflictOptions {
  /** The option or argument name to check its `requires` */
  name: string;

  /** The option or argument to check */
  optionOrArgument: Option | Argument;

  /** The parsed context */
  context: ContextWide;
}

/** @throws {Error} */
export function validateConflictWith({ name, optionOrArgument, context }: ValidateConflictOptions) {
  const conflictWith = optionOrArgument.conflictWith;
  if (!conflictWith || conflictWith.length === 0) return;

  // Check if the options/argument is passed
  if (!isOptionOrArgumentExplicitlyPassed(name, context)) return;

  // Identify whether we're validating an option or an argument
  const checkingType = isArgument(optionOrArgument) ? "argument" : "option";

  const conflictedOptions: string[] = [];
  const conflictedArguments: string[] = [];

  if (context.options) {
    for (const [optionName, optionContext] of Object.entries(context.options)) {
      if (optionName === name) continue; // don't check self
      if (!conflictWith.includes(optionName)) continue; // not a conflict
      if (optionContext.source === "default") continue; // not explicitly passed
      conflictedOptions.push(optionName);
    }
  }

  if (context.arguments) {
    for (const argument of context.arguments) {
      if (argument.name === name) continue; // don't check self
      if (!conflictWith.includes(argument.name)) continue; // not a conflict
      if (argument.source === "default") continue; // not explicitly passed
      conflictedArguments.push(argument.name);
    }
  }

  if (conflictedOptions.length === 0 && conflictedArguments.length === 0) return; // OK

  const parts: string[] = [];

  if (conflictedOptions.length > 0) {
    const formatted = conflictedOptions.map(o => `"${o}"`).join(", ");
    parts.push(`option${conflictedOptions.length > 1 ? "s" : ""} ${formatted}`);
  }

  if (conflictedArguments.length > 0) {
    const formatted = conflictedArguments.map(a => `"${a}"`).join(", ");
    parts.push(`argument${conflictedArguments.length > 1 ? "s" : ""} ${formatted}`);
  }

  const joinedParts = parts.join(" and ");

  throw new Error(
    `${checkingType} "${name}" cannot be used with the ${joinedParts} because they are mutually exclusive.`,
  );
}
