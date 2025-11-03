import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";
import { coerce, createCli, parse } from "../src/index.ts";
import { err, expectsFailure, expectsNumber, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  options: {
    number: {
      aliases: ["n"],
      type: coerce.number(z.number()),
    },
  },
});

describe("-n, --number (required number)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("--number 123".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = parse(["--number", "123"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.number === 123,
      err("Invalid value for option `--number 123`. Expected `123`, but received:", result.data.options.number),
    );
  });

  it("-n 123".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = parse(["-n", "123"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.number === 123,
      err("Invalid value for option `-n 123`. Expected `123`, but received:", result.data.options.number),
    );
  });

  it("--number 0.5".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = parse(["--number", "0.5"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.number === 0.5,
      err("Invalid value for option `--number 0.5`. Expected `0.5`, but received:", result.data.options.number),
    );
  });

  it("-n 0.5".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = parse(["-n", "0.5"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.number === 0.5,
      err("Invalid value for option `-n 0.5`. Expected `0.5`, but received:", result.data.options.number),
    );
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse([], cli);
    assert(!result.success, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--number".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["--number"], cli);
    assert(!result.success, err("Missing value for option `--number`. Expected failure, but parsing succeeded."));
  });

  it("-n".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["-n"], cli);
    assert(!result.success, err("Missing value for option `-n`. Expected failure, but parsing succeeded."));
  });

  it("--number string".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["--number", "string"], cli);
    assert(
      !result.success,
      err("Received incorrect value type for option `--number string`. Expected failure, but parsing succeeded."),
    );
  });

  it("-n string".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["-n", "string"], cli);
    assert(
      !result.success,
      err("Received incorrect value type for option `-n string`. Expected failure, but parsing succeeded."),
    );
  });
});
