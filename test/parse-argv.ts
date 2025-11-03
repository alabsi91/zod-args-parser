import assert from "node:assert";
import test, { describe } from "node:test";
import { parseArgv } from "../src/utilities.ts";
import { spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

describe("Testing Arguments Utils".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  test("basic space-separated tokens".padEnd(spaceToColumn), () => {
    const input = "one two three";
    assert.deepEqual(parseArgv(input), ["one", "two", "three"]);
  });

  test("multiple spaces trimmed".padEnd(spaceToColumn), () => {
    const input = "  one    two   three  ";
    assert.deepEqual(parseArgv(input), ["one", "two", "three"]);
  });

  test("quoted segments preserved 'start'".padEnd(spaceToColumn), () => {
    const input = `"two words" one three`;
    assert.deepEqual(parseArgv(input), ["two words", "one", "three"]);
  });

  test("quoted segments preserved 'middle'".padEnd(spaceToColumn), () => {
    const input = `one "two words" three`;
    assert.deepEqual(parseArgv(input), ["one", "two words", "three"]);
  });

  test("quoted segments preserved 'end'".padEnd(spaceToColumn), () => {
    const input = `one three "two words"`;
    assert.deepEqual(parseArgv(input), ["one", "three", "two words"]);
  });

  test("single quotes 'start'".padEnd(spaceToColumn), () => {
    const input = "'two words' one three";
    assert.deepEqual(parseArgv(input), ["two words", "one", "three"]);
  });

  test("single quotes 'middle'".padEnd(spaceToColumn), () => {
    const input = "one 'two words' three";
    assert.deepEqual(parseArgv(input), ["one", "two words", "three"]);
  });

  test("single quotes 'end'".padEnd(spaceToColumn), () => {
    const input = "one three 'two words'";
    assert.deepEqual(parseArgv(input), ["one", "three", "two words"]);
  });

  test("escaped quotes inside quotes".padEnd(spaceToColumn), () => {
    const input = `"foo \\"bar\\" baz"`;
    assert.deepEqual(parseArgv(input), ['foo "bar" baz']);
  });

  test("escaped spaces".padEnd(spaceToColumn), () => {
    const input = `one\\ two three`;
    assert.deepEqual(parseArgv(input), ["one\\", "two", "three"]);
  });

  test("mix of quoted + unquoted".padEnd(spaceToColumn), () => {
    const input = `a "b c" d\\ e 'f g'`;
    assert.deepEqual(parseArgv(input), ["a", "b c", "d\\", "e", "f g"]);
  });

  test("options like --flag and -x".padEnd(spaceToColumn), () => {
    const input = "--verbose -x file";
    assert.deepEqual(parseArgv(input), ["--verbose", "-x", "file"]);
  });

  test("key=value options".padEnd(spaceToColumn), () => {
    const input = '--port=8080 --mode="dev mode"';
    assert.deepEqual(parseArgv(input), ["--port=8080", "--mode=dev mode"]);
  });

  test("Windows file paths".padEnd(spaceToColumn), () => {
    const input = `"C:\\Program Files\\App\\app.exe" -c config.json`;
    assert.deepEqual(parseArgv(input), ["C:\\Program Files\\App\\app.exe", "-c", "config.json"]);
  });

  test("UNIX file paths".padEnd(spaceToColumn), () => {
    const input = `/usr/local/bin/node script.js`;
    assert.deepEqual(parseArgv(input), ["/usr/local/bin/node", "script.js"]);
  });

  test("empty input returns empty list".padEnd(spaceToColumn), () => {
    const input = "";
    assert.deepEqual(parseArgv(input), []);
  });

  test("only whitespace returns empty list".padEnd(spaceToColumn), () => {
    const input = "     ";
    assert.deepEqual(parseArgv(input), []);
  });

  test("mixed escaped quotes + spaces".padEnd(spaceToColumn), () => {
    const input = `cmd "he said \\"hi\\" today" arg2`;
    assert.deepEqual(parseArgv(input), ["cmd", 'he said "hi" today', "arg2"]);
  });
});
