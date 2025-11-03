import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";
import { coerce, createCli, parse } from "../src/index.ts";
import { err, expectsFailure, expectsSuccess, expectsUndefined, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  options: {
    help: {
      aliases: ["h"],
      type: coerce.boolean(z.boolean().optional()),
    },
  },
});

describe("-h, --help (optional: boolean)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("--h".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = parse(["--h"], cli);
    assert(!result.success, err("Invalid option `--h`. Expected failure, but parsing succeeded."));
  });

  it("-H".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = parse(["-H"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.help,
      err("Invalid value for option `-H`. Expected `true`, but received:", result.data.options.help),
    );
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsUndefined, () => {
    const result = parse([], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.help === undefined,
      err("Invalid value for option `help`. Expected `undefined`, but received:", result.data.options.help),
    );
  });
});
