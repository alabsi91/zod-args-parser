# Frequently Asked Questions

### 1. Why do I need to specify a coerce function?

Terminal input is always a string. The coerce function converts it to the type specified in your schema.

- You can omit it only if your schema type is `string`.
- Using the wrong coerce function (producing a type different from the schema) will trigger a TypeScript type error.

---

### 2. What validation library can I use?

**Recommended:** Zod.

Any validation library that supports **StandardSchemaV1**, optional values, and default values for primitive types can be used.

**Examples:** Valibot, Sury, Decoders.

---

### How can I inspect the raw input of options/arguments?

`zod-args-parser` provides detailed **context information** for every option and argument, letting you see **where the value came from** (terminal, default, or programmatic) and the raw input that was provided.

Each executed CLI or subcommand returns a `context` object.

For more details, see [Context Type API reference](./api-reference.md#context-type) for full details.

```ts
cli.onExecute(({ context, options, arguments, positionals }) => {
  const optionContext = context.options.someOption;
  const argContext = context.arguments.someArg;

  // Narrow by source type
  if (optionContext.source === "terminal") {
    console.log("Terminal input:", optionContext.stringValue);
  } else if (optionContext.source === "programmatic") {
    console.log("Programmatic input:", optionContext.passedValue);
  } else if (optionContext.source === "default") {
    console.log("Default value:", optionContext.defaultValue);
  }

  if (argContext.source === "terminal") {
    console.log("Argument terminal input:", argContext.stringValue);
  }
});
```

---

### How do typed arguments differ from positionals?

Typed arguments are **strictly ordered, validated, and typed** values defined in your CLI or subcommand schema, while positionals are **catch-all untyped strings** that come after typed arguments if `allowPositionals: true`.

For more details, see [Positionals vs Typed Arguments](../README.md#positionals-vs-typed-arguments)

**Key differences:**

| Feature                    | Typed Arguments                            | Positionals                           |
| -------------------------- | ------------------------------------------ | ------------------------------------- |
| Validation                 | Validated against the schema               | Not validated                         |
| Type                       | Fully typed according to your schema       | Always `string`                       |
| Order                      | Parsed strictly left-to-right              | Captures remaining inputs             |
| Optional / Default Support | Schema controls optional or default values | Cannot have defaults; always optional |
| Usage in CLI               | Defined in `arguments` property            | Populated automatically if allowed    |

**Example:**

```ts
const cli = defineCLI({
  cliName: "example",

  // typed arguments
  arguments: {
    userId: {
      schema: z.number(),
      coerce: coerce.number,
    },
    action: {
      schema: z.string(),
    },
  },

  // remaining inputs become positionals
  allowPositionals: true,
});

cli.onExecute(({ arguments: args, positionals }) => {
  console.log("Typed:", args.userId, args.action);
  console.log("Positionals:", positionals); // untyped strings
});
```

---

### Can I have nested options?

Yes! Nested options are supported using **structured object options** with `coerce.object`. You can pass either:

1. **Full JSON string**
2. **Dotted flags** to set nested fields individually

The object is validated against a schema, and optional coercions like `coerceBoolean`, `coerceNumber`, `coerceBigint`, or `coerceDate` can be applied. Failed coercions simply fallback to the original string.

For more details, see [Structured Object Options](../README.md#structured-object-options) in the guide.

**Example:**

```ts
const cli = defineCLI({
  cliName: "example",
  options: {
    db: {
      schema: z
        .object({
          host: z.string().default("localhost"),
          port: z.number().default(5432),
          credentials: z.object({ user: z.string(), pass: z.string() }),
        })
        .optional(),
      coerce: coerce.object({ coerceNumber: ["port"] }),
    },
  },
});

cli.onExecute(({ options }) => {
  console.log(options.db?.host, options.db?.port, options.db?.credentials.user);
});
```

**CLI usage examples:**

```sh
# Using dotted flags
example --db.host=prod-db --db.port=3306 --db.credentials.user=alice --db.credentials.pass=secret

# Using full JSON
example --db '{"host":"prod-db","port":3306,"credentials":{"user":"alice","pass":"secret"}}'
```

---

### How do boolean negation flags (--no-flag) work?

Boolean flags are `true` when present on the command line. Prefixing a flag with `--no-` inverts its final value.

If a value is explicitly assigned (`=true` or `=false`), the assignment is applied first, then the `--no-` prefix flips the result.

**Examples:**

```sh
# Long-form flags
--verbose          true
--no-verbose       false

# Explicit assignment + negation
--verbose=true     true
--verbose=false    false
--no-verbose=true  false   # assigned true → inverted
--no-verbose=false true    # assigned false → inverted

# Short-form flags
-v                 true
--no-v             false

# Invalid usage
-v=true            ERROR
-v=false           ERROR
```
