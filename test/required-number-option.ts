import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, createCli } from "../src/index.ts";
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
    const result = cli.run(["--number", "123"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.number === 123,
      err("Invalid value for option `--number 123`. Expected `123`, but received:", result.value.options.number),
    );
  });

  it("-n 123".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = cli.run(["-n", "123"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.number === 123,
      err("Invalid value for option `-n 123`. Expected `123`, but received:", result.value.options.number),
    );
  });

  it("--number 0.5".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = cli.run(["--number", "0.5"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.number === 0.5,
      err("Invalid value for option `--number 0.5`. Expected `0.5`, but received:", result.value.options.number),
    );
  });

  it("-n 0.5".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = cli.run(["-n", "0.5"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.number === 0.5,
      err("Invalid value for option `-n 0.5`. Expected `0.5`, but received:", result.value.options.number),
    );
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run([]);
    assert(!result.value, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--number".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--number"]);
    assert(!result.value, err("Missing value for option `--number`. Expected failure, but parsing succeeded."));
  });

  it("-n".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["-n"]);
    assert(!result.value, err("Missing value for option `-n`. Expected failure, but parsing succeeded."));
  });

  it("--number string".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--number", "string"]);
    assert(
      !result.value,
      err("Received incorrect value type for option `--number string`. Expected failure, but parsing succeeded."),
    );
  });

  it("-n string".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["-n", "string"]);
    assert(
      !result.value,
      err("Received incorrect value type for option `-n string`. Expected failure, but parsing succeeded."),
    );
  });
});
