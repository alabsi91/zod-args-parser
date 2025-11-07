import chalk from "chalk";

import type { HelpMessageStyle } from "../types/help-message-types.ts";

export const helpMessageStyles = Object.freeze({
  default: {
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
  },
  dracula: {
    title: chalk.bold.hex("#BD93F9"),
    description: chalk.hex("#F8F8F2"),
    default: chalk.italic.hex("#6272A4"),
    optional: chalk.italic.hex("#6272A4"),
    exampleTitle: chalk.hex("#FFB86C"),
    example: chalk.hex("#6272A4"),
    command: chalk.hex("#50FA7B"),
    option: chalk.hex("#8BE9FD"),
    argument: chalk.hex("#FF79C6"),
    placeholder: chalk.hex("#F1FA8C"),
    punctuation: chalk.hex("#6272A4"),
  },
  solarizedDark: {
    title: chalk.bold.hex("#268BD2"),
    description: chalk.hex("#93A1A1"),
    default: chalk.italic.hex("#586E75"),
    optional: chalk.italic.hex("#586E75"),
    exampleTitle: chalk.hex("#B58900"),
    example: chalk.hex("#586E75"),
    command: chalk.hex("#2AA198"),
    option: chalk.hex("#268BD2"),
    argument: chalk.hex("#859900"),
    placeholder: chalk.hex("#CB4B16"),
    punctuation: chalk.hex("#657B83"),
  },
  nord: {
    title: chalk.bold.hex("#81A1C1"),
    description: chalk.hex("#D8DEE9"),
    default: chalk.italic.hex("#4C566A"),
    optional: chalk.italic.hex("#4C566A"),
    exampleTitle: chalk.hex("#EBCB8B"),
    example: chalk.hex("#4C566A"),
    command: chalk.hex("#A3BE8C"),
    option: chalk.hex("#88C0D0"),
    argument: chalk.hex("#BF616A"),
    placeholder: chalk.hex("#D08770"),
    punctuation: chalk.hex("#4C566A"),
  },

  /**
   * - Wrap the output in a <pre> element to preserve whitespace.
   * - If using `descriptionMarkdown`, set `markdownRenderer` to `html` instead of `terminal`.
   */
  html: {
    title: (...string) => `<span style="color: #89dceb; font-weight: bold;">${escapeHTML(string.join(" "))}</span>`,
    description: (...string) => `<span style="color: #cdd6e8;">${escapeHTML(string.join(" "))}</span>`,
    default: (...string) => `<span style="color: #6c7086; font-style: italic;">${escapeHTML(string.join(" "))}</span>`,
    optional: (...string) => `<span style="color: #6c7086; font-style: italic;">${escapeHTML(string.join(" "))}</span>`,
    exampleTitle: (...string) => `<span style="color: #f9e2af;">${escapeHTML(string.join(" "))}</span>`,
    example: (...string) => `<span style="color: #6c7086;">${escapeHTML(string.join(" "))}</span>`,
    command: (...string) => `<span style="color: #f9e2af;">${escapeHTML(string.join(" "))}</span>`,
    option: (...string) => `<span style="color: #17b85d;">${escapeHTML(string.join(" "))}</span>`,
    argument: (...string) => `<span style="color: #00ff00;">${escapeHTML(string.join(" "))}</span>`,
    placeholder: (...string) => `<span style="color: #db9518;">${escapeHTML(string.join(" "))}</span>`,
    punctuation: (...string) => `<span style="color: #6c7086;">${escapeHTML(string.join(" "))}</span>`,
  },
  gruvboxDark: {
    title: chalk.bold.hex("#FABD2F"),
    description: chalk.hex("#EBDBB2"),
    default: chalk.italic.hex("#928374"),
    optional: chalk.italic.hex("#928374"),
    exampleTitle: chalk.hex("#FE8019"),
    example: chalk.hex("#928374"),
    command: chalk.hex("#B8BB26"),
    option: chalk.hex("#83A598"),
    argument: chalk.hex("#D3869B"),
    placeholder: chalk.hex("#FB4934"),
    punctuation: chalk.hex("#928374"),
  },
  monokai: {
    title: chalk.bold.hex("#AE81FF"),
    description: chalk.hex("#F8F8F2"),
    default: chalk.italic.hex("#75715E"),
    optional: chalk.italic.hex("#75715E"),
    exampleTitle: chalk.hex("#FD971F"),
    example: chalk.hex("#75715E"),
    command: chalk.hex("#A6E22E"),
    option: chalk.hex("#66D9EF"),
    argument: chalk.hex("#F92672"),
    placeholder: chalk.hex("#E6DB74"),
    punctuation: chalk.hex("#75715E"),
  },
  oneDark: {
    title: chalk.bold.hex("#61AFEF"),
    description: chalk.hex("#ABB2BF"),
    default: chalk.italic.hex("#5C6370"),
    optional: chalk.italic.hex("#5C6370"),
    exampleTitle: chalk.hex("#E5C07B"),
    example: chalk.hex("#5C6370"),
    command: chalk.hex("#98C379"),
    option: chalk.hex("#56B6C2"),
    argument: chalk.hex("#E06C75"),
    placeholder: chalk.hex("#C678DD"),
    punctuation: chalk.hex("#5C6370"),
  },
  get noColors() {
    return new Proxy(this.default, {
      get() {
        return (...string: string[]) => string.join(" ");
      },
    }) as HelpMessageStyle;
  },
}) satisfies Record<string, HelpMessageStyle>;

function escapeHTML(string: string) {
  return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
