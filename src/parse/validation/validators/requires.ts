import {
  isArgumentExplicitlyPassed,
  isOptionExplicitlyPassed,
  isOptionOrArgumentExplicitlyPassed,
} from "./explicitly-passed.ts";

import type { ContextWide } from "../../../types/context-types.ts";
import type { Argument, Cli, Option, Subcommand } from "../../../types/definitions-types.ts";

interface ValidateRequiresOptions {
  /** The option or argument name to check its `requires` */
  name: string;

  /** The subcommand or cli configuration */
  commandDefinition: Subcommand | Cli;

  /** The option or argument to check */
  optionOrArgument: Option | Argument;

  /** The parsed context */
  context: ContextWide;

  /** What we're checking */
  type: "option" | "argument";
}

/** @throws {Error} */
export function validateRequires({
  name,
  commandDefinition,
  optionOrArgument,
  context,
  type,
}: ValidateRequiresOptions) {
  const requires = optionOrArgument.requires;
  if (!requires || requires.length === 0) return;

  // Check if the options/argument is passed
  if (!isOptionOrArgumentExplicitlyPassed(name, context)) return;

  const optionsDefinition = commandDefinition.options ?? {};

  const missingOptions: string[] = [];
  const missingArguments: string[] = [];

  for (const requiredName of requires) {
    const isOption = requiredName in optionsDefinition;

    const provided = isOption
      ? isOptionExplicitlyPassed(requiredName, context)
      : isArgumentExplicitlyPassed(requiredName, context);

    if (provided) continue;

    if (isOption) {
      missingOptions.push(requiredName);
      continue;
    }

    missingArguments.push(requiredName);
  }

  if (missingOptions.length === 0 && missingArguments.length === 0) return; // OK

  const parts: string[] = [];

  if (missingOptions.length > 0) {
    const formatted = missingOptions.map(o => `"${o}"`).join(", ");
    const s = missingOptions.length > 1 ? "s" : "";
    parts.push(`option${s} ${formatted}`);
  }

  if (missingArguments.length > 0) {
    const formatted = missingArguments.map(a => `"${a}"`).join(", ");
    const s = missingArguments.length > 1 ? "s" : "";
    parts.push(`argument${s} ${formatted}`);
  }

  const joinedParts = parts.join(" and ");

  throw new Error(`${type} "${name}" cannot be used without the required ${joinedParts}.`);
}
