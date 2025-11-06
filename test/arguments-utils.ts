import assert from "node:assert";
import { describe, it } from "node:test";

import {
  decoupleFlags,
  isOptionArgument,
  optionArgumentToVariableNames,
  transformOptionToArgument,
} from "../src/parse/parser-helpers.ts";
import { err, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

describe("Testing Arguments Utils".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it(transformOptionToArgument.name.padEnd(spaceToColumn + spaceColumnEnd), () => {
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
      assert.equal(transformOptionToArgument(key), value, err(`"${key}" should be transformed to "${value}"`));
    }
  });

  it(isOptionArgument.name.padEnd(spaceToColumn + spaceColumnEnd), () => {
    const testValues = new Map([
      ["--input", true],
      ["--input-dir", true],
      ["--help", true],
      ["-i", true],
      ["--i", false],
    ]);

    for (const [key, value] of testValues) {
      assert.equal(isOptionArgument(key), value, err(`"${key}" should${value ? "" : " not"} be an option argument.`));
    }
  });

  it(optionArgumentToVariableNames.name.padEnd(spaceToColumn + spaceColumnEnd), () => {
    const testValues = new Map([
      ["-i", new Set(["i", "I"])],
      ["--input", new Set(["input", "Input", "INPUT"])],
      ["--input-dir", new Set(["inputDir", "InputDir", "input_dir", "INPUT_DIR"])],
    ]);

    for (const [key, value] of testValues) {
      const results = optionArgumentToVariableNames(key);

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

  it(decoupleFlags.name.padEnd(spaceToColumn + spaceColumnEnd), () => {
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
