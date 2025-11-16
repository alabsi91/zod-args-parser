import { DefinitionErrorCode } from "../error-code/definition-error-code.ts";

import type { CliErrorOptionByCause } from "../../types/error-types.ts";

export function definitionErrorMessage({ code, context }: CliErrorOptionByCause<"Definition">) {
  if (code === DefinitionErrorCode.MissingDefinitionName) {
    const propertyName = context.commandKind === "command" ? "cliName" : "name";
    return `invalid ${context.commandKind} definition: "${propertyName}" property is required.`;
  }

  if (code === DefinitionErrorCode.EmptyDefinitionGroup) {
    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `"${context.kind}" property is optional but cannot be empty.`
    );
  }

  if (code === DefinitionErrorCode.MissingSchema) {
    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the ${context.kind} "${context.name}" is missing the "schema" property.`
    );
  }

  if (code === DefinitionErrorCode.InvalidDefinitionOptionName) {
    if (context.negatedAliasName) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the option "${context.optionName}" has the alias "${context.negatedAliasName}" which cannot be named as a negated option.`
      );
    }

    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the option "${context.optionName}" cannot be named as a negated option.`
    );
  }

  if (code === DefinitionErrorCode.InvalidDefinitionArgumentName) {
    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the argument "${context.name}" cannot be a number..`
    );
  }

  if (code === DefinitionErrorCode.DuplicateDefinitionName) {
    const foundIn = context.foundInName
      ? `conflict with the ${context.foundInKind} "${context.foundInName}" alias name`
      : `conflict with other ${context.foundInKind} name`;

    if (context.duplicatedAlias) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the ${context.kind} "${context.name}" has the alias "${context.duplicatedAlias}" which ${foundIn}.`
      );
    }

    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the ${context.kind} "${context.name}" name ${foundIn}.`
    );
  }

  if (code === DefinitionErrorCode.EmptyStringAliasName) {
    if (context.optionName) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the option "${context.optionName}" has an empty string alias name.`
      );
    }

    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` + `empty string alias name is not allowed.`
    );
  }

  if (code === DefinitionErrorCode.SelfRequire) {
    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the ${context.kind} "${context.name}" cannot require itself.`
    );
  }

  if (code === DefinitionErrorCode.UnknownRequireName) {
    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the ${context.kind} "${context.name}" requires a non-existent name "${context.requiredName}".`
    );
  }

  if (code === DefinitionErrorCode.SelfConflict) {
    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the ${context.kind} "${context.name}" cannot conflict with itself.`
    );
  }

  if (code === DefinitionErrorCode.UnknownConflictName) {
    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the ${context.kind} "${context.name}" conflicts with a non-existent name "${context.requiredName}".`
    );
  }

  if (code === DefinitionErrorCode.DefinitionRequiresConflictOverlap) {
    const s = context.intersectedNames.length > 1 ? "s" : "";
    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the ${context.kind} "${context.name}" has overlapping 'requires' and 'conflictsWith' name${s}: ` +
      context.intersectedNames.join(", ")
    );
  }

  if (code === DefinitionErrorCode.InvalidOptionalArgumentDefinition) {
    if (context.allowPositionals) {
      return (
        `invalid ${context.commandKind} definition "${context.commandName}": ` +
        `the argument "${context.name}" cannot be optional when "allowPositionals" is enabled.`
      );
    }

    return (
      `invalid ${context.commandKind} definition "${context.commandName}": ` +
      `the argument "${context.name}" cannot be optional unless it is the last argument.`
    );
  }

  if (code === DefinitionErrorCode.MissingOnExecute) {
    return (
      `trying to execute ${context.commandKind} "${context.commandName}" ` +
      `which does not have an "onExecute" handler.`
    );
  }

  if (code === DefinitionErrorCode.SubcommandHelpNotFound) {
    return (
      `cannot generate help message for subcommand "${context.subcommandName}" ` +
      `because it does not exist in CLI "${context.cliName}".`
    );
  }

  const executiveCheck: never = code;
  return executiveCheck;
}
