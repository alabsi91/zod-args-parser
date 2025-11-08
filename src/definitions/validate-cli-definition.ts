import { findDuplicateStrings } from "../utilities.ts";

import type { Cli, Subcommand } from "../types/definitions-types.ts";

/** @throws {Error} If validation fails. */
export function validateCliDefinition(cliDefinition: Cli) {
  if (!cliDefinition.cliName) {
    throw new Error(`invalid cli definition: "cliName" property is required.`);
  }

  validateOptions(cliDefinition);

  validateArguments(cliDefinition);

  if (!cliDefinition.subcommands) return; // ok

  if (cliDefinition.subcommands.length === 0) {
    throw new Error(
      `invalid cli definition "${cliDefinition.cliName}": "subcommands" property is optional but cannot be empty.`,
    );
  }

  const commandsNames = cliDefinition.subcommands.map(c => c.name);

  // commands names duplication
  const commandsNamesDuplicates = findDuplicateStrings(commandsNames).map(c => `"${c}"`);
  if (commandsNamesDuplicates.length > 0) {
    throw new Error(
      `invalid cli definition "${cliDefinition.cliName}" has duplicated subcommands: ${commandsNamesDuplicates.join(", ")}.`,
    );
  }

  for (const subcommand of cliDefinition.subcommands) {
    if (!subcommand.name) {
      throw new Error(`invalid subcommand definition: subcommand's "name" property is required.`);
    }

    // command aliases check
    if (subcommand.aliases) {
      // aliases array has duplicates
      const aliasesDuplicates = findDuplicateStrings(subcommand.aliases).map(c => `"${c}"`);
      if (aliasesDuplicates.length > 0) {
        throw new Error(`subcommand "${subcommand.name}" has duplicated aliases: ${aliasesDuplicates.join(", ")}.`);
      }

      for (const alias of subcommand.aliases) {
        // aliases conflict with command name
        if (commandsNames.includes(alias)) {
          throw new Error(`subcommand "${subcommand.name}" alias "${alias}" conflicts with another subcommand name.`);
        }

        // aliases conflict with other aliases
        const aliasConflicts = cliDefinition.subcommands.filter(
          c => c.name !== subcommand.name && c.aliases?.includes(alias),
        );
        if (aliasConflicts.length > 0) {
          throw new Error(
            `subcommand "${subcommand.name}" alias "${alias}" conflicts with another subcommand alias: "${aliasConflicts[0].name}".`,
          );
        }
      }
    }

    validateOptions(subcommand);

    validateArguments(subcommand);
  }
}

function validateOptions(commandDefinition: Cli | Subcommand) {
  if (!commandDefinition.options) return; // ok

  const isCli = "cliName" in commandDefinition;
  const name = isCli ? commandDefinition.cliName : commandDefinition.name;

  const createError = (message: string) =>
    new Error(`invalid ${isCli ? "cli" : "subcommand"} definition "${name}": ${message}`);

  const optionsDefinitionEntries = Object.entries(commandDefinition.options);

  if (optionsDefinitionEntries.length === 0) {
    throw createError(`"options" property is optional but cannot be empty.`);
  }

  for (const [name, option] of optionsDefinitionEntries) {
    if (!option.type) {
      throw createError(`the option "${name}" missing a required property: "type".`);
    }

    if (!option._preparedType) {
      throw createError(`internal error: missing prepared type for option "${name}".`);
    }

    if (commandDefinition.arguments && name in commandDefinition.arguments) {
      throw createError(`the option "${name}" name conflicts with an argument name.`);
    }

    if (option.aliases) {
      // aliases array has duplicates
      const aliasesDuplicates = findDuplicateStrings(option.aliases);
      if (aliasesDuplicates.length > 0) {
        throw createError(`the option "${name}" has duplicated aliases: ${aliasesDuplicates.join(", ")}.`);
      }

      for (const alias of option.aliases) {
        // alias name conflict with other option name
        if (commandDefinition.options[alias]) {
          throw createError(`the alias "${alias}" of the option "${name}" conflicts with another option name.`);
        }

        // alias name conflict with argument name
        if (commandDefinition.arguments && alias in commandDefinition.arguments) {
          throw createError(`the alias "${alias}" of the option "${name}" conflicts with an argument name.`);
        }

        // alias name conflict with other alias name
        const findConflict = optionsDefinitionEntries.find(([n, d]) => n !== name && d.aliases?.includes(alias));
        if (findConflict) {
          throw createError(
            `the alias "${alias}" of the option "${name}" conflicts with another alias name of the option "${findConflict[0]}".`,
          );
        }
      }
    }

    if (option.requires) {
      if (option.requires.includes(name)) {
        throw createError(`the option "${name}" cannot require itself.`);
      }

      const duplicateRequires = findDuplicateStrings(option.requires).map(required => `"${required}"`);
      if (duplicateRequires.length > 0) {
        throw createError(`the option "${name}" has duplicate requires: ${duplicateRequires.join(", ")}.`);
      }

      for (const required of option.requires) {
        const exits = required in commandDefinition.options || required in (commandDefinition.arguments ?? []);
        if (!exits) {
          throw createError(`the option "${name}" requires "${required}", but it does not exist.`);
        }
      }
    }

    if (option.conflictWith) {
      if (option.conflictWith.includes(name)) {
        throw createError(`the option "${name}" cannot conflict itself.`);
      }

      const duplicateRequires = findDuplicateStrings(option.conflictWith).map(conflict => `"${conflict}"`);
      if (duplicateRequires.length > 0) {
        throw createError(`the option "${name}" has duplicate conflicts: ${duplicateRequires.join(", ")}.`);
      }

      for (const required of option.conflictWith) {
        const exits = required in commandDefinition.options || required in (commandDefinition.arguments ?? []);
        if (!exits) {
          throw createError(`the option "${name}" conflict with "${required}", but it does not exist.`);
        }
      }
    }

    if (option.requires && option.conflictWith) {
      const requiresSet = new Set(option.requires);
      const conflictsSet = new Set(option.conflictWith);
      const intersection = requiresSet.intersection(conflictsSet);
      const intersectionArray = Array.from(intersection).map(name => `"${name}"`);
      if (intersectionArray.length > 0) {
        throw createError(
          `the option "${name}" cannot require and conflict with the same name${intersectionArray.length > 1 ? "s" : ""}: ${intersectionArray.join(", ")}.`,
        );
      }
    }
  }
}

function validateArguments(commandDefinition: Cli | Subcommand) {
  if (!commandDefinition.arguments) return; // ok

  const isCli = "cliName" in commandDefinition;
  const name = isCli ? commandDefinition.cliName : commandDefinition.name;

  const createError = (message: string) => {
    return new Error(`invalid ${isCli ? "cli" : "subcommand"} definition "${name}": ${message}`);
  };

  if (commandDefinition.arguments) {
    const argumentsDefinitionEntries = Object.entries(commandDefinition.arguments);

    if (argumentsDefinitionEntries.length === 0) {
      throw createError(`"arguments" property is optional but cannot be empty.`);
    }

    for (const [index, [name, argument]] of argumentsDefinitionEntries.entries()) {
      if (/^\d+$/.test(name)) {
        throw createError(`the argument "${name}" name cannot be a number.`);
      }

      if (!argument._preparedType) {
        throw createError(`internal error: missing prepared type for argument "${name}".`);
      }

      if (!argument.type) {
        throw createError(`the argument "${name}" missing a required property: "type".`);
      }

      if (commandDefinition.options && name in commandDefinition.options) {
        throw createError(`the argument "${name}" name conflicts with an option name.`);
      }

      if (!argument._preparedType.optional) continue; // ok

      if (commandDefinition.allowPositionals) {
        throw createError(`the argument "${name}" cannot be optional when "allowPositionals" is enabled.`);
      }

      if (index !== argumentsDefinitionEntries.length - 1) {
        throw createError(`the argument "${name}" cannot be optional unless it is the last argument.`);
      }

      if (argument.requires) {
        if (argument.requires.includes(name)) {
          throw createError(`the argument "${name}" cannot require itself.`);
        }

        const duplicateRequires = findDuplicateStrings(argument.requires).map(required => `"${required}"`);
        if (duplicateRequires.length > 0) {
          throw createError(`the argument "${name}" has duplicate requires: ${duplicateRequires.join(", ")}.`);
        }

        for (const required of argument.requires) {
          const exits = required in (commandDefinition.options ?? {}) || required in commandDefinition.arguments;
          if (!exits) {
            throw createError(`the argument "${name}" requires "${required}", but it does not exist.`);
          }
        }
      }

      if (argument.conflictWith) {
        if (argument.conflictWith.includes(name)) {
          throw createError(`the argument "${name}" cannot conflict itself.`);
        }

        const duplicateRequires = findDuplicateStrings(argument.conflictWith).map(conflict => `"${conflict}"`);
        if (duplicateRequires.length > 0) {
          throw createError(`the argument "${name}" has duplicate conflicts: ${duplicateRequires.join(", ")}.`);
        }

        for (const required of argument.conflictWith) {
          const exits = required in (commandDefinition.options ?? {}) || required in commandDefinition.arguments;
          if (!exits) {
            throw createError(`the argument "${name}" conflict with "${required}", but it does not exist.`);
          }
        }
      }

      if (argument.requires && argument.conflictWith) {
        const requiresSet = new Set(argument.requires);
        const conflictsSet = new Set(argument.conflictWith);
        const intersection = requiresSet.intersection(conflictsSet);
        const intersectionArray = Array.from(intersection).map(name => `"${name}"`);
        if (intersectionArray.length > 0) {
          throw createError(
            `the argument "${name}" cannot require and conflict with the same name${intersectionArray.length > 1 ? "s" : ""}: ${intersectionArray.join(", ")}.`,
          );
        }
      }
    }
  }
}
