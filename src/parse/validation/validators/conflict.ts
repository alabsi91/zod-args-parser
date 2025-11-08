import { isOptionOrArgumentExplicitlyPassed } from "./explicitly-passed.ts";

import type { ContextWide } from "../../../types/context-types.ts";
import type { Argument, Option } from "../../../types/definitions-types.ts";

interface ValidateConflictOptions {
  /** The option or argument name to check its `requires` */
  name: string;

  /** The option or argument to check */
  optionOrArgument: Option | Argument;

  /** The parsed context */
  context: ContextWide;

  /** What we're checking */
  type: "option" | "argument";
}

/** @throws {Error} */
export function validateConflictWith({ name, optionOrArgument, context, type }: ValidateConflictOptions) {
  const conflictWith = optionOrArgument.conflictWith;
  if (!conflictWith || conflictWith.length === 0) return;

  // Check if the options/argument is passed
  if (!isOptionOrArgumentExplicitlyPassed(name, context)) return;

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
    for (const [argumentName, argumentContext] of Object.entries(context.arguments)) {
      if (argumentName === name) continue; // don't check self
      if (!conflictWith.includes(argumentName)) continue; // not a conflict
      if (argumentContext.source === "default") continue; // not explicitly passed
      conflictedArguments.push(argumentName);
    }
  }

  if (conflictedOptions.length === 0 && conflictedArguments.length === 0) return; // OK

  const parts: string[] = [];

  if (conflictedOptions.length > 0) {
    const formatted = conflictedOptions.map(o => `"${o}"`).join(", ");
    const s = conflictedOptions.length > 1 ? "s" : "";
    parts.push(`option${s} ${formatted}`);
  }

  if (conflictedArguments.length > 0) {
    const formatted = conflictedArguments.map(a => `"${a}"`).join(", ");
    const s = conflictedArguments.length > 1 ? "s" : "";
    parts.push(`argument${s} ${formatted}`);
  }

  const joinedParts = parts.join(" and ");

  throw new Error(`${type} "${name}" cannot be used with the ${joinedParts} because they are mutually exclusive.`);
}
