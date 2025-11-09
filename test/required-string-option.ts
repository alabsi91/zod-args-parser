import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, defineCLI } from "../src/index.ts";
import { err, expectsFailure, expectsString, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = defineCLI({
  cliName: "test-cli",
  options: {
    string: {
      aliases: ["s"],
      schema: z.string(),
      coerce: coerce.string,
    },
  },
});

describe("-s, --string (required string)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("--string 'hello world'".padEnd(spaceToColumn) + expectsString, () => {
    const result = cli.run(["--string", "hello world"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.string === "hello world",
      err(
        'Invalid value for option `--string "hello world"`. Expected `"hello world"`, but received:',
        result.value.options.string,
      ),
    );
  });

  it("-s 'hello world'".padEnd(spaceToColumn) + expectsString, () => {
    const result = cli.run(["-s", "hello world"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.string === "hello world",
      err(
        'Invalid value for option `-s "hello world"`. Expected `"hello world"`, but received:',
        result.value.options.string,
      ),
    );
  });

  it("--string 123".padEnd(spaceToColumn) + expectsString, () => {
    const result = cli.run(["--string", "123"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(result.value.options.string, "123");
  });

  it("-s 123".padEnd(spaceToColumn) + expectsString, () => {
    const result = cli.run(["-s", "123"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.string === "123",
      err('Invalid value for option `-s 123`. Expected `"123"`, but received:', result.value.options.string),
    );
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run([]);
    assert(!result.value, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--string".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--string"]);
    assert(!result.value, err("Missing value for option `--string`. Expected failure, but parsing succeeded."));
  });

  it("-s".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["-s"]);
    assert(!result.value, err("Missing value for option `-s`. Expected failure, but parsing succeeded."));
  });
});
