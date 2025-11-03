import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";
import { coerce, createCli, parse } from "../src/index.ts";
import { err, expectsFailure, expectsString, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  options: {
    string: {
      type: coerce.string(z.string()),
      aliases: ["s"],
    },
  },
});

describe("-s, --string (required string)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("--string 'hello world'".padEnd(spaceToColumn) + expectsString, () => {
    const result = parse(["--string", "hello world"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.string === "hello world",
      err(
        'Invalid value for option `--string "hello world"`. Expected `"hello world"`, but received:',
        result.data.options.string,
      ),
    );
  });

  it("-s 'hello world'".padEnd(spaceToColumn) + expectsString, () => {
    const result = parse(["-s", "hello world"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.string === "hello world",
      err(
        'Invalid value for option `-s "hello world"`. Expected `"hello world"`, but received:',
        result.data.options.string,
      ),
    );
  });

  it("--string 123".padEnd(spaceToColumn) + expectsString, () => {
    const result = parse(["--string", "123"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(result.data.options.string, "123");
  });

  it("-s 123".padEnd(spaceToColumn) + expectsString, () => {
    const result = parse(["-s", "123"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.string === "123",
      err('Invalid value for option `-s 123`. Expected `"123"`, but received:', result.data.options.string),
    );
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse([], cli);
    assert(!result.success, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--string".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["--string"], cli);
    assert(!result.success, err("Missing value for option `--string`. Expected failure, but parsing succeeded."));
  });

  it("-s".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["-s"], cli);
    assert(!result.success, err("Missing value for option `-s`. Expected failure, but parsing succeeded."));
  });
});
