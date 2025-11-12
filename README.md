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
  - [Sharing options and typed arguments](#sharing-options-and-typed-arguments)
  - [Using Schemas](#using-schemas)
  - [Default Values and Optional Inputs](#default-values-and-optional-inputs)
  - [Positionals vs Typed Arguments](#positionals-vs-typed-arguments)
  - [Option and Argument Constraints](#option-and-argument-constraints)
  - [Negating a boolean option](#negating-a-boolean-option)
  - [Execute commands programmatically](#execute-commands-programmatically)
  - [Creating a Custom Help Message Style](#creating-a-custom-help-message-style)
  - [Help Message as HTML](#help-message-as-html)
- [API Reference](#api-reference)
  - [Type Utilities](docs/api-reference.md#type-utilities)
  - [Coerce Helpers](docs/api-reference.md#coerce-helpers)
  - [Markdown Generation](docs/api-reference.md#markdown-generation)
  - [Autocompletion Script Generation](docs/api-reference.md#autocompletion-script-generation)
  - [Help Message](docs/api-reference.md#help-message)
  - [PrintHelpOptions](docs/api-reference.md#printhelpoptions)
  - [Cli](docs/api-reference.md#cli)
  - [Subcommand](docs/api-reference.md#subcommand)
  - [Option](docs/api-reference.md#option)
  - [Argument](docs/api-reference.md#argument)
  - [Context Type](docs/api-reference.md#context-type)
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

const cli = defineCLI({
  cliName: "hello",
  options: {
    name: {
      schema: z.string().default("world"),
    },
  },
});

cli.onExecute(({ options }) => {
  console.log(`Hello, ${options.name}!`);
});

const result = cli.run(process.argv.slice(2));
if (result.error) {
  console.error(result.error.message);
  process.exit(1);
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
import * as z from "zod";
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

### Sharing options and typed arguments

Options and typed arguments can be shared between subcommands/main CLI.

```ts
// shared.ts
import * as z from "zod";
import { defineArguments, defineOptions, coerce } from "zod-args-parser";

export const sharedOptions = defineOptions({
  verbose: {
    schema: z.boolean().optional(),
    coerce: coerce.boolean,
    meta: {
      description: "Enable verbose mode.",
    },
  },
});

export const sharedArguments = defineArguments({
  // ...
});
```

```ts
// add-command.ts
import * as z from "zod";
import { defineSubcommand, coerce } from "zod-args-parser";

import { sharedOptions, sharedArguments } from "./shared.ts";

export const addCommand = defineSubcommand({
  //...

  options: {
    // ...
    ...sharedOptions,
  },

  arguments: {
    // ...
    ...sharedArguments,
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

Boolean flags are `true` when they appear on the command line.  
Prefixing a flag with `--no-` inverts its final value.

When a value is explicitly assigned (`=true` or `=false`), the assignment is applied first, then the `--no-` prefix flips the result.

Examples:

```sh
--bool           true
--no-bool        false
```

```sh
--bool=true      true
--bool=false     false
```

```sh
--no-bool=true   false   # assigned true → inverted
--no-bool=false  true    # assigned false → inverted
```

Short-form flags follow the same logic, but do **not** accept `=value` syntax:

```sh
-v               true
--no-v           false
```

```sh
-v=true          ERROR
-v=false         ERROR
```

```sh
--no-v=true      false
--no-v=false     true
```

### Execute commands programmatically

You can execute the main CLI or a specific subcommand directly from code.  
The input is provided as an object (`{ options, arguments, positionals }`) and is validated using the defined schemas.  
Invalid input throws an error. Use `.executeAsync()` if your `onExecute` handler is asynchronous.

> [!NOTE]  
> `run()` is like calling the CLI from the terminal.
> `execute()` is like calling a function directly.

```ts
import { InferOptionsInputType } from "zod-args-parser";

import { listyCLI } from "./cli.ts";

// In this example, Listy only defines options — no typed arguments or positionals.
// To keep the function simple, we accept only the options as input.

/** @throws {Error} */
export function executeListy(options: InferOptionsInputType<typeof listyCLI>) {
  listyCLI.execute({ options });
}

/** @throws {Error} */
export async function executeListyAsync(options: InferOptionsInputType<typeof listyCLI>) {
  await listyCLI.executeAsync({ options });
}
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

See the [API Reference](docs/api-reference.md) for more information.

## License

**zod-args-parser** library is licensed under [**The MIT License.**](https://github.com/alabsi91/zod-args-parser/blob/main/LICENSE)
