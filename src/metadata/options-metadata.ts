import { transformOptionToArgument } from "../parse/parser-utilities.ts";
import { defaultValueAndIsOptional } from "../utilities/schema-utilities.ts";
import { stringifyValue } from "../utilities/utilities.ts";

import type { Option } from "../types/definitions-types.ts";
import type { OptionMetadata } from "../types/metadata-types.ts";

export function getOptionsMetadata(optionsDefinition: Record<string, Option>): OptionMetadata[] {
  const outputMetadata: OptionMetadata[] = [];

  if (!optionsDefinition) {
    return outputMetadata;
  }

  for (const [optionName, option] of Object.entries(optionsDefinition)) {
    const aliases = option.aliases ?? [];
    const meta = option.meta ?? {};

    const { optional, defaultValue } = option._preparedType ?? defaultValueAndIsOptional(option.schema);

    outputMetadata.push({
      name: optionName,
      nameAsArg: transformOptionToArgument(optionName),
      aliases,
      aliasesAsArgs: aliases.map(alias => transformOptionToArgument(alias)),
      placeholder: meta.placeholder ?? "",
      description: meta.description ?? "",
      descriptionMarkdown: meta.descriptionMarkdown ?? "",
      optional: meta.optional ?? optional,
      example: meta.example ?? "",
      defaultValue,
      defaultValueAsString: meta.default ?? stringifyValue(defaultValue) ?? "",
      schema: option.schema,
      hidden: meta.hidden ?? false,
    });
  }

  return outputMetadata;
}
