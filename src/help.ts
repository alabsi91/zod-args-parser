import chalk from "chalk";
import { concat, getDefaultValueFromSchema, indent, ln, print, println, transformOptionToArg } from "./utils.js";

import type { Argument, Cli, Option, PrintHelpOpt, Subcommand } from "./types.js";

/** Colors */
const colors: NonNullable<Required<PrintHelpOpt["customColors"]>> = {
  title: chalk.bold.blue,
  description: chalk.white,
  default: chalk.dim.italic,
  optional: chalk.dim.italic,
  exampleTitle: chalk.yellow,
  example: chalk.dim.italic,
  command: chalk.yellow,
  option: chalk.cyan,
  argument: chalk.green,
  placeholder: chalk.hex("#FF9800"),
  punctuation: chalk.white.dim,
};

type PreparedToPrint = {
  names: string;
  description: string;
  placeholder?: string;
  example?: string;
  default?: string;
  optional?: string;
};

function printCliHelp(params: [Cli, ...Subcommand[]], printOptions: PrintHelpOpt = {}) {
  printOptions.colors ??= true;

  const noColors = new Proxy(colors, {
    get: () => {
      return (...str: string[]) => str.join(" ");
    },
  });

  const c = printOptions.colors ? colors : noColors;

  if (printOptions.customColors) {
    Object.assign(c, printOptions.customColors);
  }

  const isFirstParamCli = "cliName" in params[0];
  const cliOptions = (isFirstParamCli ? params.shift() : {}) as Cli;
  const subcommands = params as Subcommand[];

  /** Print a styled title */
  const printTitle = (title: string) => {
    print(c.title(` ${title.toUpperCase()} `));
  };

  // Print CLI usage
  const cliName = cliOptions.cliName ?? "";
  const usage =
    cliOptions.usage ??
    concat(
      c.punctuation("$"),
      cliName,
      subcommands.length ? c.command("[command]") : "",
      cliOptions.options?.length ? c.option("[options]") : "",
      cliOptions.arguments?.length || cliOptions.allowPositional ? c.argument("<arguments>") : "",
    );
  printTitle("Usage");
  println();
  println(indent(2), usage, ln(1));

  // Print CLI description
  if (cliOptions.description) {
    printTitle("Description");
    println();
    println(indent(2), c.description(cliOptions.description), ln(1));
  }

  let longest = 0;

  // Prepare CLI options
  const [optionsToPrint, longestOptionIndent] = prepareOptionsToPrint(cliOptions.options);
  if (longestOptionIndent > longest) longest = longestOptionIndent;

  // Prepare CLI commands
  const [commandsToPrint, longestSubcommandIndent] = prepareCommandsToPrint(subcommands);
  if (longestSubcommandIndent > longest) longest = longestSubcommandIndent;

  // Prepare CLI arguments
  const [argsToPrint, longestArgIndent] = prepareArgumentsToPrint(cliOptions.arguments);
  if (longestArgIndent > longest) longest = longestArgIndent;

  // Print CLI options
  printPreparedOptions(optionsToPrint, c, longest);

  // Print CLI commands
  printPreparedCommands(commandsToPrint, c, longest);

  // Print CLI arguments
  printPreparedArguments(argsToPrint, c, longest);

  // Print CLI example
  if (cliOptions.example) {
    printTitle("Example");
    println();
    const normalizeExample = cliOptions.example.replace(/\n/g, "\n" + indent(3));
    println(indent(2), c.example(normalizeExample), ln(1));
  }
}

function printSubcommandHelp(subcommand: Subcommand, printOptions: PrintHelpOpt = {}, cliName = "") {
  printOptions.colors ??= true;

  const noColors = new Proxy(colors, {
    get: () => {
      return (...str: string[]) => str.join(" ");
    },
  });

  const c = printOptions.colors ? colors : noColors;

  if (printOptions.customColors) {
    Object.assign(c, printOptions.customColors);
  }

  /** Print a styled title */
  const printTitle = (title: string) => {
    print(c.title(` ${title.toUpperCase()} `));
  };

  // Print command usage
  const usage = concat(
    c.punctuation("$"),
    cliName,
    c.command(subcommand.name),
    subcommand.options?.length ? c.option("[options]") : "",
    subcommand.arguments?.length || subcommand.allowPositional ? c.argument("<arguments>") : "",
  );
  printTitle("Usage");
  println();
  println(indent(2), usage, ln(1));

  // Print command description
  if (subcommand.description) {
    printTitle("Description");
    println();
    const normalizeDesc = subcommand.description.replace(/\n/g, "\n" + indent(3));
    println(indent(2), c.description(normalizeDesc), ln(1));
  }

  let longest = 0;

  // Prepare command options
  const [optionsToPrint, longestOptionIndent] = prepareOptionsToPrint(subcommand.options);
  if (longestOptionIndent > longest) longest = longestOptionIndent;

  // Prepare command arguments
  const [argsToPrint, longestArgIndent] = prepareArgumentsToPrint(subcommand.arguments);
  if (longestArgIndent > longest) longest = longestArgIndent;

  // Print command options
  printPreparedOptions(optionsToPrint, c, longest);

  // Print command arguments
  printPreparedArguments(argsToPrint, c, longest);

  // Print command example
  if (subcommand.example) {
    printTitle("Example");
    println();
    const normalizeExample = subcommand.example.replace(/\n/g, "\n" + indent(3));
    println(indent(2), c.example(normalizeExample), ln(1));
  }
}

// * Prepare
function prepareOptionsToPrint(options: Option[] | undefined): [PreparedToPrint[], number] {
  if (!options || !options.length) return [[], 0];

  const optionsToPrint: PreparedToPrint[] = [];
  let longest = 0;

  for (const option of options) {
    const nameWithAliases = option.aliases ? [...option.aliases, option.name] : [option.name];
    const names = Array.from(new Set(nameWithAliases.map(name => transformOptionToArg(name)))).join(", ");

    const defaultValue = getDefaultValueFromSchema(option.type);

    const placeholder = option.placeholder ?? " ";
    optionsToPrint.push({
      names,
      placeholder,
      description: option.description ?? option.type.description ?? "",
      default: typeof defaultValue !== "undefined" ? `(default: ${JSON.stringify(defaultValue)})` : "",
      optional: option.type.isOptional() ? "[optional]" : "",
      example: option.example ?? "",
    });

    const optLength = names.length + placeholder.length;

    if (optLength > longest) longest = optLength;
  }

  return [optionsToPrint, longest];
}

function prepareCommandsToPrint(subcommands: Subcommand[] | undefined): [PreparedToPrint[], number] {
  if (!subcommands || !subcommands.length) return [[], 0];

  const commandsToPrint: PreparedToPrint[] = [];
  let longest = 0;

  for (const subcommand of subcommands) {
    const { name, aliases, description } = subcommand;
    const names = Array.from(new Set([...(aliases ?? []), name])).join(", ");

    const placeholder =
      subcommand.placeholder ?? (subcommand.options ? "[options]" : subcommand.allowPositional ? "<args>" : " ");

    commandsToPrint.push({ names, placeholder, description: description ?? "" });

    const cmdLength = names.length + placeholder.length;
    if (cmdLength > longest) longest = cmdLength;
  }

  return [commandsToPrint, longest];
}

function prepareArgumentsToPrint(args: Argument[] | undefined): [PreparedToPrint[], number] {
  if (!args || !args.length) return [[], 0];

  const argsToPrint: PreparedToPrint[] = [];
  let longest = 0;

  for (const arg of args) {
    const defaultValue = getDefaultValueFromSchema(arg.type);

    argsToPrint.push({
      names: arg.name,
      description: arg.description ?? "",
      default: typeof defaultValue !== "undefined" ? `(default: ${JSON.stringify(defaultValue)})` : "",
      optional: arg.type.isOptional() ? "[optional]" : "",
      example: arg.example ?? "",
    });

    const cmdLength = arg.name.length;
    if (cmdLength > longest) longest = cmdLength;
  }

  return [argsToPrint, longest];
}

// * Print
function printPreparedOptions(optionsToPrint: PreparedToPrint[], c: typeof colors, longest: number) {
  if (!optionsToPrint.length) return;

  print(c.title(" OPTIONS "));

  println();

  for (const { names, placeholder, description, example, optional, default: def } of optionsToPrint) {
    const optLength = names.length + (placeholder?.length ?? 0);
    const spacing = longest + 1 - optLength;
    const normalizeDesc = description.replace(/\n/g, "\n" + indent(longest + 7) + c.punctuation("└"));

    const coloredNames = names
      .split(/(,)/)
      .map(name => (name === "," ? c.punctuation(name) : c.option(name)))
      .join("");

    println(
      indent(2),
      coloredNames,
      c.placeholder(placeholder),
      indent(spacing),
      c.description(normalizeDesc),
      def ? c.default(def) : c.optional(optional),
    );

    if (example) {
      const normalizeExample = example.replace(/\n/g, "\n" + indent(longest + 17));
      println(indent(longest + 6), c.punctuation("└") + c.exampleTitle("Example:"), c.example(normalizeExample));
    }
  }

  println();
}

function printPreparedCommands(commandsToPrint: PreparedToPrint[], c: typeof colors, longest: number) {
  if (!commandsToPrint.length) return;

  print(c.title(" COMMANDS "));

  println();

  for (const { names, placeholder, description } of commandsToPrint) {
    const optLength = names.length + (placeholder?.length ?? 0);
    const spacing = longest + 1 - optLength;
    const normalizeDesc = description.replace(/\n/g, "\n" + indent(longest + 7));

    const coloredNames = names
      .split(/(,)/)
      .map(name => (name === "," ? c.punctuation(name) : c.command(name)))
      .join("");

    println(indent(2), coloredNames, c.placeholder(placeholder), indent(spacing), c.description(normalizeDesc));
  }

  println();
}

function printPreparedArguments(argsToPrint: PreparedToPrint[], c: typeof colors, longest: number) {
  if (!argsToPrint.length) return;

  print(c.title(" ARGUMENTS "));

  println();

  for (const { names, description, example, optional, default: def } of argsToPrint) {
    const spacing = longest + 2 - names.length;
    const normalizeDesc = description.replace(/\n/g, "\n" + indent(longest + 6) + c.punctuation("└"));

    println(
      indent(2),
      c.argument(names),
      indent(spacing),
      c.description(normalizeDesc),
      def ? c.default(def) : c.optional(optional),
    );

    if (example) {
      const normalizeExample = example.replace(/\n/g, "\n" + indent(longest + 16));
      println(indent(longest + 5), c.punctuation("└") + c.exampleTitle("Example:"), c.example(normalizeExample));
    }
  }

  println();
}

export const help = {
  printCliHelp,
  printSubcommandHelp,
};
