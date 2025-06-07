import { getCliMetadata } from "../metadata/get-cli-metadata.js";
import { noColors, printColors } from "./colors.js";
import { printPreparedArguments } from "./print-arguments.js";
import { printOptions } from "./print-options.js";
import { printSubcommands } from "./print-subcommands.js";
import { concat, indent, ln, print, println } from "./utils.js";

import type { Cli, PrintHelpOpt, Subcommand } from "../types.js";

export function printCliHelp(params: [Cli, ...Subcommand[]], printConfig: PrintHelpOpt = {}) {
  printConfig.colors ??= true;

  const c = printConfig.colors ? printColors : noColors;

  const metadata = getCliMetadata(params);

  if (printConfig.customColors) {
    Object.assign(c, printConfig.customColors);
  }

  /** Print a styled title */
  const printTitle = (title: string) => {
    print(c.title(` ${title.toUpperCase()} `));
  };

  // Print CLI usage
  const usage =
    metadata.usage ||
    concat(
      c.punctuation("$"),
      metadata.name,
      metadata.subcommands.length ? c.command("[command]") : "",
      metadata.options.length ? c.option("[options]") : "",
      metadata.arguments.length || metadata.allowPositional ? c.argument("<arguments>") : "",
    );
  printTitle("Usage");
  println();
  println(indent(2), usage, ln(1));

  // Print CLI description
  if (metadata.description) {
    printTitle("Description");
    println();
    println(indent(2), c.description(metadata.description), ln(1));
  }

  let longest = 0;

  // Prepare CLI options
  const optionsMetadata = metadata.options;

  const longestOptionTitle = optionsMetadata.reduce((acc, metadata) => {
    const names = metadata.aliasesAsArgs.concat([metadata.nameAsArg]).join(", ");
    const optLength = names.length + metadata.placeholder.length;
    return optLength > acc ? optLength : acc;
  }, 0);

  if (longestOptionTitle > longest) {
    longest = longestOptionTitle;
  }

  // Prepare CLI commands
  const subcommandsMetadata = metadata.subcommands;

  const longestSubcommandTitle = subcommandsMetadata.reduce((acc, metadata) => {
    const names = metadata.aliases.concat([metadata.name]).join(", ");
    const placeholder =
      metadata.placeholder || (metadata.options.length ? "[options]" : metadata.allowPositional ? "<args>" : " ");
    const optLength = names.length + placeholder.length;
    return optLength > acc ? optLength : acc;
  }, 0);

  if (longestSubcommandTitle > longest) {
    longest = longestSubcommandTitle;
  }

  // Prepare CLI arguments
  const argsMetadata = metadata.arguments;

  const longestArgTitle = argsMetadata.reduce((acc, arg) => (arg.name.length > acc ? arg.name.length : acc), 0);

  if (longestArgTitle > longest) {
    longest = longestArgTitle;
  }

  // Print CLI options
  printOptions(optionsMetadata, c, longest);

  // Print CLI commands
  printSubcommands(subcommandsMetadata, c, longest);

  // Print CLI arguments
  printPreparedArguments(argsMetadata, c, longest);

  // Print CLI example
  if (metadata.example) {
    printTitle("Example");
    println();
    const normalizeExample = metadata.example.replace(/\n/g, "\n" + indent(3));
    println(indent(2), c.example(normalizeExample), ln(1));
  }
}

export function printSubcommandHelp(subcommand: Subcommand, printConfig: PrintHelpOpt = {}, cliName = "") {
  printConfig.colors ??= true;

  const c = printConfig.colors ? printColors : noColors;

  const usage =
    subcommand.usage ||
    concat(
      c.punctuation("$"),
      cliName,
      c.command(subcommand.name),
      subcommand.options?.length ? c.option("[options]") : "",
      subcommand.arguments?.length || subcommand.allowPositional ? c.argument("<arguments>") : "",
    );

  const asCli: Cli = {
    cliName,
    usage,
    ...subcommand,
  };

  printCliHelp([asCli], printConfig);
}
