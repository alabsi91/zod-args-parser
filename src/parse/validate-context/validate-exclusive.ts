import { isArgument, isOptionOrArgumentExplicitlyPassed } from "./is-explicitly-passed.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Argument, Option } from "../../types/definitions-types.ts";

interface ValidateExclusiveOptions {
  /** The option or argument name to check its `requires` */
  name: string;

  /** The option or argument to check */
  optionOrArgument: Option | Argument;

  /** The parsed context */
  context: ContextWide;
}

/** @throws {Error} */
export function validateExclusive({ name, optionOrArgument, context }: ValidateExclusiveOptions) {
  const exclusive = optionOrArgument.exclusive;
  if (!exclusive) return;

  // Check if the options/argument is passed
  if (!isOptionOrArgumentExplicitlyPassed(name, context)) return;

  // Identify whether we're validating an option or an argument
  const checkingType = isArgument(optionOrArgument) ? "argument" : "option";

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
    for (const argument of context.arguments) {
      if (argument.name === name) continue; // don't check self
      if (requires.includes(argument.name)) continue; // allow required arguments
      if (argument.source === "default") continue; // not explicitly passed
      mutuallyExclusiveArguments.push(argument.name);
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

  throw new Error(
    `${checkingType} "${name}" cannot be used with the ${joinedParts} because they are mutually exclusive.`,
  );
}
