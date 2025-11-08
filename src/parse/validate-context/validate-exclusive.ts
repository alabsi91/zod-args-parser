import { isOptionOrArgumentExplicitlyPassed } from "./is-explicitly-passed.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Argument, Option } from "../../types/definitions-types.ts";

interface ValidateExclusiveOptions {
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
export function validateExclusive({ name, optionOrArgument, context, type }: ValidateExclusiveOptions) {
  const exclusive = optionOrArgument.exclusive;
  if (!exclusive) return;

  // Check if the options/argument is passed
  if (!isOptionOrArgumentExplicitlyPassed(name, context)) return;

  const requires = optionOrArgument.requires ?? [];

  const mutuallyExclusiveOptions: string[] = [];
  const mutuallyExclusiveArguments: string[] = [];

  if (context.options) {
    for (const [optionName, optionContext] of Object.entries(context.options)) {
      if (optionName === name) continue; // don't check self
      if (requires.includes(optionName)) continue; // allow required options
      if (optionContext.source === "default") continue; // not explicitly passed
      mutuallyExclusiveOptions.push(optionName);
    }
  }

  if (context.arguments) {
    for (const [argumentName, argumentContext] of Object.entries(context.arguments)) {
      if (argumentName === name) continue; // don't check self
      if (requires.includes(argumentName)) continue; // allow required arguments
      if (argumentContext.source === "default") continue; // not explicitly passed
      mutuallyExclusiveArguments.push(argumentName);
    }
  }

  if (mutuallyExclusiveOptions.length === 0 && mutuallyExclusiveArguments.length === 0) return;

  const parts: string[] = [];

  if (mutuallyExclusiveOptions.length > 0) {
    const formatted = mutuallyExclusiveOptions.map(o => `"${o}"`).join(", ");
    parts.push(`option${mutuallyExclusiveOptions.length > 1 ? "s" : ""} ${formatted}`);
  }

  if (mutuallyExclusiveArguments.length > 0) {
    const formatted = mutuallyExclusiveArguments.map(a => `"${a}"`).join(", ");
    parts.push(`argument${mutuallyExclusiveArguments.length > 1 ? "s" : ""} ${formatted}`);
  }

  const joinedParts = parts.join(" and ");

  throw new Error(`${type} "${name}" cannot be used with the ${joinedParts} because they are mutually exclusive.`);
}
