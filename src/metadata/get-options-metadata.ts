import { transformOptionToArgument } from "../parser/parse/parser-helpers.js";
import { stringifyValue } from "../utilities.js";
import { isOptionalSchema, schemaDefaultValue, schemaDescription } from "../zod-utilities.js";

import type { Option } from "../types.js";
import type { OptionMetadata } from "./metadata-types.js";

export function getOptionsMetadata(options: Option[]): OptionMetadata[] {
  const outputMetadata: OptionMetadata[] = [];

  if (!options || options.length === 0) {
    return outputMetadata;
  }

  for (const option of options) {
    const defaultValue = schemaDefaultValue(option.type);
    const aliases = option.aliases ?? [];

    outputMetadata.push({
      name: option.name,
      nameAsArg: transformOptionToArgument(option.name),
      aliases,
      aliasesAsArgs: aliases.map(alias => transformOptionToArgument(alias)),
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
