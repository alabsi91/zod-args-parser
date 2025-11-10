import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, defineCLI } from "../src/index.ts";
import {
  err,
  expectsFalse,
  expectsNumber,
  expectsString,
  expectsSuccess,
  expectsUndefined,
  spaceColumnEnd,
  spaceToColumn,
} from "./test-utils.ts";

describe("-h, --help (default: false)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = defineCLI({
    cliName: "test-cli",
    options: {
      help: {
        aliases: ["h"],
        schema: z.boolean().default(false),
        coerce: coerce.boolean,
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFalse, () => {
    const result = cli.run([]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.value.options.help,
      err("Invalid value for option `help`. Expected `false`, but received:", result.value.options.help),
    );
  });
});

describe("-n, --number (optional: number)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = defineCLI({
    cliName: "test-cli",
    options: {
      number: {
        aliases: ["n"],
        schema: z.number().optional(),
        coerce: coerce.number,
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsUndefined, () => {
    const result = cli.run([]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.number === undefined,
      err("Invalid value for option `number`. Expected `undefined`, but received:", result.value.options.number),
    );
  });
});

describe("-n, --number (default: 0.1)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = defineCLI({
    cliName: "test-cli",
    options: {
      number: {
        aliases: ["n"],
        schema: z.number().default(0.1),
        coerce: coerce.number,
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = cli.run([]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.number === 0.1,
      err("Invalid value for option `number`. Expected `0.1`, but received:", result.value.options.number),
    );
  });
});

describe("-s, --string (optional: string)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = defineCLI({
    cliName: "test-cli",
    options: {
      string: {
        aliases: ["s"],
        schema: z.string().optional(),
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsUndefined, () => {
    const result = cli.run([]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.string === undefined,
      err("Invalid value for option `string`. Expected `undefined`, but received:", result.value.options.string),
    );
  });
});

describe("-s, --string (default: 'hello world')".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = defineCLI({
    cliName: "test-cli",
    options: {
      string: {
        aliases: ["s"],
        schema: z.string().default("hello world"),
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsString, () => {
    const result = cli.run([]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.string === "hello world",
      err(
        'Invalid default value for option `string`. Expected `"hello world"`, but received:',
        result.value.options.string,
      ),
    );
  });
});

describe("-abcd, booleans flags".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = defineCLI({
    cliName: "test-cli",
    options: {
      a: { schema: z.boolean(), coerce: coerce.boolean },
      b: { schema: z.boolean(), coerce: coerce.boolean },
      c: { schema: z.boolean(), coerce: coerce.boolean },
      d: { schema: z.boolean(), coerce: coerce.boolean },
    },
  });

  it("-abcd".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(["-abcd"]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.value.options.a,
      err("Invalid value for option `-a`. Expected `true`, but received:", result.value.options.a),
    );
    assert(
      result.value.options.b,
      err("Invalid value for option `-b`. Expected `true`, but received:", result.value.options.b),
    );
    assert(
      result.value.options.c,
      err("Invalid value for option `-c`. Expected `true`, but received:", result.value.options.c),
    );
    assert(
      result.value.options.d,
      err("Invalid value for option `-d`. Expected `true`, but received:", result.value.options.d),
    );
  });
});
