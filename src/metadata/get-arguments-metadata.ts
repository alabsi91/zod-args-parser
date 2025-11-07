import { defaultValueAndIsOptional, stringifyValue } from "../utilities.ts";

import type { Argument } from "../types/definitions-types.ts";
import type { ArgumentMetadata } from "../types/metadata-types.ts";

export function getArgumentsMetadata(argumentsDefinition: Argument[]): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const argument of argumentsDefinition) {
    const meta = argument.meta ?? {};

    const { optional, defaultValue } = argument._preparedType ?? defaultValueAndIsOptional(argument.type);

    outputMetadata.push({
      name: argument.name,
      description: meta.description ?? "",
      descriptionMarkdown: meta.descriptionMarkdown ?? "",
      defaultValue,
      defaultValueAsString: meta.default ?? stringifyValue(defaultValue) ?? "",
      optional: meta.optional ?? optional,
      example: meta.example ?? "",
      schema: argument.type,
      hidden: meta.hidden ?? false,
    });
  }

  return outputMetadata;
}
