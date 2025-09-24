import { stringifyValue } from "src/utils.js";
import { isOptionalSchema, schemaDefaultValue, schemaDescription } from "../zod-utils.js";

import type { Argument } from "../types.js";
import type { ArgumentMetadata } from "./metadata-types.js";

export function getArgumentsMetadata(args: Argument[]): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const arg of args) {
    const defaultValue = schemaDefaultValue(arg.type);

    outputMetadata.push({
      name: arg.name,
      description: arg.description ?? schemaDescription(arg.type) ?? "",
      defaultValue,
      defaultValueAsString: stringifyValue(defaultValue),
      optional: isOptionalSchema(arg.type),
      example: arg.example ?? "",
      type: arg.type,
    });
  }

  return outputMetadata;
}
