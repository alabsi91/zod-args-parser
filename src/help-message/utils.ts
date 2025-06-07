/** Print */
export function print(...messages: string[]) {
  return process.stdout.write(messages.join(" "));
}

/** Print line */
export function println(...messages: string[]) {
  messages = messages.filter(Boolean);
  return console.log(...messages);
}

/** New line */
export function ln(count: number) {
  return "\n".repeat(count);
}

/** Space */
export function indent(count: number) {
  return " ".repeat(count);
}

/** Add indent before each new line */
export function addIndentLn(message: string, indent: string = "") {
  return message.replace(/\n/g, `\n${indent}`);
}

/** Concat strings */
export function concat(...messages: string[]) {
  messages = messages.filter(Boolean);
  return messages.join(" ");
}
