import type { StandardSchemaV1 } from "@standard-schema/spec";

/** @throws */
export function validateSync(schema: StandardSchemaV1, value?: unknown) {
  const results = schema["~standard"].validate(value);
  if (results instanceof Promise) {
    throw new TypeError("async schema validation not supported");
  }

  return results;
}

// async function validateAsync(schema: StandardSchemaV1, value: unknown) {
//   return await schema["~standard"].validate(value);
// }

export function defaultValueAndIsOptional(schema: StandardSchemaV1): { defaultValue: unknown; isOptional: boolean } {
  const results = validateSync(schema);

  if (results.issues) {
    return { defaultValue: undefined, isOptional: false };
  }

  return { defaultValue: results.value, isOptional: true };
}
