# zod-args-parser

[![npm](https://img.shields.io/npm/v/zod-args-parser?style=for-the-badge)](https://www.npmjs.com/package/zod-args-parser)
[![GitHub](https://img.shields.io/github/license/alabsi91/zod-args-parser?style=for-the-badge)](https://github.com/alabsi91/zod-args-parser/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/alabsi91/zod-args-parser?style=for-the-badge)](https://github.com/alabsi91/zod-args-parser/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)

A strictly typed command-line arguments parser powered by schema validation.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Example](#example)
- [Guide](#guide)
  - [Creating a subcommand](#creating-a-subcommand)
  - [Creating options](#creating-options)
  - [Creating typed arguments](#creating-typed-arguments)
  - [Using Schemas](#using-schemas)
  - [Default Values and Optional Inputs](#default-values-and-optional-inputs)
  - [Positionals vs Typed Arguments](#positionals-vs-typed-arguments)
  - [Option and Argument Constraints](#option-and-argument-constraints)
  - [Negating a boolean option](#negating-a-boolean-option)
  - [Creating a Custom Help Message Style](#creating-a-custom-help-message-style)
  - [Help Message as HTML](#help-message-as-html)
- [API Reference](#api-reference)
  - [Type Utilities](#type-utilities)
  - [Coerce Helpers](#coerce-helpers)
  - [Markdown Generation](#markdown-generation)
  - [Autocompletion Script Generation](#autocompletion-script-generation)
  - [Help Message](#help-message)
  - [PrintHelpOptions](#printhelpoptions)
  - [Cli](#cli)
  - [Subcommand](#subcommand)
  - [Option](#option)
  - [Argument](#argument)
  - [Context Type](#context-type)
- [License](#license)

## Features

- **Strictly typed & validated**: Fully TypeScript-typed CLI arguments, backed by schema validation.
- **Flexible option syntax**: Supports both `--option value` and `--option=value`.
- **Boolean flags**: Handles negation (`--no-verbose`) and short flag coupling (`-rf`).
- **Typed subcommands**: Define subcommands with their own typed options and arguments.
- **Automatic help & docs**: Generate user-friendly CLI help messages and Markdown documentation.
- **Shell autocompletion**: Auto-generate scripts for Bash, Zsh, and PowerShell.
- **Schema-agnostic**: Works with any validation library supporting [`StandardSchemaV1`](https://github.com/standard-schema/standard-schema) and default/optional primitives.
- **Cross-platform**: Fully supports Node.js, Bun, Deno, and modern browsers.

## Installation

> [!IMPORTANT]  
> A validation library is required that supports [`StandardSchemaV1`](https://github.com/standard-schema/standard-schema) and allows primitive types to be optional or have default values.

```bash
npm install zod zod-args-parser
```

## Usage

The following example uses `zod` as the validation library, but you can use any library that supports [`StandardSchemaV1`](https://github.com/standard-schema/standard-schema), as long as it allows primitive types to be optional or have default values.

```ts
import * as z from "zod";
import { defineCLI, coerce } from "zod-args-parser";

// Define the CLI program (main command)
const listyCLI = defineCLI({
  cliName: "listy",

  subcommands: [
    // ...
  ],

  options: {
    help: {
      schema: z.boolean().optional(),
      coerce: coerce.boolean,
    },
  },

  arguments: {
    // ...
  },
});

// When the CLI (main command) is executed
listyCLI.onExecute(results => {
  const { help } = results.options;

  // print help for the CLI
  if (help && listyCLI.generateCliHelpMessage) {
    console.log(listyCLI.generateCliHelpMessage());
    return;
  }

  console.error("Please try `listy --help`");
});

// Run the CLI and pass in the command line arguments
const results = listyCLI.run(process.argv.slice(2));

// Inspect parsed results
if (results.error) {
  console.error(results.error.message);
  console.log("\n`listy --help` for more information");
}
```

## Example

- [Listy CLI Example](https://github.com/alabsi91/zod-args-parser/tree/main/example)

## Guide

### Creating a subcommand

Subcommands are defined using the `defineSubcommand` function, which accepts a [`Subcommand`](#subcommand) definition object.

```ts
import { defineSubcommand, helpMessageStyles } from "zod-args-parser";

import type { InferInputType, InferOutputType } from "zod-args-parser";

const createListCommand = defineSubcommand({
  // The name used to call this subcommand from the CLI
  name: "add",

  // Additional names that can be used to run the same subcommand
  aliases: ["cl", "create"],

  // When true: positional (untyped) arguments are allowed and parsed as string[]
  // When typed arguments exist: they are parsed first, and leftover arguments become `positionals`
  allowPositionals: false,

  // Extra information used for CLI help output and generated documentation
  meta: {
    // Shown in the terminal when displaying the help text for this subcommand
    // Ignored in Markdown docs
    usage: "listy add --list <list> --items <items> --tags <tags>",

    // Shown in terminal help alongside the subcommand name
    // Also shown in Markdown docs next to the subcommand name
    placeholder: "<list> <items> <tags>",

    // Shown in terminal help if both description and descriptionMarkdown exist
    // Not preferred in Markdown docs
    description: "Plain text description shown in terminal help when both formats are provided.",

    // Used as-is in Markdown docs and preferred over `description`
    // When printed in the terminal, it will be parsed by `marked` and formatted for the terminal output
    descriptionMarkdown: "**Formatted** for terminal and preferred when generating **Markdown documentation**.",

    // Displayed at the bottom of terminal help
    // In Markdown docs, it is output inside a code block
    example:
      "listy add --list groceries --items egg,milk,bread --tags food\n" +
      "listy add --list todos --items clean,cook --tags chores|work",

    // If true, this subcommand is hidden from both help output and documentation
    // Useful for internal commands
    hidden: false,
  },

  // Available CLI options for this subcommand
  options: {
    // ...
  },

  // Typed command-line arguments for this subcommand
  arguments: {
    // ...
  },
});

// Runs when the subcommand is executed
// Multiple handlers can be attached if needed
const unsubscribe = createListCommand.onExecute(results => {
  const { ...options } = results.options;
  const { ...args } = results.arguments;
  const positionals = results.positionals;

  // Inspect parsed results in detail
  console.log(results.context.options);

  // Print help for this subcommand
  if (createListCommand.generateSubcommandHelpMessage) {
    console.log(
      createListCommand.generateSubcommandHelpMessage(results.subcommand, { style: helpMessageStyles.default }),
    );
    return;
  }

  // Print help for the CLI
  if (listyCLI.generateCliHelpMessage) {
    console.log(listyCLI.generateCliHelpMessage({ style: helpMessageStyles.default }));
    return;
  }
});

// Programmatic API for executing this subcommand
export const executeCreateListCommand = createListCommand.execute;

// Useful inferred types for input/output payloads
type CreateListInput = InferInputType<typeof createListCommand>;
type CreateListOutput = InferOutputType<typeof createListCommand>;
```

### Creating options

Options can be defined directly inside the CLI or subcommand definition. Or using the `defineOptions` function.

Option names can use any common case style:
`camelCase`, `PascalCase`, `snake_case`, or `SCREAMING_SNAKE_CASE`.

- ListName `=>` --list-name
- list-name `=>` --list-name
- listName `=>` --list-name
- LIST_NAME `=>` --list-name

```ts
import { defineSubcommand, coerce } from "zod-args-parser";

const createListCommand = defineSubcommand({
  // ...

  options: {
    // The key is the option name
    listName: {
      // Aliases generate equivalent flags (e.g. -n, --name)
      aliases: ["list", "name", "n"],

      // Required string for this option
      schema: z.string(),

      // Converts the raw terminal input into a string.
      // In this case, because the schema already expects a string, this coercion is redundant
      coerce: coerce.string,

      // When true: this option cannot appear alongside other options/arguments,
      // except those listed in `requires`
      exclusive: false,

      // If this option is used, the listed options/arguments must also be provided
      requires: [],

      // Options/arguments that cannot be used together with this one
      // Avoid using `conflictWith` when `exclusive` is true
      conflictWith: [],

      // Extra metadata used for help output and documentation
      meta: {
        // Shown next to the option name in terminal help and Markdown docs
        placeholder: "<list> <items> <tags>",

        // Displayed in terminal help if both descriptions exist
        // Not preferred in Markdown
        description: "Plain text description shown in terminal help when both formats are provided.",

        // Preferred in Markdown and kept formatted when printed in terminal output
        descriptionMarkdown: "**Formatted** for terminal and preferred when generating **Markdown documentation**.",

        // Appears at the end of this option’s description in terminal help
        // Rendered inside a code block in Markdown
        example:
          "listy add --list groceries --items egg,milk,bread --tags food\n" +
          "listy add --list todos --items clean,cook --tags chores|work",

        // Shows this value as the default in help/docs (does not change runtime default)
        default: `"default-list"`,

        // Shows this option as optional/required in help/docs (visual override only)
        optional: false,

        // When true, hides this option from both help output and docs
        hidden: false,
      },
    },

    items: {
      schema: z.string().array(),
      // Parses comma-separated lists into string[]
      coerce: coerce.stringArray(","),
    },

    tags: {
      schema: z.enum(["food", "work", "chores"]).array(),
      // Parses pipe-separated tags into Set<string>
      coerce: coerce.stringSet("|"),
    },
  },
});
```

### Creating typed arguments

Arguments can be defined directly inside the CLI or subcommand definition. Or using the `defineArguments` function.

The order of argument definitions matters.

**Rules**:

1. If `allowPositionals: true` → typed arguments cannot be optional.
2. If `allowPositionals: false` → only the last typed argument may be optional.
3. Argument names cannot be numeric, because it affects argument ordering.

```ts
import { defineSubcommand, coerce } from "zod-args-parser";

const createListCommand = defineSubcommand({
  arguments: {
    // In help output, argument names are automatically converted to kebab-case by default.
    argumentName: {
      // Same fields as options, but arguments do not support aliases
      schema: z.string(),
      coerce: coerce.string, // redundant (the input is already a string)
      exclusive: false,
      requires: [],
      conflictWith: [],
      meta: {
        // Overrides the displayed argument name in help and documentation
        name: "argument-name",

        // Other meta fields work the same way as option metadata
      },
    },
  },
});
```

### Using schemas

Other validation libraries can be used as long as they support [`StandardSchemaV1`](https://github.com/standard-schema/standard-schema) and allow primitive types to be optional or have default values.

Here are some examples:

| Vendor   | `string?`                | `string="value"`                  | coerce          |
| -------- | ------------------------ | --------------------------------- | --------------- |
| Zod      | `z.string().optional()`  | `z.string().default("value")`     | `coerce.string` |
| Valibot  | `v.optional(v.string())` | `v.optional(v.string(), "value")` | `coerce.string` |
| Decoders | `d.optional(v.string())` | `d.optional(v.string(), "value")` | `coerce.string` |
| Sury     | `S.optional(v.string())` | `S.optional(v.string(), "value")` | `coerce.string` |

| Vendor   | `string[]?`                       | `string[]=["value"]`                         | coerce                    |
| -------- | --------------------------------- | -------------------------------------------- | ------------------------- |
| Zod      | `z.array(z.string()).optional()`  | `z.array(z.string()).default(["value"])`     | `coerce.stringArray(",")` |
| Valibot  | `v.optional(v.array(v.string()))` | `v.optional(v.array(v.string()), ["value"])` | `coerce.stringArray(",")` |
| Decoders | `d.optional(d.array(d.string))`   | `d.optional(d.array(d.string), ["value"])`   | `coerce.stringArray(",")` |
| Sury     | `S.optional(S.array(S.string))`   | `S.optional(S.array(S.string), ["value"])`   | `coerce.stringArray(",")` |

### Default Values and Optional Inputs

- Optional values and defaults for **options and typed arguments** are controlled by the schema used for validation.
- `meta.optional` and `meta.default` only affect help/documentation output; they do **not** affect runtime behavior.
- The CLI parser enforces types and applies defaults according to the schema.
- Example schemas:
  - `z.string().optional()` → optional input
  - `z.string().default("value")` → input with default value

### Positionals vs Typed Arguments

Think of typed arguments as **reserved seats** at the front of the line, and positionals as **everyone standing behind them**.

- Typed arguments are filled **in order from left to right**.
- Any remaining inputs become positionals **only if `allowPositionals: true`**.

#### Rules

| Setting                   | Behavior                                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `allowPositionals: true`  | Typed arguments are parsed first. Remaining inputs go into `positionals`. Typed arguments **cannot** be optional in this mode. |
| `allowPositionals: false` | All inputs must match typed arguments. Only the **last** typed argument may be optional. Extra inputs cause an error.          |

### Option and Argument Constraints

Both options and typed arguments support rules to control valid combinations:

#### `exclusive: boolean`

- Cannot be used together with other options or arguments, except those explicitly listed in `requires`.

#### `requires: string[]`

- Lists other options/arguments names (not aliases) that **must be provided** if this one is used.
- Helps enforce dependencies between flags or arguments.

#### `conflictWith: string[]`

- Lists other options/arguments names (not aliases) that **cannot be used together** with this one.
- Prevents incompatible combinations and avoids ambiguous behavior.

### Negating a boolean option

Boolean options can be negated by prefixing them with `no-` or by using the equals sign `=`.

```sh
--bool        true
--no-bool     false

--bool=true   true
--bool=false  false

-v            true
--no-v        false
```

### Creating a Custom Help Message Style

You can define a custom style for CLI help messages by implementing the `HelpMessageStyle` interface. A common approach is to start from an existing style and override only the parts you want.

```ts
import chalk from "chalk";
import { HelpMessageStyle, helpMessageStyles } from "zod-args-parser";

// Example: create a new style based on the default style
const myCustomStyle = new HelpMessageStyle(
  {
    title: chalk.bold.magenta,
    option: chalk.yellow,
    argument: chalk.green,
  },
  // optionally use default style as base
  helpMessageStyles.default,
);

// Use the custom style when generating help
console.log(myCli.generateCliHelpMessage({ style: myCustomStyle }));
```

### Help Message as HTML

You can generate the CLI help message as HTML using the `html` style and insert it into a `<pre>` element.

```ts
import { listyCLI, helpMessageStyles, generateCliHelpMessage } from "zod-args-parser";

// Generate help message as HTML string
const htmlHelp = generateCliHelpMessage(listyCLI, { style: helpMessageStyles.html, markdownRenderer: "html" });

// Insert into a <pre> element in your page
const pre = document.createElement("pre");
pre.innerHTML = htmlHelp;
document.body.appendChild(pre);
```

You can style Markdown content using CSS:

```css
span._markdown * {
  white-space: initial;
}
```

## API Reference

### Type Utilities

#### `InferInputType<T extends Cli | Subcommand>`

Infer options, arguments, and positionals input types from the CLI/subcommand definition.

#### `InferOutputType<T extends Cli | Subcommand>`

Infer options, arguments, and positionals output types from the CLI/subcommand definition.

#### `InferOptionsInputType<T extends Cli | Subcommand>`

Infer options input type from the CLI/subcommand definition.

#### `InferOptionsOutputType<T extends Cli | Subcommand>`

Infer options output type from the CLI/subcommand definition.

#### `InferArgumentsInputType<T extends Cli | Subcommand>`

Infer arguments input type from the CLI/subcommand definition.

#### `InferArgumentsOutputType<T extends Cli | Subcommand>`

Infer arguments output type from the CLI/subcommand definition.

```ts
import type { defineSubcommand, InferInputType, InferOutputType } from "zod-args-parser";

const subcommand = defineSubcommand({
  // ...
});

type InputType = InferInputType<typeof subcommand>;
type OutputType = InferOutputType<typeof subcommand>;
```

### Coerce Helpers

- `coerce.string`
- `coerce.number`
- `coerce.boolean`
- `coerce.stringArray(separator: string)`
- `coerce.numberArray(separator: string)`
- `coerce.booleanArray(separator: string)`
- `coerce.stringSet(separator: string)`
- `coerce.numberSet(separator: string)`
- `coerce.booleanSet(separator: string)`
- `coerce.json<T>()`

### Markdown Generation

#### generateMarkdown

`(cliDefinition: Cli) => string`

Generate markdown documentation for a **CLI definition** and return it as a `string`.

### Autocomplete Script Generation

#### generateBashAutocompleteScript

`(cliDefinition: Cli) => string`

Generate a Bash autocomplete script for a **CLI definition** and return it as a `string`.

#### generateZshAutocompleteScript

`(cliDefinition: Cli) => string`

Generate a zsh autocomplete script for a **CLI definition** and return it as a `string`.

#### generatePowerShellAutocompleteScript

`(cliDefinition: Cli) => string`

Generate a PowerShell autocomplete script for a **CLI definition** and return it as a `string`.

### Help Message

#### generateCliHelpMessage

`(cliDefinition: Cli, printOptions?: PrintHelpOptions) => string`

Generate a help message for a **CLI definition** and return it as a `string`.  
See [`PrintHelpOptions`](#printhelpoptions) and [`Cli`](#cli).

#### generateSubcommandHelpMessage

`(commandDefinition: Subcommand, options?: PrintHelpOptions, cliName?: string) => string`

Generate a help message for a **subcommand definition** and return it as a `string`.  
See [`PrintHelpOptions`](#printhelpoptions) and [`Subcommand`](#subcommand).

#### printCliHelp

`(cliDefinition: Cli, options?: PrintHelpOptions) => void`

Print a help message for a **CLI definition**.  
See [`PrintHelpOptions`](#printhelpoptions) and [`Cli`](#cli).

#### printSubcommandHelp

`(commandDefinition: Subcommand, options?: PrintHelpOptions, cliName?: string) => void`

Print a help message for a **subcommand definition**.  
See [`PrintHelpOptions`](#printhelpoptions) and [`Subcommand`](#subcommand).

### PrintHelpOptions

| Option                  | Type                   | Default                     | Description                                                                         |
| ----------------------- | ---------------------- | --------------------------- | ----------------------------------------------------------------------------------- |
| style                   | `HelpMessageStyle`     | `helpMessageStyles.default` | The style to use for the help message.                                              |
| kebabCaseArgumentName   | `boolean`              | `true`                      | Whether to transform the argument (not option) name to kebab case.                  |
| markdownRenderer        | `"terminal" \| "html"` | `"terminal"`                | The renderer to use for the markdown.                                               |
| indentBeforeName        | `number`               | `2`                         | The number of spaces before the name of option/argument/subcommand.                 |
| indentAfterName         | `number`               | `4`                         | Spaces after the name, between the name and description (space between columns).    |
| indentBeforePlaceholder | `number`               | `1`                         | The number of spaces to put before the placeholder.                                 |
| newLineIndent           | `number`               | `0`                         | Spaces before a new line for description or example under description.              |
| emptyLines              | `number`               | `0`                         | Number of empty lines between lines.                                                |
| emptyLinesBeforeTitle   | `number`               | `1`                         | Number of empty lines before the title.                                             |
| emptyLinesAfterTitle    | `number`               | `0`                         | Number of empty lines after the title.                                              |
| exampleKeyword          | `string`               | `"Example:"`                | The keyword to use for examples.                                                    |
| optionalKeyword         | `string`               | `"(optional)"`              | The keyword to use for optional values.                                             |
| defaultKeyword          | `string`               | `"(default: {{ value }})"`  | The keyword to indicate default values, with `{{ value }}` replaced by the default. |
| usageTitle              | `string`               | `"USAGE"`                   | The title to use for the usage section.                                             |
| descriptionTitle        | `string`               | `"DESCRIPTION"`             | The title to use for the description section.                                       |
| commandsTitle           | `string`               | `"COMMANDS"`                | The title to use for the commands section.                                          |
| optionsTitle            | `string`               | `"OPTIONS"`                 | The title to use for the options section.                                           |
| argumentsTitle          | `string`               | `"ARGUMENTS"`               | The title to use for the arguments section.                                         |
| exampleTitle            | `string`               | `"EXAMPLE"`                 | The title to use for the examples section.                                          |

### Cli

| Property            | Type                       | Description                                                                                                                                                                                          |
| ------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cliName`           | `string`                   | The name of the CLI program (main command).                                                                                                                                                          |
| `subcommands?`      | `Subcommand[]`             | Array of subcommands. Do not manually construct subcommand objects; always create them via `defineSubcommand()` and pass the returned object. See [`Subcommand Definition`](#subcommand-definition). |
| `allowPositionals?` | `boolean`                  | When `true`, enables positional arguments for the CLI; positionals are untyped `string[]`. If typed `arguments` are present, they are parsed first and any remaining args become `positionals`.      |
| `options?`          | `Record<string, Option>`   | A dictionary of option definitions keyed by a valid JavaScript variable name (e.g., `inputDir` → `--input-dir`). See [`Option Definition`](#option-definition).                                      |
| `arguments?`        | `Record<string, Argument>` | Strictly ordered typed arguments. See [`Argument Definition`](#argument-definition).                                                                                                                 |
| `meta?`             | `CliMeta`                  | Metadata for the CLI used for help messages and documentation generation.                                                                                                                            |

### CliMeta

| Property               | Type     | Description                                                                                                                     |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `usage?`               | `string` | Usage string example (e.g., `cliName subcommand [options] <arg1> <arg2>`).                                                      |
| `description?`         | `string` | Short explanation. Supports multi-line text and ANSI colors. Preferred for terminal output when present.                        |
| `descriptionMarkdown?` | `string` | Markdown-formatted description used for generated documentation and terminal markdown. Used for Markdown generation if present. |
| `example?`             | `string` | Examples shown to the user (displayed as a code block in Markdown).                                                             |

### Subcommand

| Property            | Type                       | Description                                                                                                                                                                                             |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | `string`                   | The subcommand name. Must be unique within a CLI across names and aliases.                                                                                                                              |
| `aliases?`          | `string[]`                 | A list of aliases that can be used to invoke this subcommand. Must not collide with other names or aliases in the same CLI.                                                                             |
| `allowPositionals?` | `boolean`                  | When `true`, enables positional arguments for this subcommand. Positionals are untyped `string[]`. If typed `arguments` are present, they are parsed first and any remaining args become `positionals`. |
| `options?`          | `Record<string, Option>`   | A dictionary of option definitions keyed by a valid JavaScript variable name (e.g., `inputDir` → `--input-dir`). See [`Option Definition`](#option-definition).                                         |
| `arguments?`        | `Record<string, Argument>` | Strictly ordered, typed arguments (the order matters). [`Argument Definition`](#argument-definition).                                                                                                   |
| `meta?`             | `SubcommandMeta`           | Metadata used for help messages and documentation generation. Inlined in the table below.                                                                                                               |

### SubcommandMeta

| Property               | Type      | Description                                                                                                                                                                                                 |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `placeholder?`         | `string`  | Text displayed after the subcommand name to show expected arguments (e.g., `<list> <items>`).                                                                                                               |
| `usage?`               | `string`  | Usage string example (e.g. `cliName subcommand [options] <arg1> <arg2>`).                                                                                                                                   |
| `description?`         | `string`  | Short explanation. Supports multi-line text and ANSI color styles. Preferred for terminal output if both `description` and `descriptionMarkdown` are provided.                                              |
| `descriptionMarkdown?` | `string`  | Markdown-formatted description used for generated documentation and terminal markdown. If both `description` and `descriptionMarkdown` are provided, `descriptionMarkdown` is used for Markdown generation. |
| `example?`             | `string`  | Examples shown to the user (displayed inside a code block in markdown).                                                                                                                                     |
| `hidden?`              | `boolean` | When `true`, hide this item from documentation/help output. Useful for internal or undocumented commands/options.                                                                                           |

### Option

| Property        | Type                | Description                                                                                                                          |
| --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `aliases?`      | `string[]`          | A list of short alias keys (JavaScript variable names) that map to short CLI flags (e.g., `i` → `-i`).                               |
| `schema`        | `Schema`            | A schema to validate the user input. (e.g., Zod: `z.string().optional()`).                                                           |
| `coerce?`       | `CoerceMethod<...>` | Coercion function used to convert `string` input to the schema's output type. Not required when the expected input type is `string`. |
| `exclusive?`    | `boolean`           | When `true`, this option must appear on its own (except for entries listed in `requires`).                                           |
| `requires?`     | `string[]`          | Names of other options/arguments that must be explicitly provided when this option is used.                                          |
| `conflictWith?` | `string[]`          | Names of other options/arguments that conflict with this option.                                                                     |
| `meta?`         | `OptionMeta`        | Metadata used for help messages and documentation generation. Inlined in the table below.                                            |

### OptionMeta

| Property       | Type      | Description                                                                                    |
| -------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `placeholder?` | `string`  | Text to display as a placeholder for the expected value (e.g., `<path>`).                      |
| `default?`     | `string`  | Custom default value shown in docs/help. Use an empty string to intentionally show no default. |
| `optional?`    | `boolean` | Override whether this option is considered optional in the generated help documentation.       |

### Argument

| Property        | Type                | Description                                                                                                                          |
| --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `schema`        | `Schema`            | Schema to validate the user input.                                                                                                   |
| `coerce?`       | `CoerceMethod<...>` | Coercion function used to convert `string` input to the schema's output type. Not required when the expected input type is `string`. |
| `exclusive?`    | `boolean`           | When `true`, this argument must appear on its own (except for items listed in `requires`).                                           |
| `requires?`     | `string[]`          | Names of other options/arguments that must be explicitly provided when this argument is used.                                        |
| `conflictWith?` | `string[]`          | Names of other options/arguments that conflict with this argument.                                                                   |
| `meta?`         | `ArgumentMeta`      | Metadata used for help messages and documentation generation. Inlined in the table below.                                            |

### ArgumentMeta

| Property    | Type      | Description                                                                                    |
| ----------- | --------- | ---------------------------------------------------------------------------------------------- |
| `name?`     | `string`  | Override the argument name in the help message and documentation.                              |
| `default?`  | `string`  | Custom default value shown in help/docs. Use an empty string to intentionally show no default. |
| `optional?` | `boolean` | Override whether this argument is considered optional in the generated help documentation.     |

### Context Type

Represents detailed information about how each option or argument was provided (terminal, default, or programmatic).  
Useful for inspecting where values came from and what raw input was used.

#### Context

| Field         | Type                              | Description                                       |
| ------------- | --------------------------------- | ------------------------------------------------- |
| `subcommand`  | `string` \| `undefined`           | Name of the executed subcommand, if any.          |
| `options`     | `Record<string, OptionContext>`   | Per-option context, with source and raw values.   |
| `arguments`   | `Record<string, ArgumentContext>` | Per-argument context, with source and raw values. |
| `positionals` | `string[]` \| `never`             | Raw positional arguments when allowed.            |

#### OptionContext

| Property       | Description                                                                          |
| -------------- | ------------------------------------------------------------------------------------ |
| `schema`       | Schema used to validate the option.                                                  |
| `optional`     | Whether the option schema is optional.                                               |
| `defaultValue` | Default value from the schema, if any.                                               |
| `flag`         | CLI flag used (e.g., `--foo`, `-f`) when source is `terminal`.                       |
| `stringValue`  | Raw string provided from CLI when source is `terminal`.                              |
| `passedValue`  | Value passed programmatically when source is `programmatic`.                         |
| `source`       | `"terminal"`, `"default"`, or `"programmatic"` indicates how the value was supplied. |

#### ArgumentContext

| Property       | Description                                                                          |
| -------------- | ------------------------------------------------------------------------------------ |
| `schema`       | Schema used to validate the argument.                                                |
| `optional`     | Whether the argument schema is optional.                                             |
| `defaultValue` | Default value from the schema, if any.                                               |
| `stringValue`  | Raw string from CLI when source is `terminal`.                                       |
| `passedValue`  | Value passed programmatically when source is `programmatic`.                         |
| `source`       | `"terminal"`, `"default"`, or `"programmatic"` indicates how the value was supplied. |

## License

**zod-args-parser** library is licensed under [**The MIT License.**](https://github.com/alabsi91/zod-args-parser/blob/main/LICENSE)
