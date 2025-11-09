import type { StandardSchemaV1 } from "@standard-schema/spec";

export type SchemaType<T = unknown> = StandardSchemaV1<T>;

export type InferSchemaInputType<T extends SchemaType> = StandardSchemaV1.InferInput<T>;

export type InferSchemaOutputType<T extends SchemaType> = StandardSchemaV1.InferOutput<T>;

export type SchemaResult<T = unknown> = StandardSchemaV1.Result<T>;
