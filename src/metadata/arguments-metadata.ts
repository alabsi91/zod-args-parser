import { defaultValueAndIsOptional, stringifyValue } from "../utilities.ts";

import type { Argument } from "../types/definitions-types.ts";
import type { ArgumentMetadata } from "../types/metadata-types.ts";

export function getArgumentsMetadata(argumentsDefinition: Record<string, Argument>): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const [name, argument] of Object.entries(argumentsDefinition)) {
    const meta = argument.meta ?? {};

    const { optional, defaultValue } = argument._preparedType ?? defaultValueAndIsOptional(argument.schema);

    outputMetadata.push({
      name: meta.name ?? name,
      description: meta.description ?? "",
      descriptionMarkdown: meta.descriptionMarkdown ?? "",
      defaultValue,
      defaultValueAsString: meta.default ?? stringifyValue(defaultValue) ?? "",
      optional: meta.optional ?? optional,
      example: meta.example ?? "",
      schema: argument.schema,
      hidden: meta.hidden ?? false,
    });
  }

  return outputMetadata;
}
