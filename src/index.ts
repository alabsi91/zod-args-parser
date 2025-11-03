export { formatCliHelpMessage, formatSubcommandHelpMessage } from "./help-message/format-cli.ts";
export { printCliHelp, printSubcommandHelp } from "./help-message/print-help.ts";
export { helpMessageStyles } from "./help-message/styles.ts";

export { safeParse as parse, safeParseAsync as parseAsync } from "./parse/safe-parse.ts";

export { generateBashAutocompleteScript } from "./autocomplete-scripts/bash-autocomplete-script.ts";
export { generatePowerShellAutocompleteScript } from "./autocomplete-scripts/powershell-autocomplete-script.ts";
export { generateZshAutocompleteScript } from "./autocomplete-scripts/zsh-autocomplete-script.ts";

export { getArgumentsMetadata } from "./metadata/get-arguments-metadata.ts";
export { getCliMetadata } from "./metadata/get-cli-metadata.ts";
export { getOptionsMetadata } from "./metadata/get-options-metadata.ts";
export { getSubcommandsMetadata } from "./metadata/get-subcommands-metadata.ts";

export { generateMarkdown } from "./markdown/generate-markdown.ts";
export { createArguments, createCli, createOptions, createSubcommand } from "./schemas/create-schemas.ts";

export { coerce } from "./schemas/coerce.ts";

export type * from "./metadata/metadata-types.ts";
export type * from "./parse/context/context-types.ts";
export type * from "./types.ts";
