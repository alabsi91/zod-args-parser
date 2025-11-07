import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, createCli } from "../src/index.ts";
import { err, expectsSuccess, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  arguments: [
    {
      type: z.object({ value: z.string() }),
      coerce: coerce.string,
      meta: { name: "stringArg" },
    },
    {
      type: z.object({ value: z.number() }),
      coerce: coerce.number,
      meta: { name: "numberArg" },
    },
    {
      type: z.object({ value: z.boolean().optional() }),
      coerce: coerce.boolean,
      meta: { name: "booleanOptionalArg" },
    },
  ],
});

describe("[string, number, boolean?]".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it('["hello world", 123]'.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["hello world", "123"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [stringArg, numberArg, booleanOptionalArg] = result.value.arguments;

    assert.equal(
      stringArg,
      "hello world",
      err('Invalid value for argument `stringArg`. Expected `"hello world"`, but received:', stringArg),
    );

    assert.equal(
      numberArg,
      123,
      err("Invalid value for argument `numberArg`. Expected `123`, but received:", numberArg),
    );

    assert.equal(
      booleanOptionalArg,
      undefined,
      err("Invalid value for argument `booleanOptionalArg`. Expected `undefined`, but received:", booleanOptionalArg),
    );
  });

  it('["hello world", 123, true]'.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["hello world", "123", "true"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [stringArg, numberArg, booleanOptionalArg] = result.value.arguments;

    assert.equal(
      stringArg,
      "hello world",
      err('Invalid value for argument `stringArg`. Expected `"hello world"`, but received:', stringArg),
    );

    assert.equal(
      numberArg,
      123,
      err("Invalid value for argument `numberArg`. Expected `123`, but received:", numberArg),
    );

    assert(
      booleanOptionalArg,
      err("Invalid value for argument `booleanOptionalArg`. Expected `true`, but received:", booleanOptionalArg),
    );
  });
});
