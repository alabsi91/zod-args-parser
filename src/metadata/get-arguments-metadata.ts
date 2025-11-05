import { defaultValueAndIsOptional } from "../schemas/schema-utilities.ts";
import { generateOrdinalSuffix, stringifyValue } from "../utilities.ts";

import type { Argument } from "../schemas/schema-types.ts";
import type { ArgumentMetadata } from "./metadata-types.ts";

export function getArgumentsMetadata(arguments_: Argument[]): ArgumentMetadata[] {
  const outputMetadata: ArgumentMetadata[] = [];

  for (const argument of arguments_) {
    const meta = argument.meta ?? {};

    const { optional, defaultValue } = defaultValueAndIsOptional(argument.type.schema);

    outputMetadata.push({
      name: meta.name ?? generateOrdinalSuffix(outputMetadata.length) + " argument",
      description: meta.description ?? "",
      descriptionMarkdown: meta.descriptionMarkdown ?? "",
      defaultValue,
      defaultValueAsString: meta.default ?? stringifyValue(defaultValue) ?? "",
      optional: meta.optional ?? optional,
      example: meta.example ?? "",
      schema: argument.type.schema,
      hidden: meta.hidden ?? false,
    });
  }

  return outputMetadata;
}
