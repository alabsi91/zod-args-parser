# zod-args-parser

[![npm](https://img.shields.io/npm/v/zod-args-parser?style=for-the-badge)](https://www.npmjs.com/package/zod-args-parser)
[![GitHub](https://img.shields.io/github/license/alabsi91/zod-args-parser?style=for-the-badge)](https://github.com/alabsi91/zod-args-parser/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/alabsi91/zod-args-parser?style=for-the-badge)](https://github.com/alabsi91/zod-args-parser/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)

A strictly typed command-line arguments parser powered by schema validation.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Guide](#guide)
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
  - [Type Utilities](#type-utilities)
  - [Cli Definition](#cli-definition)
  - [Subcommand Definition](#subcommand-definition)
  - [Option Definition](#option-definition)
  - [Argument Definition](#argument-definition)
- [Example](#example)
- [License](#license)

## Features

- **Strict TypeScript typing** backed by schema **validation**.
- **Flag coupling support**: e.g., `-rf` to combine `-r` and `-f` flags.
- **Negative flag support**: e.g., `--no-verbose` to negate `--verbose`.
- **Flexible option value formatting**: Supports both `--input-dir path` and `--input-dir=path` styles.
- **Help message generation**: Built-in methods to generate help text for the CLI and each subcommand with markdown support.
- **Auto completion**: Generate shell (bash, zsh, powershell) completion scripts for your CLI.
- **Documentation**: Generate a markdown documentation for your CLI.

## Installation

> [!IMPORTANT]  
> A validation library is needed that supports **StandardSchemaV1** like `zod`, `arktype`, `yup`, `valibot`.

```bash
npm install zod zod-args-parser
```

## Usage

The following example is using `zod` as the validation library but you can use any validation library that supports **StandardSchemaV1** as long as its support optional and default values for primitive types.

```ts
import { defineCLI, coerce } from "zod-args-parser";
import * as z from "zod";

// Define the CLI program (main command)
const listyCLI = defineCLI({
  cliName: "listy",

  subcommands: [
    // ...
  ],

  options: {
    // The name of the option `--help`
    // you can use camelCase, PascalCase, snake_case, or SCREAMING_SNAKE_CASE.
    help: {
      schema: z.boolean().optional(),

      // Terminal input is a string, so we need to coerce it to a boolean
      coerce: coerce.boolean,
    },
  },

  arguments: {
    // ...
  },
});

// When the CLI (main command) is executed
listyCLI.onExecute(results => {
  const { help, version } = results.options;

  // print help for CLI
  if (help && listyCLI.formatCliHelpMessage) {
    const helpMessage = listyCLI.formatCliHelpMessage({ style: helpMessageStyles.default });
    console.log(helpMessage);
    return;
  }

  console.error("Please try `listy --help`");
});

// optionally expose a function to execute the main command programmatically
export const executeListy = (help: boolean) => {
  listyCLI.execute({ options: { help: help } });
};

// Run the CLI and pass in the command line arguments
const results = listyCLI.run(process.argv.slice(2));

// ! Error
if (results.error) {
  console.error(results.error.message);
  console.log("\n`listy --help` for more information");
}
```

## Guide

### Subcommands

- Subcommands are defined using the `defineSubcommand` function.

### Type Schemas

Other validation libraries can be used as long as they support **StandardSchemaV1** and allows for optional and default values for primitive types.

| Vendor   | optional string          | string with default               |
| -------- | ------------------------ | --------------------------------- |
| Zod      | `z.string().optional()`  | `z.string().default("value")`     |
| Valibot  | `v.optional(v.string())` | `v.optional(v.string(), "value")` |
| Decoders | `d.optional(v.string())` | `d.optional(v.string(), "value")` |
| Sury     | `S.optional(v.string())` | `S.optional(v.string(), "value")` |

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

### Positionals

### Help Message

### API Reference

#### Type Utilities

- `InferInputType<T extends Cli | Subcommand>`  
  Infer options, arguments, and positionals input types from the CLI/subcommand definition.
- `InferOutputType<T extends Cli | Subcommand>`  
  Infer options, arguments, and positionals output types from the CLI/subcommand definition.
- `inferOptionsInputType<T extends Cli | Subcommand>`  
  Infer options input type from the CLI/subcommand definition.
- `inferOptionsOutputType<T extends Cli | Subcommand>`  
  Infer options output type from the CLI/subcommand definition.
- `inferArgumentsInputType<T extends Cli | Subcommand>`  
  Infer arguments input type from the CLI/subcommand definition.
- `inferArgumentsOutputType<T extends Cli | Subcommand>`  
  Infer arguments output type from the CLI/subcommand definition.

```ts
import type { defineSubcommand, InferInputType, InferOutputType } from "zod-args-parser";

const subcommand = defineSubcommand({
  // ...
});

type InputType = InferInputType<typeof subcommand>;
type OutputType = InferOutputType<typeof subcommand>;
```

#### Cli Definition

| Property            | Type                       | Description                                                                                                                                                                                     |
| ------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cliName`           | `string`                   | The name of the CLI program (main command).                                                                                                                                                     |
| `subcommands?`      | `Subcommand[]`             | Array of subcommands. Do not pass them directly; use `defineSubcommand`. See [`Subcommand Definition`](#subcommand-definition).                                                                 |
| `allowPositionals?` | `boolean`                  | When `true`, enables positional arguments for the CLI; positionals are untyped `string[]`. If typed `arguments` are present, they are parsed first and any remaining args become `positionals`. |
| `options?`          | `Record<string, Option>`   | A dictionary of option definitions keyed by a valid JavaScript variable name (e.g., `inputDir` → `--input-dir`). See [`Option Definition`](#option-definition).                                 |
| `arguments?`        | `Record<string, Argument>` | Strictly ordered, typed arguments (order matters). See [`Argument Definition`](#argument-definition).                                                                                           |
| `meta?`             | `CliMeta`                  | Metadata for the CLI used for help messages and documentation generation.                                                                                                                       |

**CliMeta**

| Property               | Type     | Description                                                                                                                     |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `usage?`               | `string` | Usage string example (e.g., `cliName subcommand [options] <arg1> <arg2>`).                                                      |
| `description?`         | `string` | Short explanation. Supports multi-line text and ANSI colors. Preferred for terminal output when present.                        |
| `descriptionMarkdown?` | `string` | Markdown-formatted description used for generated documentation and terminal markdown. Used for Markdown generation if present. |
| `example?`             | `string` | Example shown to the user (displayed as a code block in Markdown).                                                              |

#### Subcommand Definition

| Property            | Type                       | Description                                                                                                                                                                                             |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | `string`                   | The subcommand name. Must be unique within a CLI across names and aliases.                                                                                                                              |
| `aliases?`          | `string[]`                 | A list of aliases that can be used to invoke this subcommand. Must not collide with other names or aliases in the same CLI.                                                                             |
| `allowPositionals?` | `boolean`                  | When `true`, enables positional arguments for this subcommand. Positionals are untyped `string[]`. If typed `arguments` are present, they are parsed first and any remaining args become `positionals`. |
| `options?`          | `Record<string, Option>`   | A dictionary of option definitions keyed by a valid JavaScript variable name (e.g., `inputDir` → `--input-dir`). See [`Option Definition`](#option-definition).                                         |
| `arguments?`        | `Record<string, Argument>` | Strictly ordered, typed arguments (the order matters). [`Argument Definition`](#argument-definition).                                                                                                   |
| `meta?`             | `SubcommandMeta`           | Metadata used for help messages and documentation generation. Inlined in the table below.                                                                                                               |

**SubcommandMeta**

| Property               | Type      | Description                                                                                                                                                                                                 |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `placeholder?`         | `string`  | Text to display as a placeholder for expected arguments (e.g. `[options] <arg1> <arg2>`).                                                                                                                   |
| `usage?`               | `string`  | Usage string example (e.g. `cliName subcommand [options] <arg1> <arg2>`).                                                                                                                                   |
| `description?`         | `string`  | Short explanation. Supports multi-line text and ANSI color styles. Preferred for terminal output if both `description` and `descriptionMarkdown` are provided.                                              |
| `descriptionMarkdown?` | `string`  | Markdown-formatted description used for generated documentation and terminal markdown. If both `description` and `descriptionMarkdown` are provided, `descriptionMarkdown` is used for Markdown generation. |
| `example?`             | `string`  | Example shown to the user (displayed inside a code block in markdown).                                                                                                                                      |
| `hidden?`              | `boolean` | When `true`, hide this item from documentation/help output. Useful for internal or undocumented commands/options.                                                                                           |

#### Option Definition

| Property        | Type                         | Description                                                                                                                                                   |
| --------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aliases?`      | `string[]`                   | A list of short alias keys (JavaScript variable names) that map to short CLI flags (e.g., `i` → `-i`).                                                        |
| `schema`        | `Schema`                     | A schema to validate the user input. Use an object schema with the key `value` to specify the type (e.g., Zod: `z.object({ value: z.string().optional() })`). |
| `coerce`        | `(input: string) => unknown` | Coercion function used to convert terminal `string` input to the schema's expected type. Use provided `coerce` helpers.                                       |
| `exclusive?`    | `boolean`                    | When `true`, this option must appear on its own (except for entries listed in `requires`). Defaults to `false`.                                               |
| `requires?`     | `string[]`                   | Names of other options/arguments that must be explicitly provided when this option is used (defaults do not satisfy this requirement).                        |
| `conflictWith?` | `string[]`                   | Names of other options/arguments that conflict with this option; supplying both results in an error. Defaults do not trigger conflicts.                       |
| `meta?`         | `OptionMeta`                 | Metadata used for help messages and documentation generation. Inlined in the table below.                                                                     |

**OptionMeta**

| OptionMeta Property | Type      | Description                                                                                    |
| ------------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `placeholder?`      | `string`  | Text to display as a placeholder for the expected value (e.g., `<path>`).                      |
| `default?`          | `string`  | Custom default value shown in docs/help. Use an empty string to intentionally show no default. |
| `optional?`         | `boolean` | Override whether this option is considered optional in the generated help documentation.       |

#### Argument Definition

| Property        | Type                | Description                                                                                                                             |
| --------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `schema`        | `Schema`            | Schema to validate the user input. Use an object schema with the key `value` to specify the type.                                       |
| `coerce`        | `CoerceMethod<...>` | Coercion function used to convert string input to the schema's output type.                                                             |
| `exclusive?`    | `boolean`           | When `true`, this argument must appear on its own (except for items listed in `requires`).                                              |
| `requires?`     | `string[]`          | Names of other options/arguments that must be explicitly provided when this argument is used. Defaults do not satisfy this requirement. |
| `conflictWith?` | `string[]`          | Names of other options/arguments that conflict with this argument; supplying both results in an error.                                  |
| `meta?`         | `ArgumentMeta`      | Metadata used for help messages and documentation generation. Inlined in the table below.                                               |

**ArgumentMeta**

| Property    | Type      | Description                                                                                    |
| ----------- | --------- | ---------------------------------------------------------------------------------------------- |
| `name?`     | `string`  | Override the argument name in the help message and documentation.                              |
| `default?`  | `string`  | Custom default value shown in docs/help. Use an empty string to intentionally show no default. |
| `optional?` | `boolean` | Override whether this argument is considered optional in the generated help documentation.     |

## Example

- [Example code](https://github.com/alabsi91/zod-args-parser/tree/main/example)

## License

**zod-args-parser** library is licensed under [**The MIT License.**](https://github.com/alabsi91/zod-args-parser/blob/main/LICENSE)
