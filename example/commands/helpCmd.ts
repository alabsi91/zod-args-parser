import * as z from "zod";
import { createSubcommand } from "zod-args-parser";

export const helpCommandSchema = createSubcommand({
  name: "help",
  placeholder: "<command>",
  description: "Print help message for command",
  arguments: [
    {
      name: "command",
      description: "Command to print help for",
      type: z.enum(["process", "convert", "configure", "list", "count", "help"]).optional(),
    },
  ],
});

helpCommandSchema.setAction(results => {
  const [command] = results.arguments;
  if (command) results.printSubcommandHelp(command);
  else results.printCliHelp();
});
