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

export { createCli } from "./schemas/create-cli-schema.ts";
export { createSubcommand } from "./schemas/create-subcommand-schema.ts";
export { createOptions } from "./schemas/create-options-schema.ts";
export { createArguments } from "./schemas/create-arguments-schema.ts";

export { coerce } from "./schemas/coerce.ts";

export type * from "./metadata/metadata-types.ts";
export type * from "./parse/context-types.ts";
export type * from "./types.ts";
export type * from "@standard-schema/spec";
