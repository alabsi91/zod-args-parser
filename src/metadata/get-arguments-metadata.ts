import { stringifyValue } from "../utilities.ts";
import { isOptionalSchema, schemaDefaultValue, schemaDescription } from "../zod-utilities.ts";

import type { Argument } from "../types.js";
import type { ArgumentMetadata } from "./metadata-types.js";

export function getArgumentsMetadata(arguments_: Argument[]): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const argument of arguments_) {
    const defaultValue = schemaDefaultValue(argument.type);

    outputMetadata.push({
      name: argument.name,
      description: argument.description ?? schemaDescription(argument.type) ?? "",
      defaultValue,
      defaultValueAsString: stringifyValue(defaultValue),
      optional: isOptionalSchema(argument.type),
      example: argument.example ?? "",
      type: argument.type,
    });
  }

  return outputMetadata;
}
