import * as z from "zod";
import { coerce, defineSubcommand, type InferArgumentsInputType } from "zod-args-parser";

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

  arguments: {
    commandName: {
      schema: z.enum(["add-items", "create-list", "delete-list", "remove-items", "help"]).optional(),
      coerce: coerce.string,
      meta: {
        descriptionMarkdown:
          "Command to print help for." +
          "\n**Available commands:** `add-items`, `create-list`, `delete-list`, `remove-items`, `help`",
      },
    },
  },
});

helpCommand.onExecute(results => {
  const { verbose } = results.options;
  const { commandName } = results.arguments;

  if (verbose) {
    logCliContext(results.context);
  }

  if (!helpCommand.generateSubcommandHelpMessage || !helpCommand.generateCliHelpMessage) {
    console.error("Print help methods are not initialized yet.");
    return;
  }

  if (commandName) {
    const helpMessage = helpCommand.generateSubcommandHelpMessage(commandName);
    console.log(helpMessage);
    return;
  }

  const helpMessage = helpCommand.generateCliHelpMessage();
  console.log(helpMessage);
});

function executeHelpCommand(commandName?: InferArgumentsInputType<typeof helpCommand>["commandName"]) {
  helpCommand.execute({ arguments: { commandName } });
}

export { executeHelpCommand, helpCommand };
