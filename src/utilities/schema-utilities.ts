import { CliError, ErrorCause, ValidationErrorCode } from "./cli-error.ts";

import type { Argument, Option, PreparedType } from "../types/definitions-types.ts";
import type { SchemaResult, SchemaType } from "../types/schema-types.ts";
import type { CoerceMethod } from "../types/types.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/** @throws {CliError} When schema is async */
export function validateSync(schema: SchemaType, value?: unknown): SchemaResult {
  const results = schema["~standard"].validate(value);
  if (results instanceof Promise) {
    throw new CliError({
      cause: ErrorCause.Validation,
      code: ValidationErrorCode.AsyncSchemaNotSupported,
      context: { schema, value },
    });
  }

  return results;
}

/** @throws {CliError} When schema is async */
export function defaultValueAndIsOptional(schema: SchemaType): { defaultValue: unknown; optional: boolean } {
  const results = validateSync(schema);

  if (results.issues) {
    return { defaultValue: undefined, optional: false };
  }

  return { defaultValue: results.value, optional: true };
}

/** @throws {CliError} When schema is async */
function PrepareType(schema: SchemaType, coerceHandler: CoerceMethod<unknown>): PreparedType {
  const { optional, defaultValue } = defaultValueAndIsOptional(schema);

  return {
    schema,
    optional,
    defaultValue,
    coerceTo: coerceHandler.type,
    validate: (value?: string) => validateSync(schema, value && coerceHandler(value)),
  };
}

/** @throws {CliError} When schema is async */
export function prepareDefinitionTypes(definition: Record<string, Argument> | Record<string, Option> | undefined) {
  if (!definition) return;

  for (const object of Object.values<Argument | Option>(definition)) {
    if (!object.coerce) {
      (object.coerce as CoerceMethod<string> | undefined) = (value: string) => value;
    }

    if (!object._preparedType) {
      object._preparedType = PrepareType(object.schema, object.coerce!);
    }
  }
}

/** Prettify Standard Schema V1 issues */
export function prettifyError(issues: ReadonlyArray<StandardSchemaV1.Issue>): string {
  return issues
    .map(issue => {
      const path = issue.path?.map(seg => (typeof seg === "object" && "key" in seg ? seg.key : seg));
      const pathString = path && path.length > 0 ? ` at "${path.join(".")}"` : "";
      return `${issue.message}${pathString}`;
    })
    .join(" : ");
}
