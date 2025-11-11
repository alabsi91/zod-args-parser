import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, defineCLI } from "../src/index.ts";
import { err, expectsSuccess, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = defineCLI({
  cliName: "test-cli",
  options: {
    help: {
      aliases: ["h"],
      schema: z.boolean().optional(),
      coerce: coerce.boolean,
    },
  },
});

describe("Negate boolean option".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("--no-help".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["--no-help"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(
      result.value.options.help,
      false,
      err("Invalid value for option `--no-help`. Expected `false`, but received:", result.value.options.help),
    );
  });

  it("--help=false".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["--help=false"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(
      result.value.options.help,
      false,
      err("Invalid value for option `--help=false`. Expected `false`, but received:", result.value.options.help),
    );
  });

  it("--no-help=false".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["--no-help=false"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(
      result.value.options.help,
      true,
      err("Invalid value for option `--no-help=false`. Expected `true`, but received:", result.value.options.help),
    );
  });

  it("--no-help=true".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["--no-help=true"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(
      result.value.options.help,
      false,
      err("Invalid value for option `--no-help=true`. Expected `false`, but received:", result.value.options.help),
    );
  });

  it("--no-h".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["--no-h"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(
      result.value.options.help,
      false,
      err("Invalid value for option `--no-h`. Expected `false`, but received:", result.value.options.help),
    );
  });

  it("-h=false".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["-h=false"]);
    assert(!result.value, err("Invalid option `-h=false`. Expected failure, but parsing succeeded."));
  });

  it("--no-h=false".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["--no-h=false"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(
      result.value.options.help,
      true,
      err("Invalid value for option `--no-h=false`. Expected `true`, but received:", result.value.options.help),
    );
  });

  it("--no-h=true".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["--no-h=true"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(
      result.value.options.help,
      false,
      err("Invalid value for option `--no-h=true`. Expected `false`, but received:", result.value.options.help),
    );
  });
});
