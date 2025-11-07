import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, createCli } from "../src/index.ts";
import { err, expectsFailure, expectsFalse, expectsTrue, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  options: {
    help: {
      aliases: ["h"],
      type: z.object({ value: z.boolean() }),
      coerce: coerce.boolean,
    },
  },
});

describe("-h, --help (required: boolean)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("--help".padEnd(spaceToColumn) + expectsTrue, () => {
    const result = cli.run(["--help"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.help,
      err("Invalid value for option `--help`. Expected `true`, but received:", result.value.options.help),
    );
  });

  it("--help=true".padEnd(spaceToColumn) + expectsTrue, () => {
    const result = cli.run(["--help=true"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.help,
      err("Invalid value for option `--help=true`. Expected `true`, but received:", result.value.options.help),
    );
  });

  it("--no-help=false".padEnd(spaceToColumn) + expectsTrue, () => {
    const result = cli.run(["--no-help=false"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.help,
      err("Invalid value for option `--no-help=false`. Expected `true`, but received:", result.value.options.help),
    );
  });

  it("-h".padEnd(spaceToColumn) + expectsTrue, () => {
    const result = cli.run(["-h"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.help,
      err("Invalid value for option `-h`. Expected `true`, but received:", result.value.options.help),
    );
  });

  it("--help=false".padEnd(spaceToColumn) + expectsFalse, () => {
    const result = cli.run(["--help=false"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.value.options.help,
      err("Invalid value for option `--help=false`. Expected `false`, but received:", result.value.options.help),
    );
  });

  it("--no-help".padEnd(spaceToColumn) + expectsFalse, () => {
    const result = cli.run(["--no-help"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.value.options.help,
      err("Invalid value for option `--no-help`. Expected `false`, but received:", result.value.options.help),
    );
  });

  it("--no-help=true".padEnd(spaceToColumn) + expectsFalse, () => {
    const result = cli.run(["--no-help=true"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.value.options.help,
      err("Invalid value for option `--no-help=true`. Expected `false`, but received:", result.value.options.help),
    );
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run([]);
    assert(!result.value, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--help true".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--help", "true"]);
    assert(
      !result.value,
      err("Cannot pass a value to a boolean option `--help true`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help false".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--help", "false"]);
    if (result.value) {
      assert.fail("Should have failed");
    }

    assert(
      !result.value,
      err("Cannot pass a value to a boolean option `--help false`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help=string".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--help=string"]);
    if (result.value) {
      assert.fail("Should have failed");
    }

    assert(
      !result.value,
      err("Cannot pass a value to a boolean option `--help=string`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help=1234".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--help=1234"]);
    assert(
      !result.value,
      err("Cannot pass a value to a boolean option `--help=1234`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h true".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["-h", "true"]);
    assert(
      !result.value,
      err("Cannot pass a value to a boolean option `-h true`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h=true".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["-h=true"]);
    assert(
      !result.value,
      err("Cannot pass a value to a boolean option `-h=true`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h=false".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["-h=false"]);
    assert(
      !result.value,
      err("Cannot pass a value to a boolean option `-h=false`. Expected failure, but parsing succeeded."),
    );
  });
});
