import type { ContextWide } from "../../../types/context-types.ts";

export function isArgumentExplicitlyPassed(name: string, context: ContextWide) {
  if (!context.arguments) return false;
  return name in context.arguments && context.arguments[name].source !== "default";
}

export function isOptionExplicitlyPassed(name: string, context: ContextWide) {
  if (!context.options) return false;
  return name in context.options && context.options[name].source !== "default";
}

export function isOptionOrArgumentExplicitlyPassed(name: string, context: ContextWide) {
  return isOptionExplicitlyPassed(name, context) || isArgumentExplicitlyPassed(name, context);
}
