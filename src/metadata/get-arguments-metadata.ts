import { generateOrdinalSuffix, stringifyValue } from "../utilities.js";
import { isOptionalSchema, schemaDefaultValue } from "../zod-utilities.js";

import type { Argument } from "../types.js";
import type { ArgumentMetadata } from "./metadata-types.js";

export function getArgumentsMetadata(arguments_: Argument[]): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const argument of arguments_) {
    const defaultValue = schemaDefaultValue(argument.type);
    const meta = argument.meta ?? {};

    outputMetadata.push({
      name: meta.name ?? generateOrdinalSuffix(outputMetadata.length) + " argument",
      description: meta.description ?? "",
      defaultValue,
      defaultValueAsString: meta.default ?? stringifyValue(defaultValue) ?? "",
      optional: meta.optional ?? isOptionalSchema(argument.type),
      example: meta.example ?? "",
      type: argument.type,
    });
  }

  return outputMetadata;
}
