import { generateOrdinalSuffix } from "../../utilities.ts";

import type { Cli, Subcommand } from "../../schemas/schema-types.ts";
import type { ContextWide } from "./context-types.ts";
import type { InputTypeWide } from "../../types.ts";

/** @throws {Error} */
export function createExecuteContext(inputValues: InputTypeWide, schema: Subcommand | Cli) {
  const context: ContextWide = {
    subcommand: "cliName" in schema ? undefined : schema.name,
  };

  if (schema.options) {
    for (const [optionName, schemaOptions] of Object.entries(schema.options)) {
      const optionType = schemaOptions.type;

      // Case the value is passed
      if (inputValues.options && optionName in inputValues.options) {
        const passedOptionValue = inputValues.options[optionName];

        context.options ??= {};
        context.options[optionName] =
          passedOptionValue === undefined
            ? { name: optionName, schema: optionType.schema, source: "default" }
            : { name: optionName, schema: optionType.schema, passedValue: passedOptionValue, source: "programmatic" };

        continue;
      }

      // case the value is not passed
      if (!optionType.isOptional) {
        throw new Error(`Option "${optionName}" is required`);
      }

      // case the value is optional
      context.options ??= {};
      context.options[optionName] = { name: optionName, schema: optionType.schema, source: "default" };
    }
  }

  if (schema.arguments) {
    for (let index = 0; index < schema.arguments.length; index++) {
      const schemaArgument = schema.arguments[index];
      const passedArgumentValue = inputValues.arguments?.[index];

      // case the value is passed
      if (passedArgumentValue) {
        context.arguments ??= [];
        context.arguments[index] =
          passedArgumentValue === undefined
            ? { schema: schemaArgument.type.schema, source: "default" }
            : { schema: schemaArgument.type.schema, passedValue: passedArgumentValue, source: "programmatic" };

        continue;
      }

      // case the value is not passed
      if (!schemaArgument.type.isOptional) {
        throw new Error(`The ${generateOrdinalSuffix(index)} argument is required: ${schemaArgument.meta?.name ?? ""}`);
      }

      // case the value is optional
      context.arguments ??= [];
      context.arguments[index] = { schema: schemaArgument.type.schema, source: "default" };
    }
  }

  if (schema.allowPositionals) {
    context.positionals ??= inputValues.positionals;
  }

  return context;
}
