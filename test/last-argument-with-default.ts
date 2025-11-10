import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, defineCLI } from "../src/index.ts";
import { err, expectsSuccess, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = defineCLI({
  cliName: "test-cli",
  arguments: {
    stringArg: { schema: z.string() },
    numberArg: { schema: z.number(), coerce: coerce.number },
    booleanDefaultArg: { schema: z.boolean().default(true), coerce: coerce.boolean },
  },
});

describe("[string, number, boolean=true]".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it('["hello world", 123]'.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["hello world", "123"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const { stringArg, numberArg, booleanDefaultArg } = result.value.arguments;

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
    const result = cli.run(["hello world", "123", "false"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const { stringArg, numberArg, booleanDefaultArg } = result.value.arguments;

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
