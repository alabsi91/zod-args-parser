import { transformOptionToArg } from "../parser/parse/parser-helpers.js";
import { stringifyValue } from "../utils.js";
import { isOptionalSchema, schemaDefaultValue, schemaDescription } from "../zod-utils.js";

import type { Option } from "../types.js";
import type { OptionMetadata } from "./metadata-types.js";

export function getOptionsMetadata(options: Option[]): OptionMetadata[] {
  const outputMetadata: OptionMetadata[] = [];

  if (!options || !options.length) return outputMetadata;

  for (const option of options) {
    const defaultValue = schemaDefaultValue(option.type);
    const aliases = option.aliases ?? [];

    outputMetadata.push({
      name: option.name,
      nameAsArg: transformOptionToArg(option.name),
      aliases,
      aliasesAsArgs: aliases.map(transformOptionToArg),
      placeholder: option.placeholder ?? "",
      description: option.description ?? schemaDescription(option.type) ?? "",
      optional: isOptionalSchema(option.type),
      example: option.example ?? "",
      defaultValue,
      defaultValueAsString: stringifyValue(defaultValue),
      type: option.type,
    });
  }

  return outputMetadata;
}
