import { generateOrdinalSuffix } from "../utilities.ts";

import type { Cli, Subcommand } from "../schemas/schema-types.ts";
import type { InputTypeWide } from "../types.ts";
import type { ContextWide } from "./context-types.ts";

/** @throws {Error} */
export function createExecuteContext(inputValues: InputTypeWide, inputSchema: Subcommand | Cli) {
  const context: ContextWide = {
    subcommand: "cliName" in inputSchema ? undefined : inputSchema.name,
  };

  if (inputSchema.options) {
    for (const [optionName, schemaOptions] of Object.entries(inputSchema.options)) {
      if (!schemaOptions._preparedType) {
        throw new Error(`internal error: missing prepared type for option "${optionName}"`);
      }

      const { schema, optional, defaultValue } = schemaOptions._preparedType;

      // Case the value is passed
      if (inputValues.options && optionName in inputValues.options) {
        const passedValue = inputValues.options[optionName];

        context.options ??= {};
        context.options[optionName] =
          passedValue === undefined
            ? { name: optionName, schema, optional, defaultValue, source: "default" }
            : { name: optionName, schema, optional, defaultValue, passedValue, source: "programmatic" };

        continue;
      }

      // case the value is not passed
      if (!optional) {
        throw new Error(`Option "${optionName}" is required`);
      }

      // case the value is optional
      context.options ??= {};
      context.options[optionName] = { name: optionName, schema, optional, defaultValue, source: "default" };
    }
  }

  if (inputSchema.arguments) {
    for (let index = 0; index < inputSchema.arguments.length; index++) {
      const schemaArgument = inputSchema.arguments[index];

      if (!schemaArgument._preparedType) {
        throw new Error(`internal error: missing prepared type for argument "${schemaArgument.meta?.name ?? ""}"`);
      }

      const passedValue = inputValues.arguments?.[index];

      const { schema, optional, defaultValue } = schemaArgument._preparedType;

      // case the value is passed
      if (passedValue) {
        context.arguments ??= [];
        context.arguments[index] =
          passedValue === undefined
            ? { schema, optional, defaultValue, source: "default" }
            : { schema, optional, defaultValue, passedValue, source: "programmatic" };

        continue;
      }

      // case the value is not passed
      if (!optional) {
        throw new Error(`The ${generateOrdinalSuffix(index)} argument is required: ${schemaArgument.meta?.name ?? ""}`);
      }

      // case the value is optional
      context.arguments ??= [];
      context.arguments[index] = { schema, optional, defaultValue, source: "default" };
    }
  }

  if (inputSchema.allowPositionals) {
    context.positionals ??= inputValues.positionals;
  }

  return context;
}
