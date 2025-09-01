import type { Schema } from "../types.js";

export interface CliMetadata {
  /** The name of the cli program. */
  readonly name: string;

  /** - The description of the cli program. Empty string if not provided */
  readonly description: string;

  /** - The usage of the cli program. Empty string if not provided */
  readonly usage: string;

  /** - The example of the cli program. Empty string if not provided */
  readonly example: string;

  /** - Whether the cli program allows positional arguments. */
  readonly allowPositional: boolean;

  /** - The options of the cli program. Empty array if not provided */
  readonly options: OptionMetadata[];

  /** - The arguments of the cli program. Empty array if not provided */
  readonly arguments: ArgumentMetadata[];

  /** - The subcommands of the cli program. Empty array if not provided */
  readonly subcommands: SubcommandMetadata[];
}

export interface SubcommandMetadata {
  /** The subcommand name. */
  readonly name: string;

  /** - The aliases of the subcommand. Empty array if not provided */
  readonly aliases: string[];

  /** - The description of the subcommand. Empty string if not provided */
  readonly description: string;

  /** - The placeholder of the subcommand. Empty string if not provided */
  readonly placeholder: string;

  /** - The usage of the subcommand. Empty string if not provided */
  readonly usage: string;

  /** - The example of the subcommand. Empty string if not provided */
  readonly example: string;

  /** - Whether the subcommand allows positional arguments. */
  readonly allowPositional: boolean;

  /** - The options of the subcommand. Empty array if not provided */
  readonly options: OptionMetadata[];

  /** - The arguments of the subcommand. Empty array if not provided */
  readonly arguments: ArgumentMetadata[];
}

export interface OptionMetadata {
  /** The option name in camelCase. E.g. `optionName` */
  readonly name: string;

  /** The option name in kebab-case. E.g. `--option-name` */
  readonly nameAsArg: string;

  /** - The aliases of the option in camelCase. Empty array if not provided. E.g. `[aliasName, ...]` */
  readonly aliases: string[];

  /** - The aliases of the option in kebab-case. Empty array if not provided. E.g. `[--alias-name, ...]` */
  readonly aliasesAsArgs: string[];

  /** - The description of the option. Empty string if not provided */
  readonly description: string;

  /** - The placeholder of the option. Empty string if not provided */
  readonly placeholder: string;

  /** - The example of the option. Empty string if not provided */
  readonly example: string;

  /** - The default value of the option. */
  readonly defaultValue: unknown;

  /** - The default value of the option as string. */
  readonly defaultValueAsString: string;

  /** - Whether the option is optional. */
  readonly optional: boolean;

  /** - The zod type of the option. */
  readonly type: Schema;
}

export interface ArgumentMetadata {
  /** The argument name. */
  readonly name: string;

  /** - The description of the argument. Empty string if not provided */
  readonly description: string;

  /** - The example of the argument. Empty string if not provided */
  readonly example: string;

  /** - The default value of the argument. */
  readonly defaultValue: unknown;

  /** - The default value of the argument as string. */
  readonly defaultValueAsString: string;

  /** - Whether the argument is optional. */
  readonly optional: boolean;

  /** - The zod type of the argument. */
  readonly type: Schema;
}
