# zod-args-parser

[![npm](https://img.shields.io/npm/v/zod-args-parser?style=for-the-badge)](https://www.npmjs.com/package/zod-args-parser)
[![GitHub](https://img.shields.io/github/license/alabsi91/zod-args-parser?style=for-the-badge)](https://github.com/alabsi91/zod-args-parser/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/alabsi91/zod-args-parser?style=for-the-badge)](https://github.com/alabsi91/zod-args-parser/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)

A strictly typed command-line arguments parser powered by [Zod](https://github.com/colinhacks/zod).

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Guid](#guid)
  - [Subcommands](#subcommands)
  - [Type Zod Schemas](#type-zod-schemas)
  - [Options](#options)
  - [Arguments](#arguments)
  - [Positionals](#positionals)
  - [Pre-Validation Hook](#pre-validation-hook)
  - [Help Message](#help-message)
  - [Zod Utilities](#zod-utilities)
  - [Type Utilities](#type-utilities)
- [API Reference](#api-reference)
  - [Methods](#methods)
  - [Types](#types)
- [Example](#example)
- [License](#license)

## Features

- **Strict typing for subcommands, options, and arguments**.
- **Flag coupling support**: e.g., `-rf` to combine `-r` and `-f` flags.
- **Negative flag support**: e.g., `--no-verbose` to negate `--verbose`.
- **Flexible option value formatting**: Supports both `--input-dir path` and `--input-dir=path` styles.
- **Help message generation**: Built-in methods to generate help text for the CLI and each subcommand.
- **Auto completion**: Generate shell (bash, zsh, powershell) completion scripts for your CLI.
- **Documentation**: Generate a markdown documentation for your CLI.

## Installation

> [!IMPORTANT]  
> `zod` version `3.25.0` or later (including `4.0.0`) is required.

```bash
npm install zod chalk zod-args-parser
```

## Usage

```ts
import * as z from "zod";
import { createCli, createSubcommand, createOptions, safeParse } from "zod-args-parser";

// Share options between schemas.
const sharedOptions = createOptions([
  {
    name: "verbose",
    description: "Verbose mode",
    type: z.boolean().optional(),
  },
]);

// Create the CLI program schema
// This will be used when no subcommands are run
const cliSchema = createCli({
  cliName: "my-cli",
  description: "A description for my CLI",
  example: "example of how to use my cli\nmy-cli --help",
  options: [
    {
      name: "help",
      aliases: ["h"],
      type: z.boolean().optional().describe("Show this help message"),
    },
    {
      name: "version",
      aliases: ["v"],
      description: "Show version",
      type: z.boolean().optional(),
    },
    ...sharedOptions,
  ],
});

// Execute this function when the CLI is run (no subcommands)
cliSchema.setAction(results => {
  const { help, version, verbose } = results;

  if (help) {
    results.printCliHelp();
    return;
  }

  if (version) {
    console.log("v1.0.0");
    return;
  }

  if (verbose) {
    console.log("Verbose mode enabled");
  }
});

// Create a subcommand schema
const helpCommandSchema = createSubcommand({
  name: "help",
  placeholder: "<command>",
  description: "Print help message for command",
  arguments: [
    {
      name: "command",
      description: "Command to print help for",
      type: z.enum(["build", "help", "init"]).optional(),
    },
  ],
});

// Execute this function when the `help` subcommand is run
helpCommandSchema.setAction(results => {
  const [command] = results.arguments;
  if (command) {
    results.printSubcommandHelp(command);
    return;
  }

  results.printCliHelp();
});

const schemas = [cliSchema, helpCommandSchema /* Add more subcommands */] as const;

const results = safeParse(process.argv.slice(2), ...schemas);

// ! Error
if (!results.success) {
  console.error(results.error.message);
  console.log("\n`my-cli --help` for more information, or `my-cli help <command>` for command-specific help\n");
  process.exit(1);
}
```

## Guid

### Subcommands

- Subcommands are defined using the `createSubcommand` function, which accepts an object with the type [`Subcommand`](#subcommand).
- The following properties are optional and used only for **metadata** such as help messages and documentation:
  - `description`
  - `usage`
  - `example`
  - `placeholder`
- Do not reuse the same subcommand name within the same CLI. TypeScript will throw a type error if a duplicate exist.

```ts
import { createSubcommand } from "zod-args-parser";

const subcommand = createSubcommand({
  name: "subcommand",
  description: "Description for the subcommand",
  usage: "my-cli subcommand [options] [arguments]",
  example: "subcommand --help",
  placeholder: "[options] [arguments]",
  allowPositional: false, // default: false
  options: [
    /* options */
  ],
  arguments: [
    /* arguments */
  ],
});

// Executed when the subcommand is run after parsing before validation
subcommand.setPreValidationHook(ctx => {
  // ...
});

// Executed when the subcommand is run
subcommand.setAction(results => {
  // ...
});
```

### Type Zod Schemas

- A schema with `.optional()` or `.default(<value>)` is treated as **optional**; all others are **required**.
- Descriptions can be added either via the Zod schema’s `describe` method or the `description` property.

> [!IMPORTANT]  
>  All values from the terminal are passed as **strings**, so **coercion** is required except for simple booleans types which are inferred automatically.

```ts
import * as z from "zod";

// String examples
z.string(); // required -> string
z.string().optional(); // optional -> string | undefined
z.string().default("hello"); // optional -> string

// Boolean examples (simple booleans are inferred automatically no need to use coerce)
z.boolean(); // required -> boolean
z.boolean().optional(); // optional -> boolean | undefined
z.boolean().default(true); // optional -> boolean

// Number examples (need coercion because terminal inputs are strings)
z.number(); // 🚫 invalid: will always throw
z.coerce.number(); // ✅ converts string input -> number

// String boolean (zod v4) -> boolean
z.stringbool({
  truthy: ["true", "1", "yes", "on", "y", "enabled"],
  falsy: ["false", "0", "no", "off", "n", "disabled"],
});

// Enum -> "a" | "b" | "c"
z.enum(["a", "b", "c"]);

// Union -> number | "development"
z.union([z.coerce.number(), z.literal("development")]);

// Custom preprocessing:
import { stringToArray, stringToSet } from "zod-args-parser";

// Array -> string[]
z.preprocess((value: string) => stringToArray(value), z.string().array());

// Tuple -> [string, number, boolean]
z.preprocess(
  (value: string) => stringToArray(value, ";"), // second arg is the separator (default: ",")
  z.tuple([z.string(), z.coerce.number(), z.coerce.boolean()]),
);

// Set -> Set<string>
z.preprocess((value: string) => stringToSet(value), z.set(z.string()));
```

### Options

- Option names and aliases must use a valid **JavaScript** variable name.
  - **Supports:** `camelCase`, `PascalCase`, `snake_case`, and `SCREAMING_SNAKE_CASE`.
  - **Examples:**
    - `I` or `i` ➡️ `-i`
    - `InputDir`, `inputDir`, or `INPUT_DIR` ➡️ `--input-dir`
    - `Help`, `help`, or `HELP` ➡️ `--help`
- Do not use same options/aliases name with different casing.
- Do not reuse the option/alias name within the same CLI/subcommand. TypeScript will throw a type error if duplicates exist.
- The following properties are optional and used only for **metadata** such as help messages and documentation:
  - `description`
  - `example`
  - `placeholder`

See the [Option](#option) type for more details.

```ts
import * as z from "zod";
import { createCli } from "zod-args-parser";

// Define the CLI schema
const cliSchema = createCli({
  cliName: "my-cli",
  options: [
    {
      name: "inputDir", // camelCase option name becomes `--input-dir`
      aliases: ["i"], // single-letter alias becomes `-i`
      type: z.boolean().default(false), // optional because of default
      description: "Input directory",
      placeholder: "<dir>",
      example: "-i /path/to/dir",
    },
    {
      name: "verbose", // another option
      aliases: ["v"], // alias `-v`
      type: z.boolean().optional().describe("Enable verbose mode"), // using describe() instead of description
    },
  ],
});

// Define the CLI action
cliSchema.setAction(results => {
  const { inputDir, verbose } = results.options;

  // inputDir: boolean (optional, with default = false)
  // verbose: boolean | undefined (optional, no default)
});
```

### Arguments

- Arguments are strictly typed **positional values**, defined as a tuple: `[arg1, arg2, arg3]`.
- Each argument must have a **name**, which is used for help messages and documentation. TypeScript will throw a type error if duplicates name exist within the same CLI/subcommand.
- The following properties are optional and used only for **metadata**:
  - `description`
  - `example`

> [!IMPORTANT]  
>  Arguments are parsed strictly **in order**.
>
> - Only the **last argument** may be optional (when `allowPositional` is disabled).
> - Mixing required and optional arguments (e.g., required → optional → required) will cause parsing errors because the parser cannot determine which value belongs to which argument.
> - This means you **cannot have any optional arguments** if `allowPositional` is enabled.
> - TypeScript will throw a type error if required and optional arguments are mixed, or when using `allowPositional: true` with optional arguments.

See the [Argument](#argument) type for more details.

```ts
import * as z from "zod";
import { createCli } from "zod-args-parser";

// Define the CLI schema
const cliSchema = createCli({
  cliName: "my-cli",
  arguments: [
    {
      name: "inputFile", // argument name (camelCase for consistency)
      type: z.string(), // required
      description: "Input file",
      example: "input.txt",
    },
    {
      name: "outputFile", // second argument
      type: z.string().optional(), // optional (only allowed as the last arg)
      description: "Output file",
      example: "output.txt",
    },
  ],
});

// Define the CLI action
cliSchema.setAction(results => {
  const [inputFile, outputFile] = results.arguments;

  // inputFile: string (required)
  // outputFile: string | undefined (optional, no default)
});
```

### Positionals

- Positionals are untyped **positional values**, always parsed as `string[]` of any length.
- By default, positionals are **not allowed**. Enable them using the `allowPositional` option.

> [!IMPORTANT]  
>  If both typed arguments and positionals are used in the same CLI/subcommand, the **typed arguments are parsed first**, and only then are the remaining values collected as positionals.

```ts
import { createSubcommand } from "zod-args-parser";

// Define the subcommand schema
export const countSchema = createSubcommand({
  name: "count",
  aliases: ["list"],
  description: "Print a list of items provided by the user",
  allowPositional: true, // enable positionals
});

// Define the subcommand action
countSchema.setAction(results => {
  const items = results.positional; // string[]

  if (items.length === 0) {
    console.log("No items provided");
    return;
  }

  console.log("-- List of items --\n -", items.join("\n - "));
});
```

### Pre-Validation Hook

- The `preValidationHook` is called after parsing but before validation.
- The provided context object can be modified before validation for advanced use cases.
- When using **async** hooks, make sure to call [`parseAsync`](#parseasync) or [`safeParseAsync`](#parseasync).

See the [Context](#context) type for more details.

```ts
import * as z from "zod";
import { createCli } from "zod-args-parser";

// Define the CLI schema
const cliSchema = createCli({
  cliName: "my-cli",
  options: [
    { name: "inputDir", type: z.string() },
    { name: "verbose", type: z.boolean().default(false) },
  ],
  arguments: [
    { name: "first-argument", type: z.string() },
    { name: "second-argument", type: z.string().optional() },
  ],
});

// Define the pre-validation hook
cliSchema.setPreValidationHook(ctx => {
  if (ctx.options.verbose.source === "default") {
    ctx.options.verbose.rawValue = "true";
  }

  if (ctx.arguments[0].source === "cli") {
    console.log("first-argument:", ctx.arguments[0].rawValue);
  }
});

// Define the CLI action
cliSchema.setAction(results => {
  // can access `ctx` here
  console.log(results.ctx.options.verbose);
});
```

### Help Message

Cli help message example preview

<img width="1153" height="682" alt="image" src="https://github.com/user-attachments/assets/5610e5d0-8c08-4776-bbfc-b8e655241c39" /><br>

Subcommand help message example preview

<img width="1115" height="522" alt="image" src="https://github.com/user-attachments/assets/2a56a549-4059-45c4-84d2-93adaedaaac8" /><br>

There are two ways to print the help message:

1. `printCliHelp(style?: HelpMsgStyle)`  
   Print the help message for the CLI.

2. `printSubcommandHelp(subcommandName: string, style?: HelpMsgStyle)`  
   Print the help message for a specific subcommand.

See the [HelpMsgStyle](#helpmsgstyle) type for more details.

```ts
import chalk from "chalk";
import { formatCliHelpMsg, formatSubcommandHelpMsg, helpMsgStyles } from "zod-args-parser";

// Define the CLI schema
const cliSchema = createCli(/* ... */);

// Define the subcommand schema
const subcommandSchema = createSubcommand(/* ... */);

subcommandSchema.setAction(results => {
  // print help for CLI (without colors)
  results.printCliHelp(helpMsgStyles.noColors);

  // choose a style
  results.printCliHelp(helpMsgStyles.dracula);

  // print help for subcommand (with custom title color)
  results.printSubcommandHelp("build", { title: chalk.red });
});

const schemas = [cliSchema, subcommandSchema] as const;

// print help functions also accessible here
const results = safeParse(args, ...schemas);
if (results.success) {
  results.printCliHelp();
}

// get the string without printing to console
const cliHelp = formatCliHelpMsg(schemas, helpMsgStyles.html);
console.log(`<pre style="background-color: #1e1e2e">${cliHelp}</pre>`);

const subcommandHelp = formatSubcommandHelpMsg(subcommandSchema, helpMsgStyles.html, cliSchema.cliName);
console.log(`<pre style="background-color: #1e1e2e">${subcommandHelp}</pre>`);
```

### Zod Utilities

- `isOptionalSchema(schema: ZodTypeAny): boolean`  
  Check if a schema is optional or has a default value.

- `schemaDefaultValue(schema: ZodTypeAny): unknown | undefined`  
  Get the default value of a schema if it has one.

- `stringToArray(value: string, separator?: string = ","): string[]`  
  A preprocessing handle to convert a string to an array.

- `stringToSet(value: string, separator?: string = ","): Set<string>`  
  A preprocessing handle to convert a string to a set.

```ts
import * as z from "zod";
import { createCli, isOptionalSchema, schemaDefaultValue, stringToArray } from "zod-args-parser";

const cliSchema = createCli({
  cliName: "my-cli",
  options: [
    {
      name: "tags",
      aliases: ["t"],
      placeholder: "<list>",
      description: "tags separated by semicolon (;)",
      example: "--tags tag1;tag2;tag3",
      type: z.preprocess((value: string) => stringToArray(value, ";"), z.array(z.string())),
    },
    {
      name: "verbose",
      aliases: ["v"],
      description: "Verbose mode",
      type: z.boolean().default(false),
    },
  ],
});

cliSchema.setAction(results => {
  const ctxOptions = results.ctx.options;

  console.log(
    isOptionalSchema(ctxOptions.verbose.schema), // true
    schemaDefaultValue(ctxOptions.verbose.schema), // false
  );
});
```

### Type Utilities

- `InferOptionsInput<Cli | Subcommand>`  
  Infer the options input type (before zod validation) from the Cli or subcommand schema.

- `InferOptionsOutput<Cli | Subcommand>`  
  Infer the options Output type (after zod validation) from the Cli or subcommand schema.

- `InferArgumentsInput<Cli | Subcommand>`  
  Infer the arguments input type (before zod validation) from the Cli or subcommand schema.

- `InferArgumentsOutput<Cli | Subcommand>`  
  Infer the arguments Output type (after zod validation) from the Cli or subcommand schema.

```ts
import { createSubcommand } from "zod-args-parser";
import type { InferOptionsOutput, InferArgumentsOutput } from "zod-args-parser";

const subcommand = createSubcommand({
  name: "subcommand",
  options: [
    { name: "numberOption", type: z.coerce.number() },
    { name: "stringOption", type: z.string() },
    { name: "booleanOption", type: z.boolean() },
    { name: "optionalOption", type: z.boolean().optional() },
  ],
  arguments: [
    { name: "stringArgument", type: z.string() },
    { name: "numberArgument", type: z.coerce.number() },
    { name: "booleanArgument", type: z.boolean() },
  ],
});

type Options = InferOptionsOutput<typeof subcommand>;
// { numberOption: number; stringOption: string; booleanOption: boolean; optionalOption?: boolean | undefined; }

type Arguments = InferArgumentsOutput<typeof subcommand>;
// [string, number, boolean]
```

## API Reference

### Methods

#### createCli

`(schema: Cli) => Cli & SetMethods<Cli>`

Creates the CLI program schema.

See [Cli](#cli) object type.

#### createSubcommand

`(schema: Subcommand) => Subcommand & SetMethods<Subcommand>`

Creates the subcommand schema.

See [Subcommand](#subcommand) object type.

#### createOptions

`(schema: Option[]) => Option[]`

Creates an array of option schemas for option sharing.

See [Option](#option) object type.

#### createArguments

`(schema: Argument[]) => Argument[]`

Creates an array of argument schemas for argument sharing.

See [Argument](#argument) object type.

#### parse

`(args: string[], cli: Cli, ...subcommands: Subcommand[]) => Result`

Parses and validates the provided arguments and throws an error if parsing or validation failed.

See [Cli](#cli), [Subcommand](#subcommand), and [Results](#results)

#### parseAsync

`(args: string[], cli: Cli, ...subcommands: Subcommand[]) => Promise<Result>`

Same as [`parse`](#parse), but returns a promise.  
Use this when you have async actions or hooks.

See [Cli](#cli), [Subcommand](#subcommand), and [Results](#results)

#### safeParse

`(args: string[], cli: Cli, ...subcommands: Subcommand[]) => { success: false, error: Error } | { success: true, data: Result }`

Parses and validates the provided arguments without throwing an error.

See [Cli](#cli), [Subcommand](#subcommand), and [Results](#results)

#### safeParseAsync

`(args: string[], cli: Cli, ...subcommands: Subcommand[]) => Promise<...>`

Same as [`safeParse`](#safeparse), but returns a promise.  
Use this when you have async actions or hooks.

See [Cli](#cli), [Subcommand](#subcommand), and [Results](#results)

#### generateBashAutocompleteScript

`(...params: [Cli, ...Subcommand[]]) => string`

Generates an autocomplete script for `bash`.

See [Cli](#cli) and [Subcommand](#subcommand)

#### generatePowerShellAutocompleteScript

`(...params: [Cli, ...Subcommand[]]) => string`

Generates an autocomplete script for `powershell`.

See [Cli](#cli) and [Subcommand](#subcommand)

#### generateZshAutocompleteScript

`(...params: [Cli, ...Subcommand[]]) => string`

Generates an autocomplete script for `zsh`.

See [Cli](#cli) and [Subcommand](#subcommand)

#### generateMarkdown

`(...params: [Cli, ...Subcommand[]]) => string`

Generates a markdown documentation for your CLI.

See [Cli](#cli) and [Subcommand](#subcommand)

### Types

#### Cli

| Name            | Type                       | Description                                    | Example                        |
| --------------- | -------------------------- | ---------------------------------------------- | ------------------------------ |
| cliName         | `string`                   | The name of the CLI program.                   | `"my-cli"`                     |
| description     | `string?`                  | A description of the CLI for the help message. | `"Build the project"`          |
| usage           | `string?`                  | The usage of the CLI for the help message.     | `"my-cli build"`               |
| example         | `string?`                  | An example of CLI usage for the help message.  | `"my-cli <command> [options]"` |
| options         | [`Option[]?`](#option)     | An array of options for the CLI.               |                                |
| arguments       | [`Argument[]?`](#argument) | An array of arguments for the CLI.             |                                |
| allowPositional | `boolean?`                 | Allows positional arguments for the CLI.       |                                |

#### Subcommand

| Name            | Type                       | Description                                           | Example                    |
| --------------- | -------------------------- | ----------------------------------------------------- | -------------------------- |
| name            | `string`                   | The name of the subcommand.                           | `"build"`                  |
| aliases         | `string[]?`                | An array of aliases for the subcommand.               | `["b", "build"]`           |
| description     | `string?`                  | A description of the subcommand for the help message. | `"Build the project"`      |
| usage           | `string?`                  | The usage of the subcommand for the help message.     | `"my-cli build"`           |
| placeholder     | `string?`                  | A placeholder displayed in the help message.          | `"[options]"`              |
| example         | `string?`                  | An example of subcommand usage for the help message.  | `"my-cli build [options]"` |
| options         | [`Option[]?`](#option)     | An array of options for the subcommand.               |                            |
| arguments       | [`Argument[]?`](#argument) | An array of arguments for the subcommand.             |                            |
| allowPositional | `boolean?`                 | Allows positional arguments for this subcommand.      |                            |

#### Option

| Name        | Type        | Description                                          | Example                         |
| ----------- | ----------- | ---------------------------------------------------- | ------------------------------- |
| name        | `string`    | The name of the option. camelCase is recommended.    | `"inputDir"` -> `--input-dir`   |
| type        | `ZodType`   | Specifies the type of the option using Zod schema.   | `z.boolean().default(false)`    |
| aliases     | `string[]?` | An array of aliases for the option.                  | `["i", "dir"]` -> `-i`, `--dir` |
| description | `string?`   | A description of the option for the help message.    | `"Input directory"`             |
| placeholder | `string?`   | Placeholder text for the option in the help message. | `"<dir>"` or `"<path>"`         |
| example     | `string?`   | An example of option usage for the help message.     | `"-i /path/to/dir"`             |

#### Argument

| Name        | Type      | Description                                          | Example                             |
| ----------- | --------- | ---------------------------------------------------- | ----------------------------------- |
| name        | `string`  | The name of the argument for the help message.       | `"command-name"`                    |
| type        | `ZodType` | Specifies the type of the argument using Zod schema. | `z.enum(["build", "help", "init"])` |
| description | `string?` | A description of the argument for the help message.  | `"Command to print help for"`       |
| example     | `string?` | An example of argument usage for the help message.   | `"help build"`                      |

#### Context

The context object is generated after parsing the CLI arguments and before validation.

| Name       | Type                                     | Description                                                                                              |
| ---------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| subcommand | `string \| undefined`                    | The name of the executed subcommand.                                                                     |
| options    | `{ [OptionName: string]: ParsedOption }` | A map of parsed options for the CLI/subcommand.                                                          |
| arguments  | `ParsedArgument[] \| undefined`          | An array of parsed arguments for the CLI/subcommand. See [`ParsedArgument`](#parsedargument)             |
| positional | `string[] \| undefined`                  | Contains positional arguments when `allowPositional` is enabled. See [`ParsedArgument`](#parsedargument) |

##### ParsedOption

| Name     | Type                  | Description                                                                                    |
| -------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| name     | `string`              | The name of the option (e.g. `foo` or `f`).                                                    |
| flag     | `string \| undefined` | The CLI flag as provided in the terminal (e.g. `--foo` or `-f`).                               |
| schema   | `ZodTypeAny`          | The schema that validates this option.                                                         |
| rawValue | `string \| undefined` | The string value as provided in the terminal. boolean flags are inferred into boolean strings. |
| source   | `"cli" \| "default"`  | `cli`: provided explicitly in the CLI, `default`: not provided, and the schema has a default.  |

##### ParsedArgument

| Name     | Type                  | Description                                                                                   |
| -------- | --------------------- | --------------------------------------------------------------------------------------------- |
| schema   | `ZodTypeAny`          | The schema that validates this argument.                                                      |
| rawValue | `string \| undefined` | The raw string value supplied for this argument from the CLI.                                 |
| source   | `"cli" \| "default"`  | `cli`: provided explicitly in the CLI, `default`: not provided, and the schema has a default. |

#### Results

| Name                   | Type                                                 | Description                                                                           |
| ---------------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------- |
| subcommand             | `string \| undefined`                                | The name of the executed subcommand.                                                  |
| `[optionName: string]` | `unknown`                                            | Validated options for the CLI/subcommand.                                             |
| arguments              | `unknown[] \| undefined`                             | Validated arguments for the CLI/subcommand.                                           |
| positional             | `string[] \| undefined`                              | Positional array for the CLI/subcommand.                                              |
| printCliHelp           | `(style?: HelpMsgStyle) => void`                     | Prints the CLI help message. See [HelpMsgStyle](#helpmsgstyle)                        |
| printSubcommandHelp    | `(subcommand: string, style?: HelpMsgStyle) => void` | Prints the help message for a specified subcommand. See [HelpMsgStyle](#helpmsgstyle) |

#### HelpMsgStyle

Available styles: `default`, `dracula`, `solarizedDark`, `nord`, `html`, `gruvboxDark`, `monokai`, `oneDark`, `noColors`

Each style has the following properties:

| Key          | Type                             | Default                |
| ------------ | -------------------------------- | ---------------------- |
| title        | `(...text: unknown[]) => string` | `chalk.bold.blue`      |
| description  | `(...text: unknown[]) => string` | `chalk.white`          |
| default      | `(...text: unknown[]) => string` | `chalk.dim.italic`     |
| optional     | `(...text: unknown[]) => string` | `chalk.dim.italic`     |
| exampleTitle | `(...text: unknown[]) => string` | `chalk.yellow`         |
| example      | `(...text: unknown[]) => string` | `chalk.dim`            |
| command      | `(...text: unknown[]) => string` | `chalk.yellow`         |
| option       | `(...text: unknown[]) => string` | `chalk.cyan`           |
| argument     | `(...text: unknown[]) => string` | `chalk.green`          |
| placeholder  | `(...text: unknown[]) => string` | `chalk.hex("#FF9800")` |
| punctuation  | `(...text: unknown[]) => string` | `chalk.white.dim`      |

## Example

- [Example code](https://github.com/alabsi91/zod-args-parser/tree/main/example)

## License

**zod-args-parser** library is licensed under [**The MIT License.**](https://github.com/alabsi91/zod-args-parser/blob/main/LICENSE)
