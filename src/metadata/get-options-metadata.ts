import { getDefaultValueFromSchema, transformOptionToArg } from "../utils.js";

import type { Option, OptionMetadata } from "../types.js";

export function getOptionsMetadata(options: Option[]): OptionMetadata[] {
  const outputMetadata: OptionMetadata[] = [];

  if (!options || !options.length) return outputMetadata;

  for (const option of options) {
    const defaultValue = getDefaultValueFromSchema(option.type);
    const aliases = option.aliases ?? [];

    outputMetadata.push({
      name: option.name,
      nameAsArg: transformOptionToArg(option.name),
      aliases,
      aliasesAsArgs: aliases.map(transformOptionToArg),
      placeholder: option.placeholder ?? "",
      description: option.description ?? option.type.description ?? "",
      optional: option.type.isOptional(),
      example: option.example ?? "",
      defaultValue,
      defaultValueAsString: JSON.stringify(defaultValue),
      type: option.type,
    });
  }

  return outputMetadata;
}
