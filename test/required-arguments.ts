import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, createCli, parse } from "../src/index.ts";
import { err, expectsFailure, expectsSuccess, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  arguments: [
    {
      type: coerce.boolean(z.boolean()),
      meta: { name: "booleanArg" },
    },
    {
      type: coerce.string(z.string()),
      meta: { name: "stringArg" },
    },
    {
      type: coerce.number(z.number()),
      meta: { name: "numberArg" },
    },
  ],
});

describe("[boolean, string, number]".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it('[true, "hello world", 123]'.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = parse(["true", "hello world", "123"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [booleanArg, stringArg, numberArg] = result.data.arguments;
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
    const result = parse(["false", "hello world", "123"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [booleanArg, stringArg, numberArg] = result.data.arguments;

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
    const result = parse(["0", "hello world", "123"], cli);
    assert(!result.success, err("First argument of type boolean. Expected failure, but parsing succeeded."));
  });

  it("[true, 123]".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["0", "123"], cli);
    assert(!result.success, err("Missing value for third argument. Expected failure, but parsing succeeded."));
  });

  it('[true, "hello world", string]'.padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["0", "hello world", "string"], cli);
    assert(!result.success, err("Third argument of type number. Expected failure, but parsing succeeded."));
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse([], cli);
    assert(!result.success, err("No arguments provided. Expected failure, but parsing succeeded."));
  });
});
