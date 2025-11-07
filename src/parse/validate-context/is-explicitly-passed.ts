import type { ContextWide } from "../../types/context-types.ts";
import type { Argument, Option } from "../../types/definitions-types.ts";

export function isArgument(optionOrArgument: Argument | Option): optionOrArgument is Argument {
  return "name" in optionOrArgument;
}

export function isArgumentExplicitlyPassed(name: string, context: ContextWide) {
  if (!context.arguments) return false;
  return context.arguments.some(argument => argument.name === name && argument.source !== "default");
}

export function isOptionExplicitlyPassed(name: string, context: ContextWide) {
  if (!context.options) return false;
  return name in context.options && context.options[name].source !== "default";
}

export function isOptionOrArgumentExplicitlyPassed(name: string, context: ContextWide) {
  return isOptionExplicitlyPassed(name, context) || isArgumentExplicitlyPassed(name, context);
}
