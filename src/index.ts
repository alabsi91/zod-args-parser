export { formatCliHelpMessage, formatSubcommandHelpMessage } from "./help-message/format-cli.ts";
export { printCliHelp, printSubcommandHelp } from "./help-message/print-help.ts";
export { helpMessageStyles } from "./help-message/styles.ts";

export { generateBashAutocompleteScript } from "./autocomplete-scripts/bash-autocomplete-script.ts";
export { generatePowerShellAutocompleteScript } from "./autocomplete-scripts/powershell-autocomplete-script.ts";
export { generateZshAutocompleteScript } from "./autocomplete-scripts/zsh-autocomplete-script.ts";
export { generateMarkdown } from "./markdown/generate-markdown.ts";

export { getArgumentsMetadata } from "./metadata/arguments-metadata.ts";
export { getCliMetadata } from "./metadata/cli-metadata.ts";
export { getOptionsMetadata } from "./metadata/options-metadata.ts";
export { getSubcommandsMetadata } from "./metadata/subcommands-metadata.ts";

export { defineArguments } from "./definitions/define-arguments.ts";
export { defineCLI } from "./definitions/define-cli.ts";
export { defineOptions } from "./definitions/define-options.ts";
export { defineSubcommand } from "./definitions/define-subcommand.ts";

export { coerce } from "./coerce/coerce-methods.ts";

export type { ContextWide } from "./types/context-types.ts";
export type { Argument, Cli, Option, Subcommand } from "./types/definitions-types.ts";
export type {
  InferArgumentsInputType,
  InferArgumentsOutputType,
  InferInputType,
  inferOptionsInputType,
  InferOptionsOutputType,
  InferOutputType,
} from "./types/io-types.ts";
export type { ArgumentMetadata, OptionMetadata, SubcommandMetadata } from "./types/metadata-types.ts";
