# zod-args-parser

A strictly typed command-line arguments parser powered by Zod.

## Features

- **Strict typing for subcommands, options, and arguments**.
- **Flag coupling support**: e.g., `-rf` to combine `-r` and `-f` flags.
- **Negative flag support**: e.g., `--no-verbose` to negate `--verbose`.
- **Flexible option value formatting**: Supports both `--input-dir path` and `--input-dir=path` styles.
- **Help message generation**: Built-in methods to generate help text for the CLI and each subcommand.

## Installation

```bash
npm install zod chalk zod-args-parser
```

## Usage

```ts
import { z } from "zod";
import { createCli, createSubcommand, createOptions, safeParse } from "zod-args-parser";

// Share same options between subcommands
const sharedOptions = createOptions([
  {
    name: "verbose",
    description: "Verbose mode",
    type: z.boolean().optional(),
  },
]);

// Create a CLI schema
// This will be used when no subcommands are provided
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
  if (command) results.printSubcommandHelp(command);
  else results.printCliHelp();
});

const results = safeParse(
  process.argv.slice(2),
  cliSchema,
  helpCommandSchema,
  // Add more subcommands
);

// ! Error
if (!results.success) {
  console.error(results.error.message);
  console.log("\n`my-cli --help` for more information, or `my-cli help <command>` for command-specific help\n");
  process.exit(1);
}
```

## Types Utility

```ts
import { createSubcommand } from "zod-args-parser";
import type { InferOptionsType, InferArgumentsType } from "zod-args-parser";

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

type Options = InferOptionsType<typeof subcommand>;
// { numberOption: number; stringOption: string; booleanOption: boolean; optionalOption?: boolean | undefined; }

type Arguments = InferArgumentsType<typeof subcommand>;
// [string, number, boolean]
```

## API

### `Subcommand`

- `name: string`  
  The name of the subcommand.

- `aliases?: string[]`  
  An array of aliases for the subcommand.

- `description?: string`  
  A description of the subcommand for the help message.

- `usage?: string`  
  The usage of the subcommand for the help message.

- `placeholder?: string`  
  A placeholder displayed in the help message alongside the subcommand name.

- `example?: string`  
  An example of subcommand usage for the help message.

- `allowPositional?: boolean`  
  Allows positional arguments for this subcommand.  
  Positional arguments are untyped (`string[]`) when enabled with the typed `arguments` any extra arguments, beyond the typed `arguments`, are parsed as positional and stored in the `positional` property.

- `options?: Option[]`  
  An array of options for the subcommand.

  - `name: string`  
    The name of the option. camelCase is recommended. E.g. `inputDir` -> `--input-dir`

  - `aliases?: string[]`  
    An array of aliases for the option.

  - `type: ZodType`  
    Specifies the type of the option using Zod.

    **Examples:**

    - `type: z.boolean().default(false);`
    - `type: z.coerce.number(); // coerces value to a number`
    - `type: z.preprocess(parseStringToArrFn, z.array(z.coerce.number())); // array of numbers`

  - `description?: string`  
    A description of the option for the help message.

  - `placeholder?: string`  
    Placeholder text for the option in the help message.

  - `example?: string`  
    An example of option usage for the help message.

- `arguments?: Argument[]`  
  An array of arguments for the subcommand.

  - `name: string`  
    The name of the argument for display in the help message.

  - `type: ZodType`  
    Specifies the type of the argument using Zod.

    **Examples:**

    - `type: z.boolean();`
    - `type: z.coerce.number(); // coerces value to a number`

  - `description?: string`  
    A description of the argument for the help message.

  - `example?: string`  
    An example of argument usage for the help message.

### Results

- `subcommand: string | undefined`  
  The name of the executed subcommand.  
  If no subcommand is executed, this will be `undefined`.

- `arguments?: any[]`  
  An array representing defined arguments for the subcommand, e.g., `[string, number]`.  
  Only defined if the subcommand has specified `arguments`.

- `positional?: string[]`  
  Contains positional arguments as `string[]` if `allowPositional` is enabled for the subcommand.

- `printCliHelp(options?: PrintHelpOpt): void`  
  Prints the CLI help message.  
  Accepts an optional `options` object to disable colors or customize colors.

- `printSubcommandHelp(subcommand: string, options?: PrintHelpOpt): void`  
  Prints the help message for a specified subcommand.

- `[key: optionName]: optionType`  
   Represents options specified in the CLI or subcommand with their respective types.

### `parse(args: string[], cli: Cli, ...subcommands: Subcommand[]): UnSafeParseResult`

Parses the provided arguments and returns a `Results` object.  
Throws an error if parsing fails.

### `safeParse(args: string[], cli: Cli, ...subcommands: Subcommand[]): SafeParseResult`

Parses the provided arguments and returns:

```ts
{ success: false, error: Error } | { success: true, data: ResultObj }
```

## Extras

- `generateBashAutocompleteScript(...params: [Cli, ...Subcommand[]]): string`
- `generatePowerShellAutocompleteScript(...params: [Cli, ...Subcommand[]]): string`
- `generateZshAutocompleteScript(...params: [Cli, ...Subcommand[]]): string`
- `generateMarkdown(...params: [Cli, ...Subcommand[]]): string`

## Example

- [Example code](https://github.com/alabsi91/zod-args-parser/tree/main/example)
