import {
  isArgument,
  isArgumentExplicitlyPassed,
  isOptionExplicitlyPassed,
  isOptionOrArgumentExplicitlyPassed,
} from "./is-explicitly-passed.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Argument, Cli, Option, Subcommand } from "../../types/definitions-types.ts";

interface ValidateRequiresOptions {
  /** The option or argument name to check its `requires` */
  name: string;

  /** The subcommand or cli configuration */
  commandDefinition: Subcommand | Cli;

  /** The option or argument to check */
  optionOrArgument: Option | Argument;

  /** The parsed context */
  context: ContextWide;
}

/** @throws {Error} */
export function validateRequires({ name, commandDefinition, optionOrArgument, context }: ValidateRequiresOptions) {
  const requires = optionOrArgument.requires;
  if (!requires || requires.length === 0) return;

  // Check if the options/argument is passed
  if (!isOptionOrArgumentExplicitlyPassed(name, context)) return;

  // Identify whether we're validating an option or an argument
  const checkingType = isArgument(optionOrArgument) ? "argument" : "option";

  const schemaOptions = commandDefinition.options ?? {};

  const missingOptions: string[] = [];
  const missingArguments: string[] = [];

  for (const requiredName of requires) {
    const isOption = requiredName in schemaOptions;

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
    parts.push(`option${missingOptions.length > 1 ? "s" : ""} ${formatted}`);
  }

  if (missingArguments.length > 0) {
    const formatted = missingArguments.map(a => `"${a}"`).join(", ");
    parts.push(`argument${missingArguments.length > 1 ? "s" : ""} ${formatted}`);
  }

  const joinedParts = parts.join(" and ");

  throw new Error(`${checkingType} "${name}" cannot be used without the required ${joinedParts}.`);
}
