import { validateSync } from "../../../utilities.ts";
import { validateConflictWith } from "./conflict.ts";
import { validateExclusive } from "./exclusive.ts";
import { validateRequires } from "./requires.ts";

import type { ContextWide } from "../../../types/context-types.ts";
import type { Cli, Subcommand } from "../../../types/definitions-types.ts";
import type { OutputTypeWide } from "../../../types/io-types.ts";

interface ValidateOptions {
  commandDefinition: Subcommand | Cli;
  context: ContextWide;
  output: OutputTypeWide;
}

/** @throws {Error} */
export function validateOptions({ commandDefinition, context, output }: ValidateOptions) {
  if (!context.options) return;

  output.options ??= {};

  const optionsDefinition = commandDefinition.options;
  if (!optionsDefinition) {
    throw new Error(`subcommand "${context.subcommand}" does not have options`);
  }

  for (const [optionName, option] of Object.entries(optionsDefinition)) {
    validateRequires({ name: optionName, commandDefinition, optionOrArgument: option, context, type: "option" });
    validateExclusive({ name: optionName, optionOrArgument: option, context, type: "option" });
    validateConflictWith({ name: optionName, optionOrArgument: option, context, type: "option" });
  }

  const optionContextEntries = Object.entries(context.options);

  for (const [optionName, { passedValue, stringValue, flag, source, schema }] of optionContextEntries) {
    const option = optionsDefinition[optionName];
    if (!option) {
      throw new Error(`subcommand "${context.subcommand}" does not have option "${optionName}"`);
    }

    if (!option._preparedType) {
      throw new Error(`internal error: missing prepared type for option "${optionName}"`);
    }

    const isProgrammatic = source === "programmatic";

    const safeParseResult = isProgrammatic
      ? validateSync(schema, passedValue)
      : option._preparedType.validate(stringValue);

    if (safeParseResult.issues) {
      throw new Error(
        `invalid value ${isProgrammatic ? "" : `"${stringValue}"`} for "${isProgrammatic ? optionName : flag}": ${safeParseResult.issues.map(issue => issue.message).join(", ")}`,
      );
    }

    output.options[optionName] = safeParseResult.value;
  }
}
