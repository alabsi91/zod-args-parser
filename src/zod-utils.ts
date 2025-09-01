import * as Z3 from "zod/v3";
import * as Z4 from "zod/v4/core";

import type { Schema, SchemaV3, SchemaV4 } from "./types.js";

function isV4Schema(schema: Schema): schema is SchemaV4 {
  return "_zod" in schema;
}

/** - Safe parse a value against a schema */
export function safeParseSchema(schema: Schema, value: unknown) {
  if (isV4Schema(schema)) {
    return Z4.safeParse(schema, value);
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
  let def = schema._zod.def;

  while (def) {
    if (def.type === "boolean") {
      return true;
    }

    if (isLiteralV4Def(def)) {
      return def.values.includes(true) || def.values.includes(false);
    }

    if (!isV4DefWithInnerType(def)) {
      return false;
    }

    def = def.innerType._zod.def;
  }

  return false;
}

function isBooleanV3Schema(schema: SchemaV3): boolean {
  let type = schema;
  while (type) {
    if (type instanceof Z3.ZodBoolean) {
      return true;
    }

    if (type instanceof Z3.ZodLiteral) {
      return type.value === true || type.value === false;
    }

    type = type._def.innerType;
  }

  return false;
}

/** - Get the default value of a schema */
export function schemaDefaultValue(schema: Schema): unknown | undefined {
  if (isV4Schema(schema)) {
    return schemaV4DefaultValue(schema);
  }

  return schemaV3DefaultValue(schema);
}

function schemaV4DefaultValue(schema: SchemaV4): unknown | undefined {
  let def = schema._zod.def;

  while (def) {
    if (isDefaultV4Def(def)) return def.defaultValue;
    if (!isV4DefWithInnerType(def)) return undefined;
    def = def.innerType._zod.def;
  }

  return undefined;
}

function schemaV3DefaultValue(schema: SchemaV3): unknown | undefined {
  let type = schema;
  while (type) {
    if (type instanceof Z3.ZodDefault) {
      const defaultValue = type._def.defaultValue();
      return defaultValue;
    }

    type = type._def.innerType;
  }

  return undefined;
}

/** - Get the description of a schema */
export function schemaDescription(schema: Schema): string | undefined {
  if (isV4Schema(schema)) {
    if (!("meta" in schema) || typeof schema.meta !== "function") return;
    return schema.meta()?.description;
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

function isDefaultV4Def(def: Z4.$ZodTypeDef): def is Z4.$ZodDefaultDef {
  return def.type === "default";
}

function isLiteralV4Def(def: Z4.$ZodTypeDef): def is Z4.$ZodLiteralDef<any> {
  return def.type === "literal";
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

function isV4DefWithInnerType(def: Z4.$ZodTypeDef): def is SchemaWithInnerType {
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
  ]).has(def.type);
}
