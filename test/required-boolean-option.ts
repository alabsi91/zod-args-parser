import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, createCli, parse } from "../src/index.ts";
import { err, expectsFailure, expectsFalse, expectsTrue, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  options: {
    help: {
      aliases: ["h"],
      type: coerce.boolean(z.boolean()),
    },
  },
});

describe("-h, --help (required: boolean)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("--help".padEnd(spaceToColumn) + expectsTrue, () => {
    const result = parse(["--help"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.help,
      err("Invalid value for option `--help`. Expected `true`, but received:", result.data.options.help),
    );
  });

  it("--help=true".padEnd(spaceToColumn) + expectsTrue, () => {
    const result = parse(["--help=true"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.help,
      err("Invalid value for option `--help=true`. Expected `true`, but received:", result.data.options.help),
    );
  });

  it("--no-help=false".padEnd(spaceToColumn) + expectsTrue, () => {
    const result = parse(["--no-help=false"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.help,
      err("Invalid value for option `--no-help=false`. Expected `true`, but received:", result.data.options.help),
    );
  });

  it("-h".padEnd(spaceToColumn) + expectsTrue, () => {
    const result = parse(["-h"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.help,
      err("Invalid value for option `-h`. Expected `true`, but received:", result.data.options.help),
    );
  });

  it("--help=false".padEnd(spaceToColumn) + expectsFalse, () => {
    const result = parse(["--help=false"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.data.options.help,
      err("Invalid value for option `--help=false`. Expected `false`, but received:", result.data.options.help),
    );
  });

  it("--no-help".padEnd(spaceToColumn) + expectsFalse, () => {
    const result = parse(["--no-help"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.data.options.help,
      err("Invalid value for option `--no-help`. Expected `false`, but received:", result.data.options.help),
    );
  });

  it("--no-help=true".padEnd(spaceToColumn) + expectsFalse, () => {
    const result = parse(["--no-help=true"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.data.options.help,
      err("Invalid value for option `--no-help=true`. Expected `false`, but received:", result.data.options.help),
    );
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse([], cli);
    assert(!result.success, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--help true".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["--help", "true"], cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `--help true`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help false".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["--help", "false"], cli);
    if (result.success) {
      assert.fail("Should have failed");
    }

    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `--help false`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help=string".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["--help=string"], cli);
    if (result.success) {
      assert.fail("Should have failed");
    }

    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `--help=string`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help=1234".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["--help=1234"], cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `--help=1234`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h true".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["-h", "true"], cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `-h true`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h=true".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["-h=true"], cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `-h=true`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h=false".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["-h=false"], cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `-h=false`. Expected failure, but parsing succeeded."),
    );
  });
});
