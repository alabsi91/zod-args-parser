import chalk from "chalk";
import assert from "node:assert";
import { describe, it } from "node:test";
import { z } from "zod";
import { createCli, safeParse } from "../src/index.js";

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
  if (result.success) assert.fail("Should have failed");
});

it("-h, --help (optional: boolean): Pass `-H` instead of `-h` " + expectsFailure, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "help", type: z.boolean().optional(), aliases: ["h"] }],
  });

  const args = ["-H"];
  const result = safeParse(args, cli);
  if (result.success) assert.fail("Should have failed");
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
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.help, true);
  });

  it("--help=true".padEnd(indent) + expectsTrue, () => {
    const args = ["--help=true"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.help, true);
  });

  it("--no-help=false".padEnd(indent) + expectsTrue, () => {
    const args = ["--no-help=false"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.help, true); // negative
  });

  it("-h".padEnd(indent) + expectsTrue, () => {
    const args = ["-h"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.help, true);
  });

  it("--help=false".padEnd(indent) + expectsFalse, () => {
    const args = ["--help=false"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.help, false);
  });

  it("--no-help".padEnd(indent) + expectsFalse, () => {
    const args = ["--no-help"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.help, false);
  });

  it("--no-help=true".padEnd(indent) + expectsFalse, () => {
    const args = ["--no-help=true"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.help, false); // negative
  });

  it("No arguments provided".padEnd(indent) + expectsFailure, () => {
    const args = [];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("--help true".padEnd(indent) + expectsFailure, () => {
    const args = ["--help", "true"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("--help false".padEnd(indent) + expectsFailure, () => {
    const args = ["--help", "false"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("--help=string".padEnd(indent) + expectsFailure, () => {
    const args = ["--help=string"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("--help=1234".padEnd(indent) + expectsFailure, () => {
    const args = ["--help=1234"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("-h true".padEnd(indent) + expectsFailure, () => {
    const args = ["-h", "true"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("-h=true".padEnd(indent) + expectsFailure, () => {
    const args = ["-h=true"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("-h=false".padEnd(indent) + expectsFailure, () => {
    const args = ["-h=false"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });
});

it("-h, --help (optional: boolean): No arguments provided " + expectsUndefined, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "help", type: z.boolean().optional(), aliases: ["h"] }],
  });

  const args = [];
  const result = safeParse(args, cli);
  if (!result.success) assert.fail(result.error.message);
  assert.equal(result.data.help, undefined);
});

it("-h, --help (default: false):    No arguments provided " + expectsFalse + "   ", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "help", type: z.boolean().default(false), aliases: ["h"] }],
  });

  const args = [];
  const result = safeParse(args, cli);
  if (!result.success) assert.fail(result.error.message);
  assert.equal(result.data.help, false);
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
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.number, 123);
  });

  it("-n 123".padEnd(indent) + expectsNumber, () => {
    const args = ["-n", "123"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.number, 123);
  });

  it("--number 0.5".padEnd(indent) + expectsNumber, () => {
    const args = ["--number", "0.5"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.number, 0.5);
  });

  it("-n 0.5".padEnd(indent) + expectsNumber, () => {
    const args = ["-n", "0.5"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.number, 0.5);
  });

  it("No arguments provided".padEnd(indent) + expectsFailure, () => {
    const args = [];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("--number".padEnd(indent) + expectsFailure, () => {
    const args = ["--number"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("-n".padEnd(indent) + expectsFailure, () => {
    const args = ["-n"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("--number string".padEnd(indent) + expectsFailure, () => {
    const args = ["--number", "string"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("-n string".padEnd(indent) + expectsFailure, () => {
    const args = ["-n", "string"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });
});

it("-n, --number (optional: number): No arguments provided " + expectsUndefined, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "number", type: z.coerce.number().optional(), aliases: ["n"] }],
  });

  const args = [];
  const result = safeParse(args, cli);
  if (!result.success) assert.fail(result.error.message);
  assert.equal(result.data.number, undefined);
});

it("-n, --number (default: 0.1):     No arguments provided " + expectsNumber + "   ", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "number", type: z.coerce.number().default(0.1), aliases: ["n"] }],
  });

  const args = [];
  const result = safeParse(args, cli);
  if (!result.success) assert.fail(result.error.message);
  assert.equal(result.data.number, 0.1);
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
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.string, "hello world");
  });

  it("-s 'hello world'".padEnd(indent) + expectsString, () => {
    const args = ["-s", "hello world"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.string, "hello world");
  });

  it("--string 123".padEnd(indent) + expectsString, () => {
    const args = ["--string", "123"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.string, "123");
  });

  it("-s 123".padEnd(indent) + expectsString, () => {
    const args = ["-s", "123"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    assert.equal(result.data.string, "123");
  });

  it("No arguments provided".padEnd(indent) + expectsFailure, () => {
    const args = [];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("--string".padEnd(indent) + expectsFailure, () => {
    const args = ["--string"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("-s".padEnd(indent) + expectsFailure, () => {
    const args = ["-s"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });
});

it("-s, --string (optional: string):       No arguments provided " + expectsUndefined, () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "string", type: z.string().optional(), aliases: ["s"] }],
  });

  const args = [];
  const result = safeParse(args, cli);
  if (!result.success) assert.fail(result.error.message);
  assert.equal(result.data.string, undefined);
});

it("-s, --string (default: 'hello world'): No arguments provided " + expectsString + "   ", () => {
  const cli = createCli({
    cliName: "test-cli",
    options: [{ name: "string", type: z.string().default("hello world"), aliases: ["s"] }],
  });

  const args = [];
  const result = safeParse(args, cli);
  if (!result.success) assert.fail(result.error.message);
  assert.equal(result.data.string, "hello world");
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
    if (!result.success) assert.fail(result.error.message);
    const [booleanArg, stringArg, numberArg] = result.data.arguments;
    assert.equal(booleanArg, true);
    assert.equal(stringArg, "hello world");
    assert.equal(numberArg, 123);
  });

  it('false "hello world" 123'.padEnd(indent) + expectsSuccess, () => {
    const args = ["false", "hello world", "123"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    const [booleanArg, stringArg, numberArg] = result.data.arguments;
    assert.equal(booleanArg, false);
    assert.equal(stringArg, "hello world");
    assert.equal(numberArg, 123);
  });

  it('0 "hello world" 123'.padEnd(indent) + expectsFailure, () => {
    const args = ["0", "hello world", "123"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("true 123".padEnd(indent) + expectsFailure, () => {
    const args = ["0", "123"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it('true "hello world" string'.padEnd(indent) + expectsFailure, () => {
    const args = ["0", "hello world", "string"];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
  });

  it("No arguments provided".padEnd(indent) + expectsFailure, () => {
    const args = [];
    const result = safeParse(args, cli);
    if (result.success) assert.fail("Should have failed");
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
    if (!result.success) assert.fail(result.error.message);
    const [stringArg, numberArg, booleanOptionalArg] = result.data.arguments;
    assert.equal(stringArg, "hello world");
    assert.equal(numberArg, 123);
    assert.equal(booleanOptionalArg, undefined);
  });

  it('"hello world" 123 true'.padEnd(indent) + expectsSuccess, () => {
    const args = ["hello world", "123", "true"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    const [stringArg, numberArg, booleanOptionalArg] = result.data.arguments;
    assert.equal(stringArg, "hello world");
    assert.equal(numberArg, 123);
    assert.equal(booleanOptionalArg, true);
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
    if (!result.success) assert.fail(result.error.message);
    const [stringArg, numberArg, booleanDefaultArg] = result.data.arguments;
    assert.equal(stringArg, "hello world");
    assert.equal(numberArg, 123);
    assert.equal(booleanDefaultArg, true);
  });

  it('"hello world" 123 true'.padEnd(indent) + expectsSuccess, () => {
    const args = ["hello world", "123", "false"];
    const result = safeParse(args, cli);
    if (!result.success) assert.fail(result.error.message);
    const [stringArg, numberArg, booleanDefaultArg] = result.data.arguments;
    assert.equal(stringArg, "hello world");
    assert.equal(numberArg, 123);
    assert.equal(booleanDefaultArg, false);
  });
});
