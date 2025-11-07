import type { StandardSchemaV1 } from "@standard-schema/spec";

export type SchemaType<T = unknown> = StandardSchemaV1<{ value?: T }>;

export type InferSchemaInputType<T extends SchemaType> = StandardSchemaV1.InferInput<T>["value"];

export type InferSchemaOutputType<T extends SchemaType> = StandardSchemaV1.InferOutput<T>["value"];

export type SchemaResult<T = unknown> = StandardSchemaV1.Result<{ value?: T }>;
