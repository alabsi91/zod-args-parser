import * as z from "zod";
import { coerce, defineCLI, helpMessageStyles } from "zod-args-parser";

import { addItemsCommand } from "./commands/add-items.ts";
import { createListCommand } from "./commands/create-list.ts";
import { deleteListCommand } from "./commands/delete-list.ts";
import { helpCommand } from "./commands/help-cmd.ts";
import { removeItemsCommand } from "./commands/remove-items.ts";
import { viewListCommand } from "./commands/view-list.ts";

export const listyCLI = defineCLI({
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
      exclusive: true,
      schema: z.boolean().optional(),
      coerce: coerce.boolean,
      meta: {
        description: "Show help message.",
      },
    },
    version: {
      aliases: ["v"],
      schema: z.boolean().optional(),
      coerce: coerce.boolean,
      meta: {
        description: "Show listy version.",
      },
    },
  },
});

// Execute this function when the CLI is run
listyCLI.onExecute(results => {
  const { help, version } = results.options;

  if (help) {
    if (!listyCLI.generateCliHelpMessage) {
      console.error("Cli schema is not initialized.");
      return;
    }

    const helpMessage = listyCLI.generateCliHelpMessage({ style: helpMessageStyles.catppuccin });
    console.log(helpMessage);
    return;
  }

  if (version) {
    console.log("v1.0.0");
    return;
  }

  console.error("Please try `listy --help`");
});
