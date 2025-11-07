import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, createCli } from "../src/index.ts";
import { err, expectsFailure, expectsSuccess, expectsUndefined, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const cli = createCli({
  cliName: "test-cli",
  options: {
    help: {
      aliases: ["h"],
      type: z.object({ value: z.boolean().optional() }),
      coerce: coerce.boolean,
    },
  },
});

describe("-h, --help (optional: boolean)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("--h".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--h"]);
    assert(!result.value, err("Invalid option `--h`. Expected failure, but parsing succeeded."));
  });

  it("-H".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["-H"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.help,
      err("Invalid value for option `-H`. Expected `true`, but received:", result.value.options.help),
    );
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsUndefined, () => {
    const result = cli.run([]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.help === undefined,
      err("Invalid value for option `help`. Expected `undefined`, but received:", result.value.options.help),
    );
  });
});
