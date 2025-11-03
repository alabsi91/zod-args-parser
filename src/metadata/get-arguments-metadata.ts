import { generateOrdinalSuffix, stringifyValue } from "../utilities.ts";

import type { Argument } from "../schemas/schema-types.ts";
import type { ArgumentMetadata } from "./metadata-types.ts";

export function getArgumentsMetadata(arguments_: Argument[]): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const argument of arguments_) {
    const defaultValue = argument.type.defaultValue;
    const meta = argument.meta ?? {};

    outputMetadata.push({
      name: meta.name ?? generateOrdinalSuffix(outputMetadata.length) + " argument",
      description: meta.description ?? "",
      descriptionMarkdown: meta.descriptionMarkdown ?? "",
      defaultValue,
      defaultValueAsString: meta.default ?? stringifyValue(defaultValue) ?? "",
      optional: meta.optional ?? argument.type.isOptional,
      example: meta.example ?? "",
      schema: argument.type.schema,
      hidden: meta.hidden ?? false,
    });
  }

  return outputMetadata;
}
