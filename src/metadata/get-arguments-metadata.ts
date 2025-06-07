import { getDefaultValueFromSchema } from "../utils.js";

import type { Argument, ArgumentMetadata } from "../types.js";

export function getArgumentsMetadata(args: Argument[]): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const arg of args) {
    const defaultValue = getDefaultValueFromSchema(arg.type);

    outputMetadata.push({
      name: arg.name,
      description: arg.description ?? arg.type.description ?? "",
      defaultValue,
      defaultValueAsString: JSON.stringify(defaultValue),
      optional: arg.type.isOptional(),
      example: arg.example ?? "",
      type: arg.type,
    });
  }

  return outputMetadata;
}
