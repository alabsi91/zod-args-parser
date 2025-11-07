import { findDuplicateStrings } from "../utilities.ts";

import type { Cli, Option, Subcommand } from "../types/definitions-types.ts";

/** @throws {Error} If validation fails. */
export function validateCliDefinition(cliDefinition: Cli) {
  if (!cliDefinition.cliName) {
    throw new Error(`invalid cli schema: "cliName" property is required.`);
  }

  const duplicatedOptionsError = checkDuplicated(cliDefinition.options);
  if (duplicatedOptionsError) {
    throw new Error(`invalid cli schema "${cliDefinition.cliName}": ${duplicatedOptionsError}`);
  }

  validateOptions(cliDefinition);

  validateArguments(cliDefinition);

  if (!cliDefinition.subcommands) return; // ok

  if (cliDefinition.subcommands.length === 0) {
    throw new Error(
      `invalid cli schema "${cliDefinition.cliName}": "subcommands" property is optional but cannot be empty.`,
    );
  }

  for (const subcommand of cliDefinition.subcommands) {
    if (!subcommand.name) {
      throw new Error(`invalid subcommand schema: subcommand's "name" property is required.`);
    }

    validateOptions(subcommand);

    validateArguments(subcommand);
  }

  const duplicatedSubcommandsError = checkDuplicated(cliDefinition.subcommands);
  if (duplicatedSubcommandsError) {
    throw new Error(`invalid cli schema "${cliDefinition.cliName}": ${duplicatedSubcommandsError}`);
  }
}

function validateArguments(commandDefinition: Cli | Subcommand) {
  if (!commandDefinition.arguments) return; // ok

  const isCli = "cliName" in commandDefinition;
  const name = isCli ? commandDefinition.cliName : commandDefinition.name;

  const createError = (message: string) =>
    new Error(`invalid ${isCli ? "cli" : "subcommand"} schema "${name}": ${message}`);

  if (commandDefinition.arguments) {
    if (commandDefinition.arguments.length === 0) {
      throw createError(`"arguments" property is optional but cannot be empty.`);
    }

    for (let index = 0; index < commandDefinition.arguments.length; index++) {
      const argument = commandDefinition.arguments[index];
      const name = argument.name;

      if (!argument._preparedType) {
        throw createError(`internal error: missing prepared type.`);
      }

      if (!argument.type) {
        throw createError(`the argument "${name}" missing a required property: "type".`);
      }

      if (!argument._preparedType.optional) continue; // ok

      if (commandDefinition.allowPositionals) {
        throw createError(`the argument "${name}" cannot be optional when "allowPositionals" is enabled.`);
      }

      if (index !== commandDefinition.arguments.length - 1) {
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
          const exits =
            required in (commandDefinition.options ?? {}) ||
            commandDefinition.arguments.some(argument => argument.name === required);
          if (!exits) {
            throw createError(`the argument "${name}" requires "${required}", but it does not exist in the schema.`);
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
          const exits =
            required in (commandDefinition.options ?? {}) ||
            commandDefinition.arguments?.some(argument => argument.name === required);
          if (!exits) {
            throw createError(
              `the argument "${name}" conflict with "${required}", but it does not exist in the schema.`,
            );
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

function validateOptions(commandDefinition: Cli | Subcommand) {
  if (!commandDefinition.options) return; // ok

  const isCli = "cliName" in commandDefinition;
  const name = isCli ? commandDefinition.cliName : commandDefinition.name;

  const createError = (message: string) =>
    new Error(`invalid ${isCli ? "cli" : "subcommand"} schema "${name}": ${message}`);

  if (Object.keys(commandDefinition.options).length === 0) {
    throw createError(`"options" property is optional but cannot be empty.`);
  }

  for (const [name, option] of Object.entries(commandDefinition.options)) {
    if (!option.type) {
      throw createError(`the option "${name}" missing a required property: "type".`);
    }

    if (!option._preparedType) {
      throw createError(`internal error: missing prepared type for option "${name}".`);
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
        const exits =
          required in commandDefinition.options ||
          commandDefinition.arguments?.some(argument => argument.name === required);
        if (!exits) {
          throw createError(`the option "${name}" requires "${required}", but it does not exist in the schema.`);
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
        const exits =
          required in commandDefinition.options ||
          commandDefinition.arguments?.some(argument => argument.name === required);
        if (!exits) {
          throw createError(`the option "${name}" conflict with "${required}", but it does not exist in the schema.`);
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

  const duplicatedOptionsError = checkDuplicated(commandDefinition.options);
  if (duplicatedOptionsError) {
    throw createError(duplicatedOptionsError);
  }
}

function checkDuplicated(definition: undefined | Record<string, Option> | readonly Subcommand[]): string | undefined {
  if (!definition) return;

  const isSubcommands = (input: typeof definition): input is readonly Subcommand[] => Array.isArray(input);

  const typeName = isSubcommands(definition) ? "subcommand" : "option";
  const visited = new Map<string, { owner: string; kind: "name" | "alias" }>();

  const entries = isSubcommands(definition)
    ? definition.map(s => [s.name, s.aliases ?? []] as const)
    : Object.entries(definition).map(([name, o]) => [name, o.aliases ?? []] as const);

  for (const [name, aliases] of entries) {
    // check the main name
    if (visited.has(name)) {
      const previous = visited.get(name)!;
      return `found duplicated ${previous.kind} "${name}" inside the ${typeName} "${previous.owner}".`;
    }

    visited.set(name, { owner: name, kind: "name" });

    // check aliases
    for (const alias of aliases) {
      if (visited.has(alias)) {
        const previous = visited.get(alias)!;
        return `found duplicated ${previous.kind} "${alias}" inside the ${typeName} "${previous.owner}".`;
      }

      visited.set(alias, { owner: name, kind: "alias" });
    }
  }

  return;
}
