import { transformOptionToArgument } from "../parse/context/parser-helpers.ts";
import { stringifyValue } from "../utilities.ts";

import type { Option } from "../schemas/schema-types.ts";
import type { OptionMetadata } from "./metadata-types.ts";

export function getOptionsMetadata(options: Record<string, Option>): OptionMetadata[] {
  const outputMetadata: OptionMetadata[] = [];

  if (!options) {
    return outputMetadata;
  }

  for (const [optionName, option] of Object.entries(options)) {
    const defaultValue = option.type.defaultValue;
    const aliases = option.aliases ?? [];
    const meta = option.meta ?? {};

    outputMetadata.push({
      name: optionName,
      nameAsArg: transformOptionToArgument(optionName),
      aliases,
      aliasesAsArgs: aliases.map(alias => transformOptionToArgument(alias)),
      placeholder: meta.placeholder ?? "",
      description: meta.description ?? "",
      descriptionMarkdown: meta.descriptionMarkdown ?? "",
      optional: meta.optional ?? option.type.isOptional,
      example: meta.example ?? "",
      defaultValue,
      defaultValueAsString: meta.default ?? stringifyValue(defaultValue) ?? "",
      schema: option.type.schema,
      hidden: meta.hidden ?? false,
    });
  }

  return outputMetadata;
}
