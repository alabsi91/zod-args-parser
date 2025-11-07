import { coerce, defineSubcommand, type InferArgumentsInputType } from "typed-arg-parser";
import * as z from "zod";

import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const helpCommand = defineSubcommand({
  name: "help",
  aliases: ["h"],
  meta: {
    placeholder: "<command-name>",
    description: "Show help message for a specific command.",
  },

  options: sharedOptions,

  arguments: [
    {
      name: "command-name",
      type: z.object({ value: z.enum(["add-items", "create-list", "delete-list", "remove-items", "help"]).optional() }),
      coerce: coerce.string,
      meta: {
        descriptionMarkdown:
          "Command to print help for." +
          "\n**Available commands:** `add-items`, `create-list`, `delete-list`, `remove-items`, `help`",
      },
    },
  ],
});

helpCommand.onExecute(results => {
  const { verbose } = results.options;
  const [command] = results.arguments;

  if (verbose) {
    logCliContext(results.context);
  }

  if (!helpCommand.formatSubcommandHelpMessage || !helpCommand.formatCliHelpMessage) {
    console.error("Print help methods are not initialized yet.");
    return;
  }

  if (command) {
    const helpMessage = helpCommand.formatSubcommandHelpMessage(command);
    console.log(helpMessage);
    return;
  }

  const helpMessage = helpCommand.formatCliHelpMessage();
  console.log(helpMessage);
});

function executeHelpCommand(commandName?: InferArgumentsInputType<typeof helpCommand>[0]) {
  helpCommand.execute({ arguments: [commandName] });
}

export { executeHelpCommand, helpCommand };
