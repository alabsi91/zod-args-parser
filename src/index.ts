export { formatCliHelpMessage, formatSubcommandHelpMessage } from "./help-message/format-cli.ts";
export { printCliHelp, printSubcommandHelp } from "./help-message/print-help.ts";
export { helpMessageStyles } from "./help-message/styles.ts";

export { generateMarkdown } from "./markdown/generate-markdown.ts";
export { generateBashAutocompleteScript } from "./autocomplete-scripts/bash-autocomplete-script.ts";
export { generatePowerShellAutocompleteScript } from "./autocomplete-scripts/powershell-autocomplete-script.ts";
export { generateZshAutocompleteScript } from "./autocomplete-scripts/zsh-autocomplete-script.ts";

export { getArgumentsMetadata } from "./metadata/get-arguments-metadata.ts";
export { getCliMetadata } from "./metadata/get-cli-metadata.ts";
export { getOptionsMetadata } from "./metadata/get-options-metadata.ts";
export { getSubcommandsMetadata } from "./metadata/get-subcommands-metadata.ts";

export { defineCLI } from "./definitions/define-cli.ts";
export { defineSubcommand } from "./definitions/define-subcommand.ts";
export { defineOptions } from "./definitions/define-options.ts";
export { defineArguments } from "./definitions/define-arguments.ts";

export { coerce } from "./coerce/coerce-methods.ts";

export type * from "./types/metadata-types.ts";
export type * from "./types/context-types.ts";
export type * from "./types/types.ts";
export type * from "./types/io-types.ts";
export type * from "@standard-schema/spec";
