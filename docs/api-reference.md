# API Reference

## Table of Contents

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

## Type Utilities

### `InferInputType<T extends Cli | Subcommand>`

Infer options, arguments, and positionals input types from the CLI/subcommand definition.

### `InferOutputType<T extends Cli | Subcommand>`

Infer options, arguments, and positionals output types from the CLI/subcommand definition.

### `InferOptionsInputType<T extends Cli | Subcommand>`

Infer options input type from the CLI/subcommand definition.

### `InferOptionsOutputType<T extends Cli | Subcommand>`

Infer options output type from the CLI/subcommand definition.

### `InferArgumentsInputType<T extends Cli | Subcommand>`

Infer arguments input type from the CLI/subcommand definition.

### `InferArgumentsOutputType<T extends Cli | Subcommand>`

Infer arguments output type from the CLI/subcommand definition.

```ts
import type { defineSubcommand, InferInputType, InferOutputType } from "zod-args-parser";

const subcommand = defineSubcommand({
  // ...
});

type InputType = InferInputType<typeof subcommand>;
type OutputType = InferOutputType<typeof subcommand>;
```

## Coerce Helpers

- `coerce.string`
- `coerce.number`
- `coerce.boolean`
- `coerce.json`
- `coerce.stringArray(separator: string)`
- `coerce.numberArray(separator: string)`
- `coerce.booleanArray(separator: string)`
- `coerce.stringSet(separator: string)`
- `coerce.numberSet(separator: string)`
- `coerce.booleanSet(separator: string)`
- `coerce.object(options?: ObjectCoerceMethodOptions)`

**ObjectCoerceMethodOptions**

| Option          | Type                  | Description                                                                                                                                          |
| :-------------- | :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `coerceBoolean` | `boolean \| string[]` | Converts `'true'` or `'false'` (case-sensitive) strings to boolean values after JSON parsing. Falls back to the original string if conversion fails. |
| `coerceNumber`  | `boolean \| string[]` | Converts strings matching a valid number pattern to JavaScript numbers. Falls back to the original string if conversion fails.                       |
| `coerceBigint`  | `boolean \| string[]` | Converts integer-like strings to `bigint` values after JSON parsing. Falls back to the original string if conversion fails.                          |
| `coerceDate`    | `boolean \| string[]` | Attempts to convert any string into a `Date` object after JSON parsing. Falls back to the original string if conversion fails.                       |

## Markdown Generation

### generateMarkdown

`(cliDefinition: Cli) => string`

Generate markdown documentation for a **CLI definition** and return it as a `string`.

## Autocomplete Script Generation

### generateBashAutocompleteScript

`(cliDefinition: Cli) => string`

Generate a Bash autocomplete script for a **CLI definition** and return it as a `string`.

### generateZshAutocompleteScript

`(cliDefinition: Cli) => string`

Generate a zsh autocomplete script for a **CLI definition** and return it as a `string`.

### generatePowerShellAutocompleteScript

`(cliDefinition: Cli) => string`

Generate a PowerShell autocomplete script for a **CLI definition** and return it as a `string`.

## Help Message

### generateCliHelpMessage

`(cliDefinition: Cli, printOptions?: PrintHelpOptions) => string`

Generate a help message for a **CLI definition** and return it as a `string`.  
See [`PrintHelpOptions`](#printhelpoptions) and [`Cli`](#cli).

### generateSubcommandHelpMessage

`(commandDefinition: Subcommand, options?: PrintHelpOptions, cliName?: string) => string`

Generate a help message for a **subcommand definition** and return it as a `string`.  
See [`PrintHelpOptions`](#printhelpoptions) and [`Subcommand`](#subcommand).

### printCliHelp

`(cliDefinition: Cli, options?: PrintHelpOptions) => void`

Print a help message for a **CLI definition**.  
See [`PrintHelpOptions`](#printhelpoptions) and [`Cli`](#cli).

### printSubcommandHelp

`(commandDefinition: Subcommand, options?: PrintHelpOptions, cliName?: string) => void`

Print a help message for a **subcommand definition**.  
See [`PrintHelpOptions`](#printhelpoptions) and [`Subcommand`](#subcommand).

## PrintHelpOptions

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

## Cli

| Property            | Type                       | Description                                                                                                                                                                                          |
| ------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cliName`           | `string`                   | The name of the CLI program (main command).                                                                                                                                                          |
| `subcommands?`      | `Subcommand[]`             | Array of subcommands. Do not manually construct subcommand objects; always create them via `defineSubcommand()` and pass the returned object. See [`Subcommand Definition`](#subcommand-definition). |
| `allowPositionals?` | `boolean`                  | When `true`, enables positional arguments for the CLI; positionals are untyped `string[]`. If typed `arguments` are present, they are parsed first and any remaining args become `positionals`.      |
| `options?`          | `Record<string, Option>`   | A dictionary of option definitions keyed by a valid JavaScript variable name (e.g., `inputDir` → `--input-dir`). See [`Option Definition`](#option-definition).                                      |
| `arguments?`        | `Record<string, Argument>` | Strictly ordered typed arguments. See [`Argument Definition`](#argument-definition).                                                                                                                 |
| `meta?`             | `CliMeta`                  | Metadata for the CLI used for help messages and documentation generation.                                                                                                                            |

## CliMeta

| Property               | Type     | Description                                                                                                                     |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `usage?`               | `string` | Usage string example (e.g., `cliName subcommand [options] <arg1> <arg2>`).                                                      |
| `description?`         | `string` | Short explanation. Supports multi-line text and ANSI colors. Preferred for terminal output when present.                        |
| `descriptionMarkdown?` | `string` | Markdown-formatted description used for generated documentation and terminal markdown. Used for Markdown generation if present. |
| `example?`             | `string` | Examples shown to the user (displayed as a code block in Markdown).                                                             |

## Subcommand

| Property            | Type                       | Description                                                                                                                                                                                             |
| ------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`              | `string`                   | The subcommand name. Must be unique within a CLI across names and aliases.                                                                                                                              |
| `aliases?`          | `string[]`                 | A list of aliases that can be used to invoke this subcommand. Must not collide with other names or aliases in the same CLI.                                                                             |
| `allowPositionals?` | `boolean`                  | When `true`, enables positional arguments for this subcommand. Positionals are untyped `string[]`. If typed `arguments` are present, they are parsed first and any remaining args become `positionals`. |
| `options?`          | `Record<string, Option>`   | A dictionary of option definitions keyed by a valid JavaScript variable name (e.g., `inputDir` → `--input-dir`). See [`Option Definition`](#option-definition).                                         |
| `arguments?`        | `Record<string, Argument>` | Strictly ordered, typed arguments (the order matters). [`Argument Definition`](#argument-definition).                                                                                                   |
| `meta?`             | `SubcommandMeta`           | Metadata used for help messages and documentation generation. Inlined in the table below.                                                                                                               |

## SubcommandMeta

| Property               | Type      | Description                                                                                                                                                                                                 |
| ---------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `placeholder?`         | `string`  | Text displayed after the subcommand name to show expected arguments (e.g., `<list> <items>`).                                                                                                               |
| `usage?`               | `string`  | Usage string example (e.g. `cliName subcommand [options] <arg1> <arg2>`).                                                                                                                                   |
| `description?`         | `string`  | Short explanation. Supports multi-line text and ANSI color styles. Preferred for terminal output if both `description` and `descriptionMarkdown` are provided.                                              |
| `descriptionMarkdown?` | `string`  | Markdown-formatted description used for generated documentation and terminal markdown. If both `description` and `descriptionMarkdown` are provided, `descriptionMarkdown` is used for Markdown generation. |
| `example?`             | `string`  | Examples shown to the user (displayed inside a code block in markdown).                                                                                                                                     |
| `hidden?`              | `boolean` | When `true`, hide this item from documentation/help output. Useful for internal or undocumented commands/options.                                                                                           |

## Option

| Property        | Type                | Description                                                                                                                          |
| --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `aliases?`      | `string[]`          | A list of short alias keys (JavaScript variable names) that map to short CLI flags (e.g., `i` → `-i`).                               |
| `schema`        | `Schema`            | A schema to validate the user input. (e.g., Zod: `z.string().optional()`).                                                           |
| `coerce?`       | `CoerceMethod<...>` | Coercion function used to convert `string` input to the schema's output type. Not required when the expected input type is `string`. |
| `exclusive?`    | `boolean`           | When `true`, this option must appear on its own (except for entries listed in `requires`).                                           |
| `requires?`     | `string[]`          | Names of other options/arguments that must be explicitly provided when this option is used.                                          |
| `conflictWith?` | `string[]`          | Names of other options/arguments that conflict with this option.                                                                     |
| `meta?`         | `OptionMeta`        | Metadata used for help messages and documentation generation. Inlined in the table below.                                            |

## OptionMeta

| Property       | Type      | Description                                                                                    |
| -------------- | --------- | ---------------------------------------------------------------------------------------------- |
| `placeholder?` | `string`  | Text to display as a placeholder for the expected value (e.g., `<path>`).                      |
| `default?`     | `string`  | Custom default value shown in docs/help. Use an empty string to intentionally show no default. |
| `optional?`    | `boolean` | Override whether this option is considered optional in the generated help documentation.       |

## Argument

| Property        | Type                | Description                                                                                                                          |
| --------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `schema`        | `Schema`            | Schema to validate the user input.                                                                                                   |
| `coerce?`       | `CoerceMethod<...>` | Coercion function used to convert `string` input to the schema's output type. Not required when the expected input type is `string`. |
| `exclusive?`    | `boolean`           | When `true`, this argument must appear on its own (except for items listed in `requires`).                                           |
| `requires?`     | `string[]`          | Names of other options/arguments that must be explicitly provided when this argument is used.                                        |
| `conflictWith?` | `string[]`          | Names of other options/arguments that conflict with this argument.                                                                   |
| `meta?`         | `ArgumentMeta`      | Metadata used for help messages and documentation generation. Inlined in the table below.                                            |

## ArgumentMeta

| Property    | Type      | Description                                                                                    |
| ----------- | --------- | ---------------------------------------------------------------------------------------------- |
| `name?`     | `string`  | Override the argument name in the help message and documentation.                              |
| `default?`  | `string`  | Custom default value shown in help/docs. Use an empty string to intentionally show no default. |
| `optional?` | `boolean` | Override whether this argument is considered optional in the generated help documentation.     |

## Context Type

Represents detailed information about how each option or argument was provided (terminal, default, or programmatic).  
Useful for inspecting where values came from and what raw input was used.

### Context

| Field         | Type                              | Description                                       |
| ------------- | --------------------------------- | ------------------------------------------------- |
| `subcommand`  | `string` \| `undefined`           | Name of the executed subcommand, if any.          |
| `options`     | `Record<string, OptionContext>`   | Per-option context, with source and raw values.   |
| `arguments`   | `Record<string, ArgumentContext>` | Per-argument context, with source and raw values. |
| `positionals` | `string[]` \| `never`             | Raw positional arguments when allowed.            |

### OptionContext

| Property       | Description                                                                          |
| -------------- | ------------------------------------------------------------------------------------ |
| `schema`       | Schema used to validate the option.                                                  |
| `optional`     | Whether the option schema is optional.                                               |
| `defaultValue` | Default value from the schema, if any.                                               |
| `flag`         | CLI flag used (e.g., `--foo`, `-f`) when source is `terminal`.                       |
| `stringValue`  | Raw string provided from CLI when source is `terminal`.                              |
| `passedValue`  | Value passed programmatically when source is `programmatic`.                         |
| `source`       | `"terminal"`, `"default"`, or `"programmatic"` indicates how the value was supplied. |

### ArgumentContext

| Property       | Description                                                                          |
| -------------- | ------------------------------------------------------------------------------------ |
| `schema`       | Schema used to validate the argument.                                                |
| `optional`     | Whether the argument schema is optional.                                             |
| `defaultValue` | Default value from the schema, if any.                                               |
| `stringValue`  | Raw string from CLI when source is `terminal`.                                       |
| `passedValue`  | Value passed programmatically when source is `programmatic`.                         |
| `source`       | `"terminal"`, `"default"`, or `"programmatic"` indicates how the value was supplied. |
