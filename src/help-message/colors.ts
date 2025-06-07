import chalk from "chalk";
import type { PrintHelpOpt } from "../types.js";

export type PrintHelpColors = NonNullable<Required<PrintHelpOpt["customColors"]>>;

export const printColors: PrintHelpColors = {
  title: chalk.bold.blue,
  description: chalk.white,
  default: chalk.dim.italic,
  optional: chalk.dim.italic,
  exampleTitle: chalk.yellow,
  example: chalk.dim,
  command: chalk.yellow,
  option: chalk.cyan,
  argument: chalk.green,
  placeholder: chalk.hex("#FF9800"),
  punctuation: chalk.white.dim,
};

export const noColors = new Proxy(printColors, {
  get: () => {
    return (...str: string[]) => str.join(" ");
  },
});
