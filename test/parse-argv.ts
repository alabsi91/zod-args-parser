import assert from "node:assert";
import test, { describe } from "node:test";

import { parseArgv } from "../src/utilities/parse-argv.ts";
import { expectsSuccess, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const valueExpected = new Map([
  // no args
  ["", []],

  // only spaces
  ["   ", []],

  // spaced args
  [`  first    second    third `, ["first", "second", "third"]],

  // single quoted args
  [`'first' 'second' 'third'`, ["first", "second", "third"]],
  [`"first" "second" "third"`, ["first", "second", "third"]],

  // one word two kinds of quotes
  [`"'hello'"`, ["'hello'"]],
  [`'"hello"'`, ['"hello"']],

  // double quotes: start - middle - end
  [`"start quote" then args`, ["start quote", "then", "args"]],
  [`first "middle quote" then args`, ["first", "middle quote", "then", "args"]],
  [`first second "end quote"`, ["first", "second", "end quote"]],

  // single quotes: start - middle - end
  [`'start quote' then args`, ["start quote", "then", "args"]],
  [`first 'middle quote' then args`, ["first", "middle quote", "then", "args"]],
  [`first second 'end quote'`, ["first", "second", "end quote"]],

  // double quotes has escaped quotes
  [`"hello \\"world\\""`, ['hello "world"']],

  // single quotes has escaped quotes
  [`'hello \\'world\\''`, ["hello 'world'"]],

  // single quotes has double quotes
  [`'hello "world"'`, ['hello "world"']],

  // double quotes has single quotes
  [`"hello 'world'"`, ["hello 'world'"]],

  // options with quotes
  [`--option='hello world'`, ["--option=hello world"]],
  [`--option="hello world"`, ["--option=hello world"]],
  [`--option='hello "world"'`, ['--option=hello "world"']],
  [`--option="hello 'world'"`, ["--option=hello 'world'"]],
  [`--option="hello \\"world\\""`, ['--option=hello "world"']],
  [`--option='hello \\'world\\''`, ["--option=hello 'world'"]],

  // escaped spaces
  [`one\\ two three`, ["one\\", "two", "three"]],
]);

describe("Testing Arguments Utils".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  for (const [value, expected] of valueExpected.entries()) {
    test(value.padEnd(spaceToColumn) + expectsSuccess, () => {
      const result = parseArgv(value);
      assert.deepEqual(result, expected);
    });
  }
});
