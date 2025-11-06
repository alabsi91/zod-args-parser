import * as z from "zod";

import { coerce, createSubcommand, type InferArgumentsInputType } from "../../src/index.ts";
import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const helpCommand = createSubcommand({
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
