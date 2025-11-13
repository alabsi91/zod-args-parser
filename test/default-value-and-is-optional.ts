import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { defaultValueAndIsOptional } from "../src/utilities/schema-utilities.ts";
import { spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

describe(defaultValueAndIsOptional.name.padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it(`z.string()`.padEnd(spaceToColumn + spaceColumnEnd), () => {
    const schema = z.string();
    const { defaultValue, optional: isOptional } = defaultValueAndIsOptional(schema);
    assert.equal(defaultValue, undefined);
    assert.equal(isOptional, false);
  });

  it(`z.string().optional()`.padEnd(spaceToColumn + spaceColumnEnd), () => {
    const schema = z.string().optional();
    const { defaultValue, optional: isOptional } = defaultValueAndIsOptional(schema);
    assert.equal(defaultValue, undefined);
    assert.equal(isOptional, true);
  });

  it(`z.string().default("true")`.padEnd(spaceToColumn + spaceColumnEnd), () => {
    const schema = z.string().default("true");
    const { defaultValue, optional: isOptional } = defaultValueAndIsOptional(schema);
    assert.equal(defaultValue, "true");
    assert.equal(isOptional, true);
  });
});
