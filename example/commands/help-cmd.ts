import * as z from "zod";
import { coerce, createSubcommand, type InferInputType } from "zod-args-parser";
import { logCliContext } from "../log-verbose.ts";
import { sharedOptions } from "../shared.ts";

const helpSubcommandSchema = createSubcommand({
  name: "help",
  meta: {
    placeholder: "<command>",
    description: "Print help message for command",
  },

  options: sharedOptions,

  arguments: [
    {
      type: coerce.string(z.enum(["add-items", "create-list", "delete-list", "remove-items", "help"]).optional()),
      meta: {
        name: "command-name",
        descriptionMarkdown:
          "Command to print help for." +
          "\n**Available commands:** `add-items`, `create-list`, `delete-list`, `remove-items`, `help`",
      },
    },
  ],
});

helpSubcommandSchema.setAction(results => {
  const { verbose } = results.options;
  const [command] = results.arguments;

  if (verbose) {
    logCliContext(results.context);
  }

  if (!helpSubcommandSchema.printSubcommandHelp || !helpSubcommandSchema.printCliHelp) {
    console.error("Print help methods are not initialized yet.");
    return;
  }

  if (command) {
    helpSubcommandSchema.printSubcommandHelp(command);
    return;
  }

  helpSubcommandSchema.printCliHelp();
});

type InputType = InferInputType<typeof helpSubcommandSchema>;

function executeHelpCommand(commandName?: NonNullable<NonNullable<InputType>["arguments"]>[0]) {
  helpSubcommandSchema.execute({ arguments: [commandName] });
}

export { helpSubcommandSchema, executeHelpCommand };
