import chalk from "chalk";
import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";
import { createCli, safeParse } from "../src/index.js";
import {
  decoupleFlags,
  isOptionArg,
  optionArgToVarNames,
  transformOptionToArg,
} from "../src/parser/parse/parser-helpers.js";

const err = (...message: unknown[]) => chalk.bold.red(...message);

const padEnd = 16;
const expectsFailure = chalk.yellow("expects failure".padEnd(padEnd));
const expectsSuccess = chalk.yellow("expects success".padEnd(padEnd));
const expectsTrue = chalk.yellow("expects `true`".padEnd(padEnd));
const expectsFalse = chalk.yellow("expects `false`".padEnd(padEnd));
const expectsUndefined = chalk.yellow("expects `undefined`").padEnd(padEnd);
const expectsString = chalk.yellow("expects string".padEnd(padEnd));
const expectsNumber = chalk.yellow("expects number".padEnd(padEnd));

it("-h, --help (optional: boolean): Pass `--h` instead of `-h` " + expectsFailure, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "help", type: z.boolean().optional(), aliases: ["h"] }],
  });

  const args = ["--h"];
  const result = safeParse(args, cli);
  assert(!result.success, err("Invalid option `--h`. Expected failure, but parsing succeeded."));
});

it("-h, --help (optional: boolean): Pass `-H` instead of `-h` " + expectsSuccess, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "help", type: z.boolean().optional(), aliases: ["h"] }],
  });

  const args = ["-H"];
  const result = safeParse(args, cli);

  if (!result.success) {
    assert.fail(err("Parsing failed with the error message:", result.error.message));
  }

  assert(result.data.help, err("Invalid value for option `-H`. Expected `true`, but received:", result.data.help));
});

describe("-h, --help (required: boolean)", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "help", type: z.boolean(), aliases: ["h"] }],
  });

  const indent = 24;

  it("--help".padEnd(indent) + expectsTrue, () => {
    const args = ["--help"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.help,
      err("Invalid value for option `--help`. Expected `true`, but received:", result.data.help),
    );
  });

  it("--help=true".padEnd(indent) + expectsTrue, () => {
    const args = ["--help=true"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.help,
      err("Invalid value for option `--help=true`. Expected `true`, but received:", result.data.help),
    );
  });

  it("--no-help=false".padEnd(indent) + expectsTrue, () => {
    const args = ["--no-help=false"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.help,
      err("Invalid value for option `--no-help=false`. Expected `true`, but received:", result.data.help),
    );
  });

  it("-h".padEnd(indent) + expectsTrue, () => {
    const args = ["-h"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(result.data.help, err("Invalid value for option `-h`. Expected `true`, but received:", result.data.help));
  });

  it("--help=false".padEnd(indent) + expectsFalse, () => {
    const args = ["--help=false"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.data.help,
      err("Invalid value for option `--help=false`. Expected `false`, but received:", result.data.help),
    );
  });

  it("--no-help".padEnd(indent) + expectsFalse, () => {
    const args = ["--no-help"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.data.help,
      err("Invalid value for option `--no-help`. Expected `false`, but received:", result.data.help),
    );
  });

  it("--no-help=true".padEnd(indent) + expectsFalse, () => {
    const args = ["--no-help=true"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      !result.data.help,
      err("Invalid value for option `--no-help=true`. Expected `false`, but received:", result.data.help),
    );
  });

  it("No arguments provided".padEnd(indent) + expectsFailure, () => {
    const args: string[] = [];
    const result = safeParse(args, cli);
    assert(!result.success, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--help true".padEnd(indent) + expectsFailure, () => {
    const args = ["--help", "true"];
    const result = safeParse(args, cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `--help true`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help false".padEnd(indent) + expectsFailure, () => {
    const args = ["--help", "false"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `--help false`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help=string".padEnd(indent) + expectsFailure, () => {
    const args = ["--help=string"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `--help=string`. Expected failure, but parsing succeeded."),
    );
  });

  it("--help=1234".padEnd(indent) + expectsFailure, () => {
    const args = ["--help=1234"];
    const result = safeParse(args, cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `--help=1234`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h true".padEnd(indent) + expectsFailure, () => {
    const args = ["-h", "true"];
    const result = safeParse(args, cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `-h true`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h=true".padEnd(indent) + expectsFailure, () => {
    const args = ["-h=true"];
    const result = safeParse(args, cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `-h=true`. Expected failure, but parsing succeeded."),
    );
  });

  it("-h=false".padEnd(indent) + expectsFailure, () => {
    const args = ["-h=false"];
    const result = safeParse(args, cli);
    assert(
      !result.success,
      err("Cannot pass a value to a boolean option `-h=false`. Expected failure, but parsing succeeded."),
    );
  });
});

it("-h, --help (optional: boolean): No arguments provided " + expectsUndefined, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "help", type: z.boolean().optional(), aliases: ["h"] }],
  });

  const args: string[] = [];
  const result = safeParse(args, cli);

  if (!result.success) {
    assert.fail(err("Parsing failed with the error message:", result.error.message));
  }

  assert(
    result.data.help === undefined,
    err("Invalid value for option `help`. Expected `undefined`, but received:", result.data.help),
  );
});

it("-h, --help (default: false):    No arguments provided " + expectsFalse + "   ", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "help", type: z.boolean().default(false), aliases: ["h"] }],
  });

  const args: string[] = [];
  const result = safeParse(args, cli);

  if (!result.success) {
    assert.fail(err("Parsing failed with the error message:", result.error.message));
  }

  assert(!result.data.help, err("Invalid value for option `help`. Expected `false`, but received:", result.data.help));
});

describe("-n, --number (required number)", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "number", type: z.coerce.number(), aliases: ["n"] }],
  });

  const indent = 24;

  it("--number 123".padEnd(indent) + expectsNumber, () => {
    const args = ["--number", "123"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.number === 123,
      err("Invalid value for option `--number 123`. Expected `123`, but received:", result.data.number),
    );
  });

  it("-n 123".padEnd(indent) + expectsNumber, () => {
    const args = ["-n", "123"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.number === 123,
      err("Invalid value for option `-n 123`. Expected `123`, but received:", result.data.number),
    );
  });

  it("--number 0.5".padEnd(indent) + expectsNumber, () => {
    const args = ["--number", "0.5"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.number === 0.5,
      err("Invalid value for option `--number 0.5`. Expected `0.5`, but received:", result.data.number),
    );
  });

  it("-n 0.5".padEnd(indent) + expectsNumber, () => {
    const args = ["-n", "0.5"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.number === 0.5,
      err("Invalid value for option `-n 0.5`. Expected `0.5`, but received:", result.data.number),
    );
  });

  it("No arguments provided".padEnd(indent) + expectsFailure, () => {
    const args: string[] = [];
    const result = safeParse(args, cli);
    assert(!result.success, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--number".padEnd(indent) + expectsFailure, () => {
    const args = ["--number"];
    const result = safeParse(args, cli);
    assert(!result.success, err("Missing value for option `--number`. Expected failure, but parsing succeeded."));
  });

  it("-n".padEnd(indent) + expectsFailure, () => {
    const args = ["-n"];
    const result = safeParse(args, cli);
    assert(!result.success, err("Missing value for option `-n`. Expected failure, but parsing succeeded."));
  });

  it("--number string".padEnd(indent) + expectsFailure, () => {
    const args = ["--number", "string"];
    const result = safeParse(args, cli);
    assert(
      !result.success,
      err("Received incorrect value type for option `--number string`. Expected failure, but parsing succeeded."),
    );
  });

  it("-n string".padEnd(indent) + expectsFailure, () => {
    const args = ["-n", "string"];
    const result = safeParse(args, cli);
    assert(
      !result.success,
      err("Received incorrect value type for option `-n string`. Expected failure, but parsing succeeded."),
    );
  });
});

it("-n, --number (optional: number): No arguments provided " + expectsUndefined, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "number", type: z.coerce.number().optional(), aliases: ["n"] }],
  });

  const args: string[] = [];
  const result = safeParse(args, cli);

  if (!result.success) {
    assert.fail(err("Parsing failed with the error message:", result.error.message));
  }

  assert(
    result.data.number === undefined,
    err("Invalid value for option `number`. Expected `undefined`, but received:", result.data.number),
  );
});

it("-n, --number (default: 0.1):     No arguments provided " + expectsNumber + "   ", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "number", type: z.coerce.number().default(0.1), aliases: ["n"] }],
  });

  const args: string[] = [];
  const result = safeParse(args, cli);

  if (!result.success) {
    assert.fail(err("Parsing failed with the error message:", result.error.message));
  }

  assert(
    result.data.number === 0.1,
    err("Invalid value for option `number`. Expected `0.1`, but received:", result.data.number),
  );
});

describe("-s, --string (required string)", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "string", type: z.string(), aliases: ["s"] }],
  });

  const indent = 24;

  it("--string 'hello world'".padEnd(indent) + expectsString, () => {
    const args = ["--string", "hello world"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.string === "hello world",
      err(
        'Invalid value for option `--string "hello world"`. Expected `"hello world"`, but received:',
        result.data.string,
      ),
    );
  });

  it("-s 'hello world'".padEnd(indent) + expectsString, () => {
    const args = ["-s", "hello world"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.string === "hello world",
      err('Invalid value for option `-s "hello world"`. Expected `"hello world"`, but received:', result.data.string),
    );
  });

  it("--string 123".padEnd(indent) + expectsString, () => {
    const args = ["--string", "123"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.equal(result.data.string, "123");
  });

  it("-s 123".padEnd(indent) + expectsString, () => {
    const args = ["-s", "123"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert(
      result.data.string === "123",
      err('Invalid value for option `-s 123`. Expected `"123"`, but received:', result.data.string),
    );
  });

  it("No arguments provided".padEnd(indent) + expectsFailure, () => {
    const args: string[] = [];
    const result = safeParse(args, cli);
    assert(!result.success, err("No arguments provided. Expected failure, but parsing succeeded."));
  });

  it("--string".padEnd(indent) + expectsFailure, () => {
    const args = ["--string"];
    const result = safeParse(args, cli);
    assert(!result.success, err("Missing value for option `--string`. Expected failure, but parsing succeeded."));
  });

  it("-s".padEnd(indent) + expectsFailure, () => {
    const args = ["-s"];
    const result = safeParse(args, cli);
    assert(!result.success, err("Missing value for option `-s`. Expected failure, but parsing succeeded."));
  });
});

it("-s, --string (optional: string):       No arguments provided " + expectsUndefined, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "string", type: z.string().optional(), aliases: ["s"] }],
  });

  const args: string[] = [];
  const result = safeParse(args, cli);

  if (!result.success) {
    assert.fail(err("Parsing failed with the error message:", result.error.message));
  }

  assert(
    result.data.string === undefined,
    err("Invalid value for option `string`. Expected `undefined`, but received:", result.data.string),
  );
});

it("-s, --string (default: 'hello world'): No arguments provided " + expectsString + "   ", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "string", type: z.string().default("hello world"), aliases: ["s"] }],
  });

  const args: string[] = [];
  const result = safeParse(args, cli);

  if (!result.success) {
    assert.fail(err("Parsing failed with the error message:", result.error.message));
  }

  assert(
    result.data.string === "hello world",
    err('Invalid default value for option `string`. Expected `"hello world"`, but received:', result.data.string),
  );
});

describe("booleanArg stringArg numberArg", () => {
  const cli = createCli({
    cliName: "test-cli",
    arguments: [
      { name: "booleanArg", type: z.boolean() },
      { name: "stringArg", type: z.string() },
      { name: "numberArg", type: z.coerce.number() },
    ],
  });

  const indent = 26;

  it('true "hello world" 123'.padEnd(indent) + expectsSuccess, () => {
    const args = ["true", "hello world", "123"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [booleanArg, stringArg, numberArg] = result.data.arguments;
    assert(booleanArg, err("Invalid value for argument `booleanArg`. Expected `true`, but received:", booleanArg));
    assert.equal(
      stringArg,
      "hello world",
      err('Invalid value for argument `stringArg`. Expected `"hello world"`, but received:', stringArg),
    );
    assert.equal(
      numberArg,
      123,
      err("Invalid value for argument `numberArg`. Expected `123`, but received:", numberArg),
    );
  });

  it('false "hello world" 123'.padEnd(indent) + expectsSuccess, () => {
    const args = ["false", "hello world", "123"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [booleanArg, stringArg, numberArg] = result.data.arguments;
    assert(!booleanArg, err("Invalid value for argument `booleanArg`. Expected `false`, but received:", booleanArg));
    assert.equal(
      stringArg,
      "hello world",
      err('Invalid value for argument `stringArg`. Expected `"hello world"`, but received:', stringArg),
    );
    assert.equal(
      numberArg,
      123,
      err("Invalid value for argument `numberArg`. Expected `123`, but received:", numberArg),
    );
  });

  it('0 "hello world" 123'.padEnd(indent) + expectsFailure, () => {
    const args = ["0", "hello world", "123"];
    const result = safeParse(args, cli);
    assert(!result.success, err("First argument of type boolean. Expected failure, but parsing succeeded."));
  });

  it("true 123".padEnd(indent) + expectsFailure, () => {
    const args = ["0", "123"];
    const result = safeParse(args, cli);
    assert(!result.success, err("Missing value for third argument. Expected failure, but parsing succeeded."));
  });

  it('true "hello world" string'.padEnd(indent) + expectsFailure, () => {
    const args = ["0", "hello world", "string"];
    const result = safeParse(args, cli);
    assert(!result.success, err("Third argument of type number. Expected failure, but parsing succeeded."));
  });

  it("No arguments provided".padEnd(indent) + expectsFailure, () => {
    const args: string[] = [];
    const result = safeParse(args, cli);
    assert(!result.success, err("No arguments provided. Expected failure, but parsing succeeded."));
  });
});

describe("stringArg numberArg booleanOptionalArg", () => {
  const cli = createCli({
    cliName: "test-cli",
    arguments: [
      { name: "stringArg", type: z.string() },
      { name: "numberArg", type: z.coerce.number() },
      { name: "booleanOptionalArg", type: z.boolean().optional() },
    ],
  });

  const indent = 26;

  it('"hello world" 123'.padEnd(indent) + expectsSuccess, () => {
    const args = ["hello world", "123"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [stringArg, numberArg, booleanOptionalArg] = result.data.arguments;
    assert.equal(
      stringArg,
      "hello world",
      err('Invalid value for argument `stringArg`. Expected `"hello world"`, but received:', stringArg),
    );
    assert.equal(
      numberArg,
      123,
      err("Invalid value for argument `numberArg`. Expected `123`, but received:", numberArg),
    );
    assert.equal(
      booleanOptionalArg,
      undefined,
      err("Invalid value for argument `booleanOptionalArg`. Expected `undefined`, but received:", booleanOptionalArg),
    );
  });

  it('"hello world" 123 true'.padEnd(indent) + expectsSuccess, () => {
    const args = ["hello world", "123", "true"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [stringArg, numberArg, booleanOptionalArg] = result.data.arguments;
    assert.equal(
      stringArg,
      "hello world",
      err('Invalid value for argument `stringArg`. Expected `"hello world"`, but received:', stringArg),
    );
    assert.equal(
      numberArg,
      123,
      err("Invalid value for argument `numberArg`. Expected `123`, but received:", numberArg),
    );
    assert(
      booleanOptionalArg,
      err("Invalid value for argument `booleanOptionalArg`. Expected `true`, but received:", booleanOptionalArg),
    );
  });
});

describe("stringArg numberArg booleanDefaultArg", () => {
  const cli = createCli({
    cliName: "test-cli",
    arguments: [
      { name: "stringArg", type: z.string() },
      { name: "numberArg", type: z.coerce.number() },
      { name: "booleanDefaultArg", type: z.boolean().default(true) },
    ],
  });

  const indent = 26;

  it('"hello world" 123'.padEnd(indent) + expectsSuccess, () => {
    const args = ["hello world", "123"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [stringArg, numberArg, booleanDefaultArg] = result.data.arguments;
    assert.equal(
      stringArg,
      "hello world",
      err('Invalid value for argument `stringArg`. Expected `"hello world"`, but received:', stringArg),
    );
    assert.equal(
      numberArg,
      123,
      err("Invalid value for argument `numberArg`. Expected `123`, but received:", numberArg),
    );
    assert(
      booleanDefaultArg,
      err("Invalid value for argument `booleanDefaultArg`. Expected `true`, but received:", booleanDefaultArg),
    );
  });

  it('"hello world" 123 true'.padEnd(indent) + expectsSuccess, () => {
    const args = ["hello world", "123", "false"];
    const result = safeParse(args, cli);

    if (!result.success) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const [stringArg, numberArg, booleanDefaultArg] = result.data.arguments;
    assert.equal(
      stringArg,
      "hello world",
      err('Invalid value for argument `stringArg`. Expected `"hello world"`, but received:', stringArg),
    );
    assert.equal(
      numberArg,
      123,
      err("Invalid value for argument `numberArg`. Expected `123`, but received:", numberArg),
    );
    assert(
      !booleanDefaultArg,
      err("Invalid value for argument `booleanDefaultArg`. Expected `false`, but received:", booleanDefaultArg),
    );
  });
});

describe("Testing Utils", () => {
  it("transformOptionToArg", () => {
    const testValues = new Map([
      ["I", "-i"],
      ["i", "-i"],
      ["Input", "--input"],
      ["input", "--input"],
      ["InputDir", "--input-dir"],
      ["inputDir", "--input-dir"],
      ["input_Dir", "--input-dir"],
      ["INPUT_DIR", "--input-dir"],
      ["Help", "--help"],
      ["help", "--help"],
      ["HELP", "--help"],
    ]);

    for (const [key, value] of testValues) {
      assert.equal(transformOptionToArg(key), value, err(`"${key}" should be transformed to "${value}"`));
    }
  });

  it("isOptionArg", () => {
    const testValues = new Map([
      ["--input", true],
      ["--input-dir", true],
      ["--help", true],
      ["-i", true],
      ["--i", false],
    ]);

    for (const [key, value] of testValues) {
      assert.equal(isOptionArg(key), value, err(`"${key}" should${value ? "" : " not"} be an option argument.`));
    }
  });

  it("optionArgToVarNames", () => {
    const testValues = new Map([
      ["-i", new Set(["i", "I"])],
      ["--input", new Set(["input", "Input", "INPUT"])],
      ["--input-dir", new Set(["inputDir", "InputDir", "input_dir", "INPUT_DIR"])],
    ]);

    for (const [key, value] of testValues) {
      const results = optionArgToVarNames(key);

      const missingNames = value.difference(results);
      const extraNames = results.difference(value);

      const isExtra = extraNames.size > 0;
      const isMissing = missingNames.size > 0;

      assert(
        !isExtra && !isMissing,
        isExtra
          ? err(`"${key}" has extra var names: "${[...extraNames].join(", ")}"`)
          : err(`"${key}" is missing var names: "${[...missingNames].join(", ")}"`),
      );
    }
  });

  it("decoupleFlags", () => {
    const testValues = new Map([
      ["-r", ["-r"]],
      ["-rf", ["-r", "-f"]],
      ["-rfa", ["-r", "-f", "-a"]],
      ["-rfab0", ["-r", "-f", "-a", "-b", "-0"]],
      ["--options", ["--options"]],
      ["--option-name", ["--option-name"]],
      ["argument", ["argument"]],
    ]);

    for (const [key, value] of testValues) {
      const results = decoupleFlags([key]);
      assert.deepEqual(
        results,
        value,
        err(`"${key}" should be decoupled to "${value.join(", ")}" but was "${results.join(", ")}"`),
      );
    }
  });
});
