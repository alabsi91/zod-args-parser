import type { SchemaType } from "./schema-types.ts";

export interface MetadataBase {
  /** Empty string if not provided */
  readonly description: string;

  /** Empty string if not provided */
  readonly descriptionMarkdown: string;

  /** Empty string if not provided */
  readonly example: string;

  /** Whether the metadata is hidden from the documentation. */
  readonly hidden: boolean;
}

export interface CliMetadata extends Omit<MetadataBase, "hidden"> {
  /** The name of the cli program. */
  readonly name: string;

  /** Empty string if not provided */
  readonly usage: string;

  /** Whether the cli program allows positionals arguments. */
  readonly allowPositionals: boolean;

  /** Empty array if not provided */
  readonly options: OptionMetadata[];

  /** Empty array if not provided */
  readonly arguments: ArgumentMetadata[];

  /** Empty array if not provided */
  readonly subcommands: SubcommandMetadata[];
}

export interface SubcommandMetadata extends MetadataBase {
  /** The subcommand name. */
  readonly name: string;

  /** Empty array if not provided */
  readonly aliases: string[];

  /** Empty string if not provided */
  readonly placeholder: string;

  /** Empty string if not provided */
  readonly usage: string;

  /** Whether the subcommand allows positionals arguments. */
  readonly allowPositionals: boolean;

  /** Empty array if not provided */
  readonly options: OptionMetadata[];

  /** Empty array if not provided */
  readonly arguments: ArgumentMetadata[];
}

export interface OptionMetadata extends MetadataBase {
  /** The option name. */
  readonly name: string;

  /** The option name as argument. E.g. `--option-name` */
  readonly nameAsArg: string;

  /** Empty array if not provided. */
  readonly aliases: string[];

  /** Empty array if not provided. E.g. `[--alias-name, ...]` */
  readonly aliasesAsArgs: string[];

  /** Empty string if not provided */
  readonly placeholder: string;

  /** The default value of the option. */
  readonly defaultValue: unknown;

  /** Empty string if not provided. */
  readonly defaultValueAsString: string;

  /** Is optional. */
  readonly optional: boolean;

  /** Standard Schema V1. */
  readonly schema: SchemaType;
}

export interface ArgumentMetadata extends MetadataBase {
  /** The argument name. */
  readonly name: string;

  /** The default value of the argument. */
  readonly defaultValue: unknown;

  /** The default value of the argument as string. */
  readonly defaultValueAsString: string;

  /** Is optional. */
  readonly optional: boolean;

  /** Standard Schema V1. */
  readonly schema: SchemaType;
}
