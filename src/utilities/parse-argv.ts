/** Parse a string into an argv (array of arguments) */
export function parseArgv(input: string): string[] {
  const argv = [];

  let currentQuote: string | undefined = undefined;
  let currentArgument: string | undefined = undefined;

  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    const previousChar = input[index - 1];
    const nextChar = input[index + 1];
    const end = index === input.length - 1;

    // entering/leaving quote
    if ((char === '"' || char === "'") && previousChar !== "\\") {
      // leaving quote
      if (currentQuote === char) {
        currentQuote = undefined;
        continue;
      }

      // entering quote
      if (currentQuote === undefined) {
        currentQuote = char;
        continue;
      }

      // quote inside quote
      if (currentQuote !== undefined && char !== currentQuote) {
        currentArgument ??= "";
        currentArgument += char;
        continue;
      }
      continue;
    }

    // new line
    if (char === "\\" && nextChar === "\n") {
      index++;
      continue;
    }

    // Add to argv
    if (currentArgument !== undefined && currentQuote === undefined) {
      if (char === " ") {
        argv.push(currentArgument);
        currentArgument = undefined;
        continue;
      }

      if (end) {
        currentArgument += char;
        argv.push(currentArgument);
        currentArgument = undefined;
        continue;
      }
    }

    // Ignore spaces outside of quotes
    if (char === " " && currentQuote === undefined) {
      continue;
    }

    // Ignore escaped characters
    if (char === "\\" && (nextChar === "'" || nextChar === '"')) {
      continue;
    }

    currentArgument ??= "";
    currentArgument += char;
  }

  // Add last argument
  if (currentArgument !== undefined) {
    argv.push(currentArgument);
  }

  return argv;
}
