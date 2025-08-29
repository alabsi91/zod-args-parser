import { isOptionalSchema, schemaDefaultValue, schemaDescription } from "../zodUtils.js";

import type { Argument, ArgumentMetadata } from "../types.js";

export function getArgumentsMetadata(args: Argument[]): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const arg of args) {
    const defaultValue = schemaDefaultValue(arg.type);

    outputMetadata.push({
      name: arg.name,
      description: arg.description ?? schemaDescription(arg.type) ?? "",
      defaultValue,
      defaultValueAsString: JSON.stringify(defaultValue),
      optional: isOptionalSchema(arg.type),
      example: arg.example ?? "",
      type: arg.type,
    });
  }

  return outputMetadata;
}
