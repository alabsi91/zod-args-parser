import { CliError, ErrorCause, InternalErrorCode, ParseErrorCode } from "../../utilities/cli-error.ts";
import {
  decoupleFlags,
  findOption,
  findSubcommandDefinition,
  isFlagArgument,
  isOptionArgument,
  splitAndGetKeys,
} from "../parser-utilities.ts";

import type { ContextWide } from "../../types/context-types.ts";
import type { Cli } from "../../types/definitions-types.ts";

/**
 * Parse argv and create a cli context
 *
 * @throws {CliError}
 */
export function buildCliContext(argv: string[], cliDefinition: Cli) {
  const cliName = cliDefinition.cliName;
  const subcommandArray = cliDefinition.subcommands ?? [];
  const allSubcommands = new Set<string>(subcommandArray.flatMap(c => [c.name, ...(c.aliases || [])]));

  // decouple flags E.g. `-rf` -> `-r, -f`
  argv = decoupleFlags(argv);

  const context: ContextWide = {
    subcommand: undefined,
  };

  /** Get the current subcommand definition or cli definition if subcommand name is `undefined` object */
  const getCommandDefinition = () => findSubcommandDefinition(context.subcommand, cliDefinition);

  for (let index = 0; index < argv.length; index++) {
    const argvItem = argv[index];

    // * Subcommand check
    if (index === 0) {
      context.subcommand = allSubcommands.has(argvItem) ? argvItem : undefined;

      // First argument is a subcommand. Skip to the next argument
      if (context.subcommand) continue;
    }

    // * Option check

    const argumentAndValue = argvItem.split("=").filter(Boolean); // E.g --option=value -> ["--option", "value"]
    const argumentWithEquals = argvItem.includes("="); // E.g --option=value
    const [argument, keys] = splitAndGetKeys(argumentAndValue[0]); // E.g --option.foo.bar -> ["--option", ["foo", "bar"]]
    const optionWithKeys = keys.length > 0; // E.g --option.foo.bar
    const argumentValue: string | undefined = argumentAndValue[1];
    const isNegated = argument.startsWith("--no-");

    if (isOptionArgument(argument)) {
      const commandDefinition = getCommandDefinition();
      const commandKind = context.subcommand === undefined ? "command" : "subcommand";
      const commandName = context.subcommand ?? cliName;

      if (isFlagArgument(argument) && argumentWithEquals) {
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.FlagAssignedValue,
          context: { commandKind, commandName, flag: argument, value: argumentValue },
        });
      }

      if (!commandDefinition) {
        if (context.subcommand === undefined) {
          throw new CliError({
            cause: ErrorCause.Internal,
            code: InternalErrorCode.CannotFindCliDefinition,
            context: { cliName },
          });
        }

        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.UnknownSubcommand,
          context: { commandName },
        });
      }

      if (!commandDefinition.options) {
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.CommandWithoutOptions,
          context: { commandKind, commandName, optionName: argument },
        });
      }

      const nameOptionTuple = findOption(argument, commandDefinition.options);
      if (!nameOptionTuple) {
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.UnknownOption,
          context: { commandKind, commandName, optionName: argument },
        });
      }

      const [optionName, optionDefinition] = nameOptionTuple;

      if (!optionWithKeys && context.options && optionName in context.options) {
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.DuplicateOptionProvided,
          context: { commandKind, commandName, optionName },
        });
      }

      if (!optionDefinition._preparedType) {
        throw new CliError({
          cause: ErrorCause.Internal,
          code: InternalErrorCode.MissingPreparedTypes,
          context: { commandKind, commandName, kind: "option", name: optionName },
        });
      }

      const { schema, optional, defaultValue, coerceTo } = optionDefinition._preparedType;

      const nextArgument = argv[index + 1];

      let optionValue: string | boolean | undefined = argumentWithEquals ? argumentValue : nextArgument;

      const isBoolean = coerceTo === "boolean";

      if (isNegated && !isBoolean) {
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.InvalidNegationForNonBooleanOption,
          context: { commandKind, commandName, optionName },
        });
      }

      // infer value for boolean options
      if (isBoolean) {
        if (!argumentWithEquals) {
          optionValue = "true";
        }

        if (isNegated && ["true", "false"].includes(optionValue.toLowerCase())) {
          optionValue = optionValue === "true" ? "false" : "true";
        }
      }

      if (optionValue === undefined || (!argumentWithEquals && isOptionArgument(optionValue))) {
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.OptionMissingValue,
          context: { commandKind, commandName, optionName },
        });
      }

      context.options ??= {};

      // Handle options with keys for type `object`
      // E.g. `--option.key.nested=value`
      if (optionWithKeys) {
        const previousObject = JSON.parse(context.options[optionName]?.stringValue || "{}") as Record<string, any>;

        let current = previousObject;
        for (let index = 0; index < keys.length; index++) {
          const key = keys[index];

          if (current[key] === undefined) {
            current[key] = {};
          }

          if (index === keys.length - 1) {
            current[key] = optionValue;
            continue;
          }

          current = current[key] as Record<string, any>;
        }

        optionValue = JSON.stringify(previousObject);
      }

      context.options[optionName] = {
        schema,
        optional,
        defaultValue,
        flag: argument,
        stringValue: optionValue,
        source: "terminal",
      };

      // Skip to the next argument if it is the current option's value.
      if (!argumentWithEquals && !isBoolean) {
        index++;
      }

      continue;
    }

    const commandDefinition = getCommandDefinition();

    // * Arguments check
    if (commandDefinition?.arguments) {
      context.arguments ??= {};

      const currentArgumentCount = Object.keys(context.arguments).length;
      const argumentDefinitionEntries = Object.entries(commandDefinition.arguments);

      // The current argument is a typed argument and not a positional
      if (currentArgumentCount < argumentDefinitionEntries.length) {
        const [name, argumentDefinition] = argumentDefinitionEntries[currentArgumentCount];

        if (!argumentDefinition._preparedType) {
          throw new CliError({
            cause: ErrorCause.Internal,
            code: InternalErrorCode.MissingPreparedTypes,
            context: {
              commandKind: context.subcommand ? "subcommand" : "command",
              commandName: context.subcommand ?? cliName,
              kind: "argument",
              name,
            },
          });
        }

        const { schema, optional, defaultValue } = argumentDefinition._preparedType;

        context.arguments[name] = { schema, optional, defaultValue, stringValue: argvItem, source: "terminal" };
        continue;
      }
    }

    // The current argument is a positional and not a typed argument (when `allowPositionals` is enabled)
    if (commandDefinition?.allowPositionals) {
      context.positionals ??= [];
      context.positionals.push(argvItem);
      continue;
    }

    throw new CliError({
      cause: ErrorCause.Parse,
      code: ParseErrorCode.PositionalArgumentNotAllowed,
      context: {
        commandKind: context.subcommand ? "subcommand" : "command",
        commandName: context.subcommand ?? cliName,
        argumentName: argvItem,
      },
    });
  }

  const commandDefinition = getCommandDefinition();
  if (!commandDefinition) {
    if (context.subcommand === undefined) {
      throw new CliError({
        cause: ErrorCause.Internal,
        code: InternalErrorCode.CannotFindCliDefinition,
        context: { cliName },
      });
    }

    throw new CliError({
      cause: ErrorCause.Parse,
      code: ParseErrorCode.UnknownSubcommand,
      context: { commandName: context.subcommand ?? cliName },
    });
  }

  // Options
  if (commandDefinition.options) {
    context.options ??= {};

    for (const [name, optionDefinition] of Object.entries(commandDefinition.options)) {
      // option already added to the context (found during argument parsing)
      if (name in context.options) continue;

      if (!optionDefinition._preparedType) {
        throw new CliError({
          cause: ErrorCause.Internal,
          code: InternalErrorCode.MissingPreparedTypes,
          context: {
            commandKind: context.subcommand ? "subcommand" : "command",
            commandName: context.subcommand ?? cliName,
            kind: "option",
            name,
          },
        });
      }

      const { schema, optional, defaultValue } = optionDefinition._preparedType;

      if (optional) {
        // optional without default value
        if (defaultValue === undefined) {
          continue;
        }

        // optional with default value
        context.options[name] = { schema, optional, defaultValue, source: "default" };
        continue;
      }

      throw new CliError({
        cause: ErrorCause.Parse,
        code: ParseErrorCode.MissingRequiredOption,
        context: {
          commandKind: context.subcommand ? "subcommand" : "command",
          commandName: context.subcommand ?? cliName,
          optionName: name,
        },
      });
    }
  }

  // Arguments
  if (commandDefinition.arguments) {
    context.arguments ??= {};

    const currentArgumentCount = Object.keys(context.arguments).length;

    const argumentDefinitionEntries = Object.entries(commandDefinition.arguments);
    const argumentsDefinitionLength = argumentDefinitionEntries.length;

    // missing arguments
    if (currentArgumentCount < argumentsDefinitionLength) {
      for (let index = currentArgumentCount; index < argumentsDefinitionLength; index++) {
        const [name, argumentDefinition] = argumentDefinitionEntries[index];

        if (!argumentDefinition._preparedType) {
          throw new CliError({
            cause: ErrorCause.Internal,
            code: InternalErrorCode.MissingPreparedTypes,
            context: {
              commandKind: context.subcommand ? "subcommand" : "command",
              commandName: context.subcommand ?? cliName,
              kind: "argument",
              name,
            },
          });
        }

        const { schema, optional, defaultValue } = argumentDefinition._preparedType;

        if (optional) {
          // optional argument without default value
          if (defaultValue === undefined) {
            continue;
          }

          // optional argument with default value
          context.arguments[name] = { schema, optional, defaultValue, source: "default" };
          continue;
        }

        // required argument
        throw new CliError({
          cause: ErrorCause.Parse,
          code: ParseErrorCode.MissingRequiredArgument,
          context: {
            commandKind: context.subcommand ? "subcommand" : "command",
            commandName: context.subcommand ?? cliName,
            argumentName: name,
          },
        });
      }
    }
  }

  // make sure `positionals` is defined when `allowPositionals` is enabled
  if (commandDefinition.allowPositionals) {
    context.positionals ??= [];
  }

  return context;
}
