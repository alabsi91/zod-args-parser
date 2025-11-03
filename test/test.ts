import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";
import { coerce, createCli, parse } from "../src/index.ts";
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
  const cli = createCli({
    cliName: "test-cli",
    options: {
      help: {
        aliases: ["h"],
        type: coerce.boolean(z.boolean().default(false)),
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsFalse, () => {
    const result = parse([], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.data.options.help,
      err("Invalid value for option `help`. Expected `false`, but received:", result.data.options.help),
    );
  });
});

describe("-n, --number (optional: number)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = createCli({
    cliName: "test-cli",
    options: {
      number: {
        aliases: ["n"],
        type: coerce.number(z.number().optional()),
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsUndefined, () => {
    const result = parse([], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.number === undefined,
      err("Invalid value for option `number`. Expected `undefined`, but received:", result.data.options.number),
    );
  });
});

describe("-n, --number (default: 0.1)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = createCli({
    cliName: "test-cli",
    options: {
      number: {
        aliases: ["n"],
        type: coerce.number(z.number().default(0.1)),
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsNumber, () => {
    const result = parse([], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.number === 0.1,
      err("Invalid value for option `number`. Expected `0.1`, but received:", result.data.options.number),
    );
  });
});

describe("-s, --string (optional: string)".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = createCli({
    cliName: "test-cli",
    options: {
      string: {
        type: coerce.string(z.string().optional()),
        aliases: ["s"],
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsUndefined, () => {
    const result = parse([], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.string === undefined,
      err("Invalid value for option `string`. Expected `undefined`, but received:", result.data.options.string),
    );
  });
});

describe("-s, --string (default: 'hello world')".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = createCli({
    cliName: "test-cli",
    options: {
      string: {
        aliases: ["s"],
        type: coerce.string(z.string().default("hello world")),
      },
    },
  });

  it("No arguments provided".padEnd(spaceToColumn) + expectsString, () => {
    const result = parse([], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.string === "hello world",
      err(
        'Invalid default value for option `string`. Expected `"hello world"`, but received:',
        result.data.options.string,
      ),
    );
  });
});

describe("-abcd, booleans flags".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  const cli = createCli({
    cliName: "test-cli",
    options: {
      a: { type: coerce.boolean(z.boolean()) },
      b: { type: coerce.boolean(z.boolean()) },
      c: { type: coerce.boolean(z.boolean()) },
      d: { type: coerce.boolean(z.boolean()) },
    },
  });

  it("-abcd".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = parse(["-abcd"], cli);
    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.options.a,
      err("Invalid value for option `-a`. Expected `true`, but received:", result.data.options.a),
    );
    assert(
      result.data.options.b,
      err("Invalid value for option `-b`. Expected `true`, but received:", result.data.options.b),
    );
    assert(
      result.data.options.c,
      err("Invalid value for option `-c`. Expected `true`, but received:", result.data.options.c),
    );
    assert(
      result.data.options.d,
      err("Invalid value for option `-d`. Expected `true`, but received:", result.data.options.d),
    );
  });
});
