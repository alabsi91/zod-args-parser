import assert from "node:assert";
import { describe, it } from "node:test";
import * as z from "zod";

import { coerce, defineCLI } from "../src/index.ts";
import { err, expectsFailure, expectsSuccess, spaceColumnEnd, spaceToColumn } from "./test-utils.ts";

const defaultDB = {
  host: "localhost",
  port: 5432,
  https: false,
  credentials: {
    user: "postgres",
    pass: "postgres",
  },
};

const cli = defineCLI({
  cliName: "test-cli",
  options: {
    db: {
      schema: z
        .object({
          host: z.string().default("localhost"),
          port: z.coerce.number().default(5432),
          https: z.boolean().default(false),
          credentials: z.object({ user: z.string(), pass: z.string() }),
        })
        .default(defaultDB),
      coerce: coerce.object({coerceBoolean: ["https"], coerceNumber: ["port"]}),
    },
  },
});

describe("Object option".padEnd(spaceToColumn + spaceColumnEnd + 2), () => {
  it("No arguments provided".padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run([]);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    assert.deepStrictEqual(result.value.options.db, defaultDB, err("Invalid value for option `db`."));
  });

  const _1 = "--db.https=true --db.credentials.user=root --db.credentials.pass=toor";
  it(_1.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(_1);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const expected = {
      host: "localhost",
      port: 5432,
      https: true,
      credentials: { user: "root", pass: "toor" },
    };

    assert.deepStrictEqual(result.value.options.db, expected, err("Invalid value for option `db`."));
  });

  const _2 = "--db.https true --db.credentials.user root --db.credentials.pass toor --db.port 3000";
  it(_2.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(_2);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const expected = {
      host: "localhost",
      port: 3000,
      https: true,
      credentials: { user: "root", pass: "toor" },
    };

    assert.deepStrictEqual(result.value.options.db, expected, err("Invalid value for option `db`."));
  });

  const _3 = "--db.https=true --db.host=prod-db --db.credentials.user=alice --db.credentials.pass=secret";
  it(_3.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(_3);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const expected = {
      host: "prod-db",
      port: 5432,
      https: true,
      credentials: { user: "alice", pass: "secret" },
    };

    assert.deepStrictEqual(result.value.options.db, expected, err("Invalid value for option `db`."));
  });

  const _4 = `--db '{"host": "prod-db", "https": true, "credentials": {"user": "alice", "pass": "secret"}}'`;
  it(_4.padEnd(spaceToColumn) + expectsSuccess, () => {
    const result = cli.run(_4);
    if (result.error) {
      assert.fail(err("Parsing failed with the error message:", result.error.message));
    }

    const expected = {
      host: "prod-db",
      port: 5432,
      https: true,
      credentials: { user: "alice", pass: "secret" },
    };

    assert.deepStrictEqual(result.value.options.db, expected, err("Invalid value for option `db`."));
  });

  it("--db".padEnd(spaceToColumn) + expectsFailure, () => {
    const result = cli.run(["--db"]);
    assert(!result.value, err("Invalid option `--db`. Expected failure, but parsing succeeded."));
  });
});
