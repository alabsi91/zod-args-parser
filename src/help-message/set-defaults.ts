import { helpMessageStyles } from "./styles.ts";

import type { PrintHelpOptions } from "../types/help-message-types.ts";
import type { FormatOptions } from "./format-cli.ts";

export function setPrintHelpOptionsDefaults(options: PrintHelpOptions) {
  const clone = { ...options };

  clone.style ??= helpMessageStyles.default;
  clone.markdownRenderer ??= "terminal";
  clone.kebabCaseArgumentName ??= true;

  clone.indentBeforeName ??= 2;
  clone.indentAfterName ??= 4;
  clone.indentBeforePlaceholder ??= 1;
  clone.newLineIndent ??= 0;

  clone.emptyLines ??= 0;
  clone.emptyLinesBeforeTitle ??= 1;
  clone.emptyLinesAfterTitle ??= 0;

  clone.exampleKeyword ??= "Example";
  clone.optionalKeyword ??= "(optional)";
  clone.defaultKeyword ??= "(default: {{ value }})";

  clone.usageTitle ??= "USAGE";
  clone.descriptionTitle ??= "DESCRIPTION";
  clone.commandsTitle ??= "COMMANDS";
  clone.optionsTitle ??= "OPTIONS";
  clone.argumentsTitle ??= "ARGUMENTS";
  clone.exampleTitle ??= "EXAMPLE";

  return clone as Required<FormatOptions>;
}
