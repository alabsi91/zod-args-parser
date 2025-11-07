import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, defineCLI } from "../src/index.ts";
import { err, expectsFailure, expectsSuccess, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = defineCLI({
  cliName: "test-cli",
  arguments: [
    { name: "booleanArg", type: z.object({ value: z.boolean() }), coerce: coerce.boolean },
    { name: "stringArg", type: z.object({ value: z.string() }), coerce: coerce.string },
    { name: "numberArg", type: z.object({ value: z.number() }), coerce: coerce.number },
  ],
});

describe("[boolean, string, number]".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it('[true, "hello world", 123]'.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["true", "hello world", "123"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [booleanArg, stringArg, numberArg] = result.value.arguments;
    assert(booleanArg, err("Invalid value for argument `booleanArg`. Expected `true`, but received:", booleanArg));

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
  });

  it('[false, "hello world", 123]'.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["false", "hello world", "123"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [booleanArg, stringArg, numberArg] = result.value.arguments;

    assert(!booleanArg, err("Invalid value for argument `booleanArg`. Expected `false`, but received:", booleanArg));

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
  });

  it('[0, "hello world", 123]'.padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["0", "hello world", "123"]);
    assert(!result.value, err("First argument of type boolean. Expected failure, but parsing succeeded."));
  });

  it("[true, 123]".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["0", "123"]);
    assert(!result.value, err("Missing value for third argument. Expected failure, but parsing succeeded."));
  });

  it('[true, "hello world", string]'.padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["0", "hello world", "string"]);
    assert(!!result.error, err("Third argument of type number. Expected failure, but parsing succeeded."));
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run([]);
    assert(!result.value, err("No arguments provided. Expected failure, but parsing succeeded."));
  });
});
