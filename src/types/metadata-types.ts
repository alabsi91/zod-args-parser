import type { SchemaType } from "./schema-types.ts";

export interface MetadataBase {
  /** Empty string if not provided */
  description: string;

  /** Empty string if not provided */
  descriptionMarkdown: string;

  /** Empty string if not provided */
  example: string;

  /** Whether the metadata is hidden from the documentation. */
  hidden: boolean;
}

export interface CliMetadata extends Omit<MetadataBase, "hidden"> {
  /** The name of the cli program. */
  name: string;

  /** Empty string if not provided */
  usage: string;

  /** Whether the cli program allows positionals arguments. */
  allowPositionals: boolean;

  /** Empty array if not provided */
  options: OptionMetadata[];

  /** Empty array if not provided */
  arguments: ArgumentMetadata[];

  /** Empty array if not provided */
  subcommands: SubcommandMetadata[];
}

export interface SubcommandMetadata extends MetadataBase {
  /** The subcommand name. */
  name: string;

  /** Empty array if not provided */
  aliases: string[];

  /** Empty string if not provided */
  placeholder: string;

  /** Empty string if not provided */
  usage: string;

  /** Whether the subcommand allows positionals arguments. */
  allowPositionals: boolean;

  /** Empty array if not provided */
  options: OptionMetadata[];

  /** Empty array if not provided */
  arguments: ArgumentMetadata[];
}

export interface OptionMetadata extends MetadataBase {
  /** The option name. */
  name: string;

  /** The option name as argument. E.g. `--option-name` */
  nameAsArg: string;

  /** Empty array if not provided. */
  aliases: string[];

  /** Empty array if not provided. E.g. `[--alias-name, ...]` */
  aliasesAsArgs: string[];

  /** Empty string if not provided */
  placeholder: string;

  /** The default value of the option. */
  defaultValue: unknown;

  /** Empty string if not provided. */
  defaultValueAsString: string;

  /** Is optional. */
  optional: boolean;

  /** Standard Schema V1. */
  schema: SchemaType;
}

export interface ArgumentMetadata extends MetadataBase {
  /** The argument name. */
  name: string;

  /** The default value of the argument. */
  defaultValue: unknown;

  /** The default value of the argument as string. */
  defaultValueAsString: string;

  /** Is optional. */
  optional: boolean;

  /** Standard Schema V1. */
  schema: SchemaType;
}
