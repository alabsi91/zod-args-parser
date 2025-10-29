import * as z from "zod";
import { createSubcommand, helpMessageStyles } from "zod-args-parser";

export const helpCommandSchema = createSubcommand({
  name: "help",
  meta: {
    placeholder: "<command>",
    description: "Print help message for command",
  },
  arguments: [
    {
      type: z.enum(["process", "convert", "configure", "list", "count", "help"]).optional(),
      meta: {
        description: "Command to print help for",
        name: "command",
      },
    },
  ],
});

helpCommandSchema.setAction(results => {
  const [command] = results.arguments;

  if (command) {
    results.printSubcommandHelp(command, helpMessageStyles.default);
    return;
  }

  results.printCliHelp(helpMessageStyles.default);
});
