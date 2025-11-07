import c from "chalk";
import { Marked, type RendererObject, type Tokens, marked } from "marked";

import type { ColorFunctionType } from "../types.ts";

const markdownStyle: Record<string, ColorFunctionType> = {
  bold: c.bold,
  italic: c.italic,
  boldItalic: c.bold.italic,
  code: (...string) => c.bgHex("#333333").whiteBright(` ${string.join(" ")} `),
  strikethrough: c.strikethrough,
  link: c.underline,
  listBullet: c.whiteBright,
  hr: c.dim,
  blockquote: (...string) => c.dim.bold("┃ ") + c.dim(string.join("").replace(/\s\s\n/g, "  \n" + c.bold("┃ "))),
};

function styleCode(text: string) {
  const lines = text.split("\n");
  const width = Math.max(...lines.map(l => l.length));
  const top = "┌" + "─".repeat(width + 2) + "┐";
  const bottom = "└" + "─".repeat(width + 2) + "┘";

  const body = lines.map(l => c.dim("│ ") + c.dim(l).padEnd(width) + c.dim(" │")).join("\n");

  return [c.dim(top), body, c.dim(bottom)].join("\n");
}

const bullets = ["•", "◦", "▪"];

const terminalRenderer: RendererObject<string, string> = {
  list(token) {
    // figure out depth
    let depth = 0;
    let current = token as Tokens.List & { parent: Tokens.List };
    while (current.parent) {
      depth++;
      current = current.parent as Tokens.List & { parent: Tokens.List };
    }

    // for ordered lists
    const start = token.ordered && token.start ? token.start : undefined;

    const items = token.items.map(item => this.listitem(Object.assign(item, { depth, parent: token, start })));
    return "\n" + items.join("\n");
  },
  listitem(item) {
    let string = "";

    const itemCast = item as Tokens.ListItem & { parent: Tokens.List; depth: number; start?: number };

    for (const token of item.tokens) {
      if (token.type === "list") {
        string += this.parser.parse([Object.assign(token, { parent: itemCast.parent })]);
      }

      if ("tokens" in token && Array.isArray(token.tokens)) {
        string += this.parser.parseInline(token.tokens);
      }
    }

    let prefix = " ".repeat(itemCast.depth * 2);

    // Task
    if (itemCast.task) {
      prefix += itemCast.checked ? "☑ " : "☐ ";
      return markdownStyle.listBullet(prefix) + string;
    }

    // Ordered
    if (itemCast.start !== undefined) {
      const findItemIndex = itemCast.parent.items.indexOf(itemCast);
      prefix += itemCast.start + findItemIndex + ". ";
      return markdownStyle.listBullet(prefix) + string;
    }

    // Unordered
    prefix += bullets[itemCast.depth % bullets.length] + " ";
    return markdownStyle.listBullet(prefix) + string;
  },
  link(token) {
    return markdownStyle.link(token.text + " " + "<" + token.href + ">");
  },
  checkbox({ checked }) {
    return checked.toString();
  },
  code(token) {
    return styleCode(token.text);
  },
  codespan({ text }) {
    return markdownStyle.code(text);
  },
  def({ raw }) {
    return raw;
  },
  del({ text }) {
    return markdownStyle.strikethrough(text);
  },
  paragraph({ tokens }) {
    return this.parser.parseInline(tokens);
  },
  blockquote({ text }) {
    return markdownStyle.blockquote(text);
  },
  strong({ tokens }) {
    return markdownStyle.bold(this.parser.parseInline(tokens));
  },
  em({ tokens }) {
    return markdownStyle.italic(this.parser.parseInline(tokens));
  },
  heading({ text }) {
    return markdownStyle.bold(text) + "\n";
  },
  text(token) {
    return token.raw;
  },
  space(token) {
    return token.raw.replace(/\n+/g, "\n");
  },
  hr() {
    return markdownStyle.hr("─".repeat(80));
  },
  br() {
    return "\n";
  },
};

const terminalMarked = new Marked();
terminalMarked.use({ renderer: terminalRenderer });

export function terminalMarkdown(
  text: string,
  renderer: "terminal" | "html" = "terminal",
  ansiTextColor: ColorFunctionType = (...string) => string.join(" "),
): string {
  if (!text) {
    return "";
  }

  if (renderer === "terminal") {
    return ansiTextColor(terminalMarked.parse(text) as string);
  }

  const htmlString = marked.parse(text) as string;

  return `<span class="_markdown">${htmlString.trim()}</span>`;
}
