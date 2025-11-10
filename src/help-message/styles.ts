import c from "chalk";

import type { HelpMessageStyleImpl } from "../types/help-message-types.ts";

export class HelpMessageStyle implements HelpMessageStyleImpl {
  static noColor = (...text: unknown[]) => text.join(" ");

  title = HelpMessageStyle.noColor;
  description = HelpMessageStyle.noColor;
  default = HelpMessageStyle.noColor;
  optional = HelpMessageStyle.noColor;
  exampleTitle = HelpMessageStyle.noColor;
  example = HelpMessageStyle.noColor;
  command = HelpMessageStyle.noColor;
  option = HelpMessageStyle.noColor;
  argument = HelpMessageStyle.noColor;
  placeholder = HelpMessageStyle.noColor;
  punctuation = HelpMessageStyle.noColor;

  constructor(style: Partial<HelpMessageStyleImpl>, baseStyle?: HelpMessageStyleImpl) {
    if (baseStyle) {
      Object.assign(this, baseStyle);
    }

    Object.assign(this, style);
  }
}

export const helpMessageStyles = Object.freeze({
  default: new HelpMessageStyle({
    title: c.bold.blue,
    description: c.white,
    default: c.dim.italic,
    optional: c.dim.italic,
    exampleTitle: c.yellow,
    example: c.dim,
    command: c.yellow,
    option: c.cyan,
    argument: c.green,
    placeholder: c.hex("#FF9800"),
    punctuation: c.white.dim,
  }),

  dracula: new HelpMessageStyle({
    title: c.bold.hex("#BD93F9"),
    description: c.hex("#F8F8F2"),
    default: c.italic.hex("#6272A4"),
    optional: c.italic.hex("#6272A4"),
    exampleTitle: c.hex("#FFB86C"),
    example: c.hex("#6272A4"),
    command: c.hex("#50FA7B"),
    option: c.hex("#8BE9FD"),
    argument: c.hex("#FF79C6"),
    placeholder: c.hex("#F1FA8C"),
    punctuation: c.hex("#6272A4"),
  }),

  solarizedDark: new HelpMessageStyle({
    title: c.bold.hex("#268BD2"),
    description: c.hex("#93A1A1"),
    default: c.italic.hex("#586E75"),
    optional: c.italic.hex("#586E75"),
    exampleTitle: c.hex("#B58900"),
    example: c.hex("#586E75"),
    command: c.hex("#2AA198"),
    option: c.hex("#268BD2"),
    argument: c.hex("#859900"),
    placeholder: c.hex("#CB4B16"),
    punctuation: c.hex("#657B83"),
  }),

  nord: new HelpMessageStyle({
    title: c.bold.hex("#81A1C1"),
    description: c.hex("#D8DEE9"),
    default: c.italic.hex("#4C566A"),
    optional: c.italic.hex("#4C566A"),
    exampleTitle: c.hex("#EBCB8B"),
    example: c.hex("#4C566A"),
    command: c.hex("#A3BE8C"),
    option: c.hex("#88C0D0"),
    argument: c.hex("#BF616A"),
    placeholder: c.hex("#D08770"),
    punctuation: c.hex("#4C566A"),
  }),

  /**
   * - Wrap the output in a <pre> element to preserve whitespace.
   * - If using `descriptionMarkdown`, set `markdownRenderer` to `html` instead of `terminal`.
   */
  html: new HelpMessageStyle({
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
  }),

  gruvboxDark: new HelpMessageStyle({
    title: c.bold.hex("#FABD2F"),
    description: c.hex("#EBDBB2"),
    default: c.italic.hex("#928374"),
    optional: c.italic.hex("#928374"),
    exampleTitle: c.hex("#FE8019"),
    example: c.hex("#928374"),
    command: c.hex("#B8BB26"),
    option: c.hex("#83A598"),
    argument: c.hex("#D3869B"),
    placeholder: c.hex("#FB4934"),
    punctuation: c.hex("#928374"),
  }),

  monokai: new HelpMessageStyle({
    title: c.bold.hex("#AE81FF"),
    description: c.hex("#F8F8F2"),
    default: c.italic.hex("#75715E"),
    optional: c.italic.hex("#75715E"),
    exampleTitle: c.hex("#FD971F"),
    example: c.hex("#75715E"),
    command: c.hex("#A6E22E"),
    option: c.hex("#66D9EF"),
    argument: c.hex("#F92672"),
    placeholder: c.hex("#E6DB74"),
    punctuation: c.hex("#75715E"),
  }),

  oneDark: new HelpMessageStyle({
    title: c.bold.hex("#61AFEF"),
    description: c.hex("#ABB2BF"),
    default: c.italic.hex("#5C6370"),
    optional: c.italic.hex("#5C6370"),
    exampleTitle: c.hex("#E5C07B"),
    example: c.hex("#5C6370"),
    command: c.hex("#98C379"),
    option: c.hex("#56B6C2"),
    argument: c.hex("#E06C75"),
    placeholder: c.hex("#C678DD"),
    punctuation: c.hex("#5C6370"),
  }),

  catppuccin: new HelpMessageStyle({
    title: c.bold.hex("#89B4FA"),
    description: c.hex("#CDD6F4"),
    default: c.italic.hex("#6C7086"),
    optional: c.italic.hex("#6C7086"),
    exampleTitle: c.hex("#F9E2AF"),
    example: c.hex("#6C7086"),
    command: c.hex("#A6E3A1"),
    option: c.hex("#94E2D5"),
    argument: c.hex("#F38BA8"),
    placeholder: c.hex("#FAB387"),
    punctuation: c.hex("#585B70"),
  }),

  noColors: new HelpMessageStyle({}),
});

function escapeHTML(string: string) {
  return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
