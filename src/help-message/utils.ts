/** New line */
export function ln(count: number) {
  return "\n".repeat(count);
}

/** Space */
export function indent(count: number) {
  return " ".repeat(count);
}

/** Concat strings */
export function concat(...messages: string[]) {
  // messages = messages.filter(Boolean);
  return messages.join(" ");
}
