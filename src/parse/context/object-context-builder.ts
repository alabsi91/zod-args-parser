import { CliError, ErrorCause, InternalErrorCode, ParseErrorCode } from "../../utilities/cli-error.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Argument, Cli, Option, Subcommand } from "../../types/definitions-types.ts";
import type { InputTypeWide } from "../../types/io-types.ts";

/** @throws {CliError} */
export function buildObjectContext(inputValues: InputTypeWide, commandDefinition: Subcommand | Cli) {
  const context: ContextWide = {
    subcommand: "cliName" in commandDefinition ? undefined : commandDefinition.name,
  };

  buildForOptionsOrArguments(commandDefinition, context, inputValues.options, "options");

  buildForOptionsOrArguments(commandDefinition, context, inputValues.arguments, "arguments");

  if (commandDefinition.allowPositionals) {
    context.positionals ??= inputValues.positionals;
  }

  return context;
}

function buildForOptionsOrArguments(
  commandDefinition: Subcommand | Cli,
  context: ContextWide,
  inputRecord: Record<string, unknown> | undefined,
  type: "options" | "arguments",
) {
  if (!commandDefinition[type]) return;

  const optionOrArgumentDefinitions = commandDefinition[type];
  const kind = type.slice(0, -1) as "option" | "argument";
  const commandKind = "cliName" in commandDefinition ? "command" : "subcommand";
  const commandName = "cliName" in commandDefinition ? commandDefinition.cliName : commandDefinition.name;

  const definitionEntries = Object.entries(optionOrArgumentDefinitions) as [string, Option][] | [string, Argument][];

  for (const [name, definition] of definitionEntries) {
    if (!definition._preparedType) {
      throw new CliError({
        cause: ErrorCause.Internal,
        code: InternalErrorCode.MissingPreparedTypes,
        context: { commandKind, commandName, kind, name },
      });
    }

    const { schema, optional, defaultValue } = definition._preparedType;

    // Case the value is passed
    if (inputRecord && name in inputRecord) {
      const passedValue = inputRecord[name];

      context[type] ??= {};
      context[type][name] =
        passedValue === undefined
          ? { schema, optional, defaultValue, source: "default" }
          : { schema, optional, defaultValue, passedValue, source: "programmatic" };

      continue;
    }

    // case the value is not passed
    if (!optional) {
      if (kind === "option") {
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.MissingRequiredOption,
          context: { commandKind, commandName, optionName: name },
        });
      }

      if (kind === "argument") {
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.MissingRequiredArgument,
          context: { commandKind, commandName, argumentName: name },
        });
      }
    }

    // case the value is optional
    context[type] ??= {};
    context[type][name] = { schema, optional, defaultValue, source: "default" };
  }
}
