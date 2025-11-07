import { transformOptionToArgument } from "../parse/parser-helpers.ts";
import { defaultValueAndIsOptional, stringifyValue } from "../utilities.ts";

import type { Option } from "../schemas/schema-types.ts";
import type { OptionMetadata } from "./metadata-types.ts";

export function getOptionsMetadata(options: Record<string, Option>): OptionMetadata[] {
  const outputMetadata: OptionMetadata[] = [];

  if (!options) {
    return outputMetadata;
  }

  for (const [optionName, option] of Object.entries(options)) {
    const aliases = option.aliases ?? [];
    const meta = option.meta ?? {};

    const { optional, defaultValue } = option._preparedType ?? defaultValueAndIsOptional(option.type);

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
      schema: option.type,
      hidden: meta.hidden ?? false,
    });
  }

  return outputMetadata;
}
