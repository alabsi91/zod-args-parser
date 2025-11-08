import type { ContextWide } from "../types/context-types.ts";
import type { Argument, Cli, Option, Subcommand } from "../types/definitions-types.ts";
import type { InputTypeWide } from "../types/io-types.ts";

/** @throws {Error} */
export function createExecuteContext(inputValues: InputTypeWide, commandDefinition: Subcommand | Cli) {
  const context: ContextWide = {
    subcommand: "cliName" in commandDefinition ? undefined : commandDefinition.name,
  };

  if (commandDefinition.options) {
    createForOptionsOrArguments(commandDefinition.options, context, inputValues.options, "options");
  }

  if (commandDefinition.arguments) {
    createForOptionsOrArguments(commandDefinition.arguments, context, inputValues.arguments, "arguments");
  }

  if (commandDefinition.allowPositionals) {
    context.positionals ??= inputValues.positionals;
  }

  return context;
}

function createForOptionsOrArguments(
  definitionRecord: Record<string, Option> | Record<string, Argument>,
  context: ContextWide,
  inputRecord: Record<string, unknown> | undefined,
  type: "options" | "arguments",
) {
  const definitionEntries = Object.entries(definitionRecord) as [string, Option][] | [string, Argument][];

  for (const [name, definition] of definitionEntries) {
    if (!definition._preparedType) {
      throw new Error(`internal error: missing prepared type for ${type.slice(0, -1)} "${name}"`);
    }

    const { schema, optional, defaultValue } = definition._preparedType;

    // Case the value is passed
    if (inputRecord && name in inputRecord) {
      const passedValue = inputRecord[name];

      context[type] ??= {};
      context[type][name] =
        passedValue === undefined
          ? { name, schema, optional, defaultValue, source: "default" }
          : { name, schema, optional, defaultValue, passedValue, source: "programmatic" };

      continue;
    }

    // case the value is not passed
    if (!optional) {
      throw new Error(`the ${type.slice(0, -1)} "${name}" is required`);
    }

    // case the value is optional
    context[type] ??= {};
    context[type][name] = { name, schema, optional, defaultValue, source: "default" };
  }
}
