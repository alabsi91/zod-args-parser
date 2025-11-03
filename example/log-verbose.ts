import type { ContextWide } from "zod-args-parser";

export function logCliContext(context: ContextWide) {
  if (context.subcommand) {
    console.log("[verbose]", 'The subcommand "' + context.subcommand + '" was called');
  }

  if (context.options) {
    for (const [key, optionsContext] of Object.entries(context.options)) {
      const value = optionsContext.stringValue ?? optionsContext.passedValue;
      console.log("[verbose]", "option name:", key);
      console.log("         ", "received value:", value);
      console.log("         ", "value source:", optionsContext.source);
    }
  }

  if (context.arguments) {
    for (const [index, argumentContext] of context.arguments.entries()) {
      const value = argumentContext.stringValue ?? argumentContext.passedValue;
      console.log("[verbose]", "argument of index:", index);
      console.log("         ", "received value:", value);
      console.log("         ", "value source:" + argumentContext.source);
    }
  }

  if (context.positionals) {
    if (context.positionals.length === 0) {
      console.log("[verbose]", "No positional arguments provided");
    } else {
      console.log("[verbose]", "Positional arguments:", context.positionals.join(", "));
    }
  }
}
