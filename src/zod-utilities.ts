import { ZodBoolean, ZodDefault, ZodEffects } from "zod/v3";
import { safeParse } from "zod/v4/core";

import type * as Z3 from "zod/v3";
import type * as Z4 from "zod/v4/core";
import type { Schema, SchemaV3, SchemaV4 } from "./types.ts";

function isV4Schema(schema: Schema): schema is SchemaV4 {
  return "_zod" in schema;
}

/** - Safe parse a value against a schema */
export function safeParseSchema(schema: Schema, value: unknown) {
  if (isV4Schema(schema)) {
    return safeParse(schema, value);
  }

  return schema.safeParse(value);
}

/** - Check if a schema is a boolean */
export function isBooleanSchema(schema: Schema): boolean {
  if (isV4Schema(schema)) {
    return isBooleanV4Schema(schema);
  }

  return isBooleanV3Schema(schema);
}

function isBooleanV4Schema(schema: SchemaV4): boolean {
  let schemaDefinition = schema._zod.def;

  while (schemaDefinition) {
    if (schemaDefinition.type === "boolean") {
      return true;
    }

    if (isV4SchemaDefinitionPipe(schemaDefinition)) {
      return isBooleanV4Schema(schemaDefinition.out);
    }

    if (!isV4SchemaDefinitionHasInnerType(schemaDefinition)) {
      return false;
    }

    schemaDefinition = schemaDefinition.innerType._zod.def;
  }

  return false;
}

function isBooleanV3Schema(schema: SchemaV3): boolean {
  let type = schema;

  while (type) {
    if (type instanceof ZodBoolean) {
      return true;
    }

    if (type instanceof ZodEffects) {
      return isBooleanV3Schema(type._def.schema as SchemaV3);
    }

    const definition = type._def as Z3.ZodTypeDef;

    if ("innerType" in definition) {
      type = definition.innerType as Z3.ZodTypeAny;
    }

    return false;
  }

  return false;
}

/** - Get the default value of a schema */
export function schemaDefaultValue(schema: Schema): unknown {
  if (isV4Schema(schema)) {
    return schemaV4DefaultValue(schema);
  }

  return schemaV3DefaultValue(schema);
}

function schemaV4DefaultValue(schema: SchemaV4): unknown {
  let schemaDefinition = schema._zod.def;

  while (schemaDefinition) {
    if (isSchemaDefinitionDefaultV4(schemaDefinition)) {
      return schemaDefinition.defaultValue;
    }

    if (isV4SchemaDefinitionPipe(schemaDefinition)) {
      return schemaV4DefaultValue(schemaDefinition.out);
    }

    if (!isV4SchemaDefinitionHasInnerType(schemaDefinition)) {
      return undefined;
    }

    schemaDefinition = schemaDefinition.innerType._zod.def;
  }

  return undefined;
}

function schemaV3DefaultValue(schema: SchemaV3): unknown {
  let type = schema;
  while (type) {
    if (type instanceof ZodDefault) {
      return type._def.defaultValue();
    }

    if (type instanceof ZodEffects) {
      return schemaV3DefaultValue(type._def.schema as SchemaV3);
    }

    const definition = type._def as Z3.ZodTypeDef;

    if ("innerType" in definition) {
      type = definition.innerType as Z3.ZodTypeAny;
    }

    return;
  }

  return;
}

/** - Get the description of a schema */
export function schemaDescription(schema: Schema): string | undefined {
  if (isV4Schema(schema)) {
    if (!("meta" in schema) || typeof schema.meta !== "function") {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const metaResult = schema.meta() as { description?: string } | undefined;

    if (!metaResult || typeof metaResult !== "object" || !("description" in metaResult)) {
      return;
    }

    return metaResult.description;
  }

  return schema.description;
}

/** - Check if a schema is optional */
export function isOptionalSchema(schema: Schema): schema is Z4.$ZodOptional {
  if (isV4Schema(schema)) {
    return schema._zod.def.type === "optional" || schema._zod.def.type === "default";
  }

  return schema.isOptional();
}

function isSchemaDefinitionDefaultV4(schemaDefinition: Z4.$ZodTypeDef): schemaDefinition is Z4.$ZodDefaultDef {
  return schemaDefinition.type === "default";
}

type SchemaWithInnerType =
  | Z4.$ZodDefaultDef
  | Z4.$ZodPrefaultDef
  | Z4.$ZodOptionalDef
  | Z4.$ZodNonOptionalDef
  | Z4.$ZodNullableDef
  | Z4.$ZodSuccessDef
  | Z4.$ZodCatchDef
  | Z4.$ZodReadonlyDef
  | Z4.$ZodPromiseDef;

function isV4SchemaDefinitionHasInnerType(schemaDefinition: Z4.$ZodTypeDef): schemaDefinition is SchemaWithInnerType {
  return new Set([
    "default",
    "prefault",
    "optional",
    "nonoptional",
    "nullable",
    "success",
    "catch",
    "readonly",
    "promise",
  ]).has(schemaDefinition.type);
}

function isV4SchemaDefinitionPipe(schemaDefinition: Z4.$ZodTypeDef): schemaDefinition is Z4.$ZodPipeDef {
  return schemaDefinition.type === "pipe";
}

/**
 * A preprocessing function for Zod that converts a string to an array of strings.
 *
 * @param stringValue - The string value given by zod.
 * @param separator - The separator to use when splitting the string. Defaults to ",".
 */
export function stringToArray(stringValue: string, separator: string = ","): string[] {
  return stringValue
    .split(separator)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * A preprocessing function for Zod that converts a string to a `Set` of strings.
 *
 * @param stringValue - The string value given by zod.
 * @param separator - The separator to use when splitting the string. Defaults to ",".
 */
export function stringToSet(stringValue: string, separator: string = ","): Set<string> {
  const maybeArray = stringToArray(stringValue, separator);
  return new Set(maybeArray);
}
