import type { Argument, Option, Prettify, Schema, Subcommand, ToOptional, ZodInferOutput } from "../../types.js";
import type { ParseResult } from "../parse/parse-types.js";

type OptionsArray2RecordType<T extends Option[] | undefined> = T extends Option[]
  ? ToOptional<{ [K in T[number]["name"]]: ZodInferOutput<Extract<T[number], { name: K }>["type"]> }>
  : object;

type ArgumentsArray2ArrayType<T extends Argument[] | undefined> = T extends Argument[]
  ? { [K in keyof T]: T[K] extends { type: Schema } ? ZodInferOutput<T[K]["type"]> : never }
  : never;

export type ValidateResult<S extends Partial<Subcommand>[]> = {
  [K in keyof S]: Prettify<{
    subcommand: S[K]["name"] extends string ? S[K]["name"] : undefined;
    arguments: ArgumentsArray2ArrayType<S[K]["arguments"]>;
    positional: S[K]["allowPositional"] extends true ? string[] : never;
    options: S[K]["options"] extends Option[] ? OptionsArray2RecordType<S[K]["options"]> : never;
    ctx: ParseResult<S>;
  }>;
}[number];
