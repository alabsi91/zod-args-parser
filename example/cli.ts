import { coerce, defineCLI, helpMessageStyles } from "typed-arg-parser";
import * as z from "zod";

import { addItemsCommand } from "./commands/add-items.ts";
import { createListCommand } from "./commands/create-list.ts";
import { deleteListCommand } from "./commands/delete-list.ts";
import { helpCommand } from "./commands/help-cmd.ts";
import { removeItemsCommand } from "./commands/remove-items.ts";
import { viewListCommand } from "./commands/view-list.ts";

export const listCli = defineCLI({
  cliName: "listy",
  meta: {
    descriptionMarkdown: "**Listy** is a simple CLI to showcase arguments **parsing** and **validation**.",
    example:
      "listy --help" +
      "\nlisty help add-items" +
      "\nlisty add-items --list groceries --items egg,milk,bread --tags food" +
      "\nlisty remove-items --list todos clean cook" +
      '\nlisty create-list groceries "List of groceries"' +
      "\nlisty delete-list groceries",
  },

  subcommands: [
    addItemsCommand,
    removeItemsCommand,
    createListCommand,
    deleteListCommand,
    viewListCommand,
    helpCommand,
  ],

  options: {
    help: {
      aliases: ["h"],
      requires: ["version"],
      type: z.object({ value: z.boolean().optional() }),
      coerce: coerce.boolean,
      meta: {
        description: "Show help message.",
      },
    },
    version: {
      aliases: ["v"],
      // conflictWith: ["help"],
      type: z.object({ value: z.boolean().optional() }),
      coerce: coerce.boolean,
      meta: {
        description: "Show listy version.",
      },
    },
  },

  arguments: [
    {
      name: "list",
      requires: ["help"],
      type: z.object({ value: z.string().optional() }),
      coerce: coerce.string,
      meta: {
        description: "List name.",
      },
    },
  ],
});

// Execute this function when the CLI is run
listCli.onExecute(results => {
  const { help, version } = results.options;

  if (help) {
    if (!listCli.formatCliHelpMessage) {
      console.error("Cli schema is not initialized.");
      return;
    }

    const helpMessage = listCli.formatCliHelpMessage({ style: helpMessageStyles.gruvboxDark });
    console.log(helpMessage);
    return;
  }

  if (version) {
    console.log("v1.0.0");
    return;
  }

  console.error("Please try `listy --help`");
});
