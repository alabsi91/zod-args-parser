import { transformOptionToArgument } from "../parse/parser-utilities.ts";
import { CliError, InternalErrorCode, DefinitionErrorCode, ErrorCause } from "../utilities/cli-error.ts";

import type { Cli, Subcommand } from "../types/definitions-types.ts";

/** @throws {CliError} If validation fails. */
export function validateCliDefinition(cliDefinition: Cli) {
  if (!cliDefinition.cliName) {
    throw new CliError({
      cause: ErrorCause.Definition,
      code: DefinitionErrorCode.MissingDefinitionName,
      context: { commandKind: "command" },
    });
  }

  // validate cli options
  validateOptions(cliDefinition);

  // validate cli arguments
  validateArguments(cliDefinition);

  const subcommands = cliDefinition.subcommands;
  if (!subcommands) return; // ok

  // no empty subcommands array
  if (subcommands.length === 0) {
    throw new CliError({
      cause: ErrorCause.Definition,
      code: DefinitionErrorCode.EmptyDefinitionGroup,
      context: { commandKind: "command", commandName: cliDefinition.cliName, kind: "subcommands" },
    });
  }

  const commandsNames = new Set(subcommands.map(c => c.name));

  const visitedSubcommandNames = new Set<string>();

  for (const subcommand of subcommands) {
    if (!subcommand.name) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.MissingDefinitionName,
        context: { commandKind: "subcommand" },
      });
    }

    // no duplicate subcommand names
    if (visitedSubcommandNames.has(subcommand.name)) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.DuplicateDefinitionName,
        context: {
          commandKind: "command",
          commandName: cliDefinition.cliName,
          kind: "subcommand",
          name: subcommand.name,
          foundInKind: "subcommand",
        },
      });
    }
    visitedSubcommandNames.add(subcommand.name);

    // command aliases check
    if (subcommand.aliases) {
      for (const alias of subcommand.aliases) {
        // no empty alias
        if (alias === "") {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.EmptyStringAliasName,
            context: { commandKind: "subcommand", commandName: subcommand.name },
          });
        }

        // no conflict with subcommand name
        if (commandsNames.has(alias)) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.DuplicateDefinitionName,
            context: {
              commandKind: "command",
              commandName: cliDefinition.cliName,
              kind: "subcommand",
              name: subcommand.name,
              foundInKind: "subcommand",
              duplicatedAlias: alias,
            },
          });
        }

        // no conflict with another alias
        const aliasConflicts = subcommands.filter(c => c.name !== subcommand.name && c.aliases?.includes(alias));
        if (aliasConflicts.length > 0) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.DuplicateDefinitionName,
            context: {
              commandKind: "command",
              commandName: cliDefinition.cliName,
              kind: "subcommand",
              name: subcommand.name,
              foundInKind: "subcommand",
              duplicatedAlias: alias,
              foundInName: aliasConflicts[0].name,
            },
          });
        }
      }
    }

    // validate subcommand options
    validateOptions(subcommand);

    // validate subcommand arguments
    validateArguments(subcommand);
  }
}

function validateOptions(commandDefinition: Cli | Subcommand) {
  if (!commandDefinition.options) return; // ok

  const isCli = "cliName" in commandDefinition;
  const commandName = isCli ? commandDefinition.cliName : commandDefinition.name;
  const commandKind = isCli ? "command" : "subcommand";

  const optionsDefinitionEntries = Object.entries(commandDefinition.options);

  // no empty options
  if (optionsDefinitionEntries.length === 0) {
    throw new CliError({
      cause: ErrorCause.Definition,
      code: DefinitionErrorCode.EmptyDefinitionGroup,
      context: { commandKind, commandName, kind: "option" },
    });
  }

  for (const [name, option] of optionsDefinitionEntries) {
    // required type
    if (!option.schema) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.MissingSchema,
        context: { commandKind, commandName, kind: "option", name },
      });
    }

    // should not happen
    if (!option._preparedType) {
      throw new CliError({
        cause: ErrorCause.Internal,
        code: InternalErrorCode.MissingPreparedTypes,
        context: { commandKind, commandName, kind: "option", name },
      });
    }

    // no negated option name for boolean options
    if (isNegatedOptionName(name)) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.InvalidDefinitionOptionName,
        context: { commandKind, commandName, optionName: name },
      });
    }

    // no conflict with argument name
    if (commandDefinition.arguments && name in commandDefinition.arguments) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.DuplicateDefinitionName,
        context: { commandKind, commandName, kind: "option", name, foundInKind: "argument" },
      });
    }

    if (option.aliases) {
      for (const aliasName of option.aliases) {
        // no empty string aliases
        if (aliasName === "") {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.EmptyStringAliasName,
            context: { commandKind, commandName, optionName: name },
          });
        }

        // no negated alias name for boolean options
        if (isNegatedOptionName(aliasName)) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.InvalidDefinitionOptionName,
            context: { commandKind, commandName, optionName: name, negatedAliasName: aliasName },
          });
        }

        // no alias name should conflict with any option name
        if (commandDefinition.options[aliasName]) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.DuplicateDefinitionName,
            context: {
              commandKind,
              commandName,
              kind: "option",
              name,
              duplicatedAlias: aliasName,
              foundInKind: "option",
            },
          });
        }

        // no alias name should conflict with any argument name
        if (commandDefinition.arguments && aliasName in commandDefinition.arguments) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.DuplicateDefinitionName,
            context: {
              commandKind,
              commandName,
              kind: "option",
              name,
              duplicatedAlias: aliasName,
              foundInKind: "argument",
            },
          });
        }

        // no alias name should conflict with any other alias name
        const findConflict = optionsDefinitionEntries.find(([n, d]) => n !== name && d.aliases?.includes(aliasName));
        if (findConflict) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.DuplicateDefinitionName,
            context: {
              commandKind,
              commandName,
              kind: "option",
              name: aliasName,
              foundInKind: "option",
              foundInName: findConflict[0],
            },
          });
        }
      }
    }

    if (option.requires) {
      // no self require
      if (option.requires.includes(name)) {
        throw new CliError({
          cause: ErrorCause.Definition,
          code: DefinitionErrorCode.SelfRequire,
          context: { commandKind, commandName, kind: "option", name: name },
        });
      }

      // no unknown required name
      for (const requiredName of option.requires) {
        const exits = requiredName in commandDefinition.options || requiredName in (commandDefinition.arguments ?? []);
        if (!exits) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.UnknownRequireName,
            context: { commandKind, commandName, kind: "option", name: name, requiredName },
          });
        }
      }
    }

    if (option.conflictWith) {
      // no self conflict
      if (option.conflictWith.includes(name)) {
        throw new CliError({
          cause: ErrorCause.Definition,
          code: DefinitionErrorCode.SelfConflict,
          context: { commandKind, commandName, kind: "option", name: name },
        });
      }

      // no unknown conflict name
      for (const requiredName of option.conflictWith) {
        const exits = requiredName in commandDefinition.options || requiredName in (commandDefinition.arguments ?? []);
        if (!exits) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.UnknownConflictName,
            context: { commandKind, commandName, kind: "option", name: name, requiredName },
          });
        }
      }
    }

    // no intersection between requires and conflicts
    if (option.requires && option.conflictWith) {
      const requiresSet = new Set(option.requires);
      const conflictsSet = new Set(option.conflictWith);

      const intersection = requiresSet.intersection(conflictsSet);
      const intersectedNames = Array.from(intersection).map(name => `"${name}"`);

      if (intersectedNames.length > 0) {
        throw new CliError({
          cause: ErrorCause.Definition,
          code: DefinitionErrorCode.DefinitionRequiresConflictOverlap,
          context: { commandKind, commandName, kind: "option", name: name, intersectedNames },
        });
      }
    }
  }
}

function validateArguments(commandDefinition: Cli | Subcommand) {
  if (!commandDefinition.arguments) return; // ok

  const isCli = "cliName" in commandDefinition;
  const commandName = isCli ? commandDefinition.cliName : commandDefinition.name;
  const commandKind = isCli ? "command" : "subcommand";

  const argumentsDefinitionEntries = Object.entries(commandDefinition.arguments);

  // no empty arguments record
  if (argumentsDefinitionEntries.length === 0) {
    throw new CliError({
      cause: ErrorCause.Definition,
      code: DefinitionErrorCode.EmptyDefinitionGroup,
      context: { commandKind, commandName, kind: "argument" },
    });
  }

  for (const [index, [name, argument]] of argumentsDefinitionEntries.entries()) {
    // no number key name
    if (/^\d+$/.test(name)) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.InvalidDefinitionArgumentName,
        context: { commandKind, commandName, name },
      });
    }

    // should not happen
    if (!argument._preparedType) {
      throw new CliError({
        cause: ErrorCause.Internal,
        code: InternalErrorCode.MissingPreparedTypes,
        context: { commandKind, commandName, kind: "argument", name },
      });
    }

    // no missing schema
    if (!argument.schema) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.MissingSchema,
        context: { commandKind, commandName, kind: "argument", name },
      });
    }

    if (!argument._preparedType.optional) continue; // ok

    // no optional argument when "allowPositionals" is enabled
    if (commandDefinition.allowPositionals) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.InvalidOptionalArgumentDefinition,
        context: { commandKind, commandName, name, allowPositionals: true },
      });
    }

    // only last argument can be optional
    if (index !== argumentsDefinitionEntries.length - 1) {
      throw new CliError({
        cause: ErrorCause.Definition,
        code: DefinitionErrorCode.InvalidOptionalArgumentDefinition,
        context: { commandKind, commandName, name, allowPositionals: false },
      });
    }

    if (argument.requires) {
      // no self require
      if (argument.requires.includes(name)) {
        throw new CliError({
          cause: ErrorCause.Definition,
          code: DefinitionErrorCode.SelfRequire,
          context: { commandKind, commandName, kind: "argument", name },
        });
      }

      // no unknown require
      for (const requiredName of argument.requires) {
        const exits = requiredName in (commandDefinition.options ?? {}) || requiredName in commandDefinition.arguments;
        if (!exits) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.UnknownRequireName,
            context: { commandKind, commandName, kind: "argument", name, requiredName },
          });
        }
      }
    }

    if (argument.conflictWith) {
      // no self conflict
      if (argument.conflictWith.includes(name)) {
        throw new CliError({
          cause: ErrorCause.Definition,
          code: DefinitionErrorCode.SelfConflict,
          context: { commandKind, commandName, kind: "argument", name },
        });
      }

      // no unknown conflict
      for (const requiredName of argument.conflictWith) {
        const exits = requiredName in (commandDefinition.options ?? {}) || requiredName in commandDefinition.arguments;
        if (!exits) {
          throw new CliError({
            cause: ErrorCause.Definition,
            code: DefinitionErrorCode.UnknownConflictName,
            context: { commandKind, commandName, kind: "argument", name, requiredName },
          });
        }
      }
    }

    // no intersection between requires and conflicts
    if (argument.requires && argument.conflictWith) {
      const requiresSet = new Set(argument.requires);
      const conflictsSet = new Set(argument.conflictWith);

      const intersection = requiresSet.intersection(conflictsSet);
      const intersectedNames = Array.from(intersection).map(name => `"${name}"`);

      if (intersectedNames.length > 0) {
        throw new CliError({
          cause: ErrorCause.Definition,
          code: DefinitionErrorCode.DefinitionRequiresConflictOverlap,
          context: { commandKind, commandName, kind: "argument", name, intersectedNames },
        });
      }
    }
  }
}

function isNegatedOptionName(name: string) {
  return transformOptionToArgument(name).startsWith("--no-");
}
