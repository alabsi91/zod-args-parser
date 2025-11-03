import type { Cli, Option, Subcommand } from "./schema-types.ts";

/**
 * Validates CLI definition rules:
 *
 * - Requires `cliName`, `name`, and `type`.
 * - `subcommands`, `options`, and `arguments` may be omitted, but cannot be empty when provided.
 * - Rejects duplicate subcommand names or aliases.
 * - Rejects duplicate option names or aliases within the same CLI or subcommand.
 * - When `allowPositionals` is enabled, positional arguments cannot be optional.
 * - When `allowPositionals` is disabled, only the final positional argument may be optional.
 *
 * @throws {Error} If validation fails.
 */

export function validateCliSchema(cli: Cli) {
  if (!cli.cliName) {
    throw new Error(`invalid cli schema: "cliName" property is required.`);
  }

  const duplicatedOptionsError = checkDuplicated(cli.options);
  if (duplicatedOptionsError) {
    throw new Error(`invalid cli schema "${cli.cliName}": ${duplicatedOptionsError}`);
  }

  validateOptions(cli);

  validateArguments(cli);

  if (!cli.subcommands) return; // ok

  if (cli.subcommands.length === 0) {
    throw new Error(`invalid cli schema "${cli.cliName}": "subcommands" property is optional but cannot be empty.`);
  }

  for (const subcommand of cli.subcommands) {
    if (!subcommand.name) {
      throw new Error(`invalid subcommand schema: subcommand's "name" property is required.`);
    }

    validateOptions(subcommand);

    validateArguments(subcommand);
  }

  const duplicatedSubcommandsError = checkDuplicated(cli.subcommands);
  if (duplicatedSubcommandsError) {
    throw new Error(`invalid cli schema "${cli.cliName}": ${duplicatedSubcommandsError}`);
  }
}

function validateArguments(schema: Cli | Subcommand) {
  if (!schema.arguments) return; // ok

  const isCli = "cliName" in schema;
  const name = isCli ? schema.cliName : schema.name;

  const createError = (message: string) =>
    new Error(`invalid ${isCli ? "cli" : "subcommand"} schema "${name}": ${message}`);

  if (schema.arguments) {
    if (schema.arguments.length === 0) {
      throw createError(`"arguments" property is optional but cannot be empty.`);
    }

    for (let index = 0; index < schema.arguments.length; index++) {
      const argument = schema.arguments[index];

      if (!argument.type) {
        throw createError(`argument's "type" property is required.`);
      }

      if (!argument.type.isOptional) continue; // ok

      if (schema.allowPositionals) {
        throw createError(`optional arguments are not allowed when "allowPositionals" is enabled.`);
      }

      if (index !== schema.arguments.length - 1) {
        throw createError(`only the last argument can be optional.`);
      }
    }
  }
}

function validateOptions(schema: Cli | Subcommand) {
  if (!schema.options) return; // ok

  const isCli = "cliName" in schema;
  const name = isCli ? schema.cliName : schema.name;

  const createError = (message: string) =>
    new Error(`invalid ${isCli ? "cli" : "subcommand"} schema "${name}": ${message}`);

  if (Object.keys(schema.options).length === 0) {
    throw createError(`"options" property is optional but cannot be empty.`);
  }

  for (const [name, option] of Object.entries(schema.options)) {
    if (!option.type) {
      throw createError(`the option "${name}" missing a required property: "type".`);
    }
  }

  const duplicatedOptionsError = checkDuplicated(schema.options);
  if (duplicatedOptionsError) {
    throw createError(duplicatedOptionsError);
  }
}

function checkDuplicated(schema: undefined | Record<string, Option> | readonly Subcommand[]): string | undefined {
  if (!schema) return;

  const isSubcommands = (input: typeof schema): input is readonly Subcommand[] => Array.isArray(input);

  const typeName = isSubcommands(schema) ? "subcommand" : "option";
  const visited = new Map<string, { owner: string; kind: "name" | "alias" }>();

  const entries = isSubcommands(schema)
    ? schema.map(s => [s.name, s.aliases ?? []] as const)
    : Object.entries(schema).map(([name, o]) => [name, o.aliases ?? []] as const);

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
