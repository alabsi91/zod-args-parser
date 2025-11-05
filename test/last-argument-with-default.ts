import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, createCli, parse } from "../src/index.ts";
import { err, expectsSuccess, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  arguments: [
    {
      type: coerce.string(z.string()),
      meta: { name: "stringArg" },
    },
    {
      type: coerce.number(z.number()),
      meta: { name: "numberArg" },
    },
    {
      type: coerce.boolean(z.boolean().default(true)),
      meta: { name: "booleanDefaultArg" },
    },
  ],
});

describe("[string, number, boolean=true]".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it('["hello world", 123]'.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = parse(["hello world", "123"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [stringArg, numberArg, booleanDefaultArg] = result.data.arguments;

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
      booleanDefaultArg,
      err("Invalid value for argument `booleanDefaultArg`. Expected `true`, but received:", booleanDefaultArg),
    );
  });

  it('["hello world", 123, true]'.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = parse(["hello world", "123", "false"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [stringArg, numberArg, booleanDefaultArg] = result.data.arguments;

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
      !booleanDefaultArg,
      err("Invalid value for argument `booleanDefaultArg`. Expected `false`, but received:", booleanDefaultArg),
    );
  });
});
