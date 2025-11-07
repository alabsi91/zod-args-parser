import type { SchemaType } from "../types.ts";

export interface MetadataBase {
  /** The description of the cli program. Empty string if not provided */
  readonly description: string;

  /** The markdown description of the cli program. Empty string if not provided */
  readonly descriptionMarkdown: string;

  /** The example of the cli program. Empty string if not provided */
  readonly example: string;

  /** Whether the argument is hidden. */
  readonly hidden: boolean;
}

export interface CliMetadata extends Omit<MetadataBase, "hidden"> {
  /** The name of the cli program. */
  readonly name: string;

  /** The usage of the cli program. Empty string if not provided */
  readonly usage: string;

  /** Whether the cli program allows positionals arguments. */
  readonly allowPositionals: boolean;

  /** The options of the cli program. Empty array if not provided */
  readonly options: OptionMetadata[];

  /** The arguments of the cli program. Empty array if not provided */
  readonly arguments: ArgumentMetadata[];

  /** The subcommands of the cli program. Empty array if not provided */
  readonly subcommands: SubcommandMetadata[];
}

export interface SubcommandMetadata extends MetadataBase {
  /** The subcommand name. */
  readonly name: string;

  /** The aliases of the subcommand. Empty array if not provided */
  readonly aliases: string[];

  /** The placeholder of the subcommand. Empty string if not provided */
  readonly placeholder: string;

  /** The usage of the subcommand. Empty string if not provided */
  readonly usage: string;

  /** Whether the subcommand allows positionals arguments. */
  readonly allowPositionals: boolean;

  /** The options of the subcommand. Empty array if not provided */
  readonly options: OptionMetadata[];

  /** The arguments of the subcommand. Empty array if not provided */
  readonly arguments: ArgumentMetadata[];
}

export interface OptionMetadata extends MetadataBase {
  /** The option name in camelCase. E.g. `optionName` */
  readonly name: string;

  /** The option name in kebab-case. E.g. `--option-name` */
  readonly nameAsArg: string;

  /** The aliases of the option in camelCase. Empty array if not provided. E.g. `[aliasName, ...]` */
  readonly aliases: string[];

  /** The aliases of the option in kebab-case. Empty array if not provided. E.g. `[--alias-name, ...]` */
  readonly aliasesAsArgs: string[];

  /** The placeholder of the option. Empty string if not provided */
  readonly placeholder: string;

  /** The default value of the option. */
  readonly defaultValue: unknown;

  /** The default value of the option as string. */
  readonly defaultValueAsString: string;

  /** Whether the option is optional. */
  readonly optional: boolean;

  /** The zod type of the option. */
  readonly schema: SchemaType;
}

export interface ArgumentMetadata extends MetadataBase {
  /** The argument name. */
  readonly name: string;

  /** The default value of the argument. */
  readonly defaultValue: unknown;

  /** The default value of the argument as string. */
  readonly defaultValueAsString: string;

  /** Whether the argument is optional. */
  readonly optional: boolean;

  /** The zod type of the argument. */
  readonly schema: SchemaType;
}
