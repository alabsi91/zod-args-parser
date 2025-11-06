import * as z from "zod";

import { coerce, createCli } from "../src/index.ts";
import { addItemsCommand } from "./commands/add-items.ts";
import { createListCommand } from "./commands/create-list.ts";
import { deleteListCommand } from "./commands/delete-list.ts";
import { helpCommand } from "./commands/help-cmd.ts";
import { removeItemsCommand } from "./commands/remove-items.ts";
import { viewListCommand } from "./commands/view-list.ts";
import { sharedOptions } from "./shared.ts";
import { logCliContext } from "./utilities.ts";

export const listCli = createCli({
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
      type: coerce.boolean(z.boolean().optional()),
      meta: {
        description: "Show help message.",
      },
    },
    version: {
      aliases: ["v"],

      // Zod: `z.boolean().optional()` | `z.boolean().default(false)`
      // Arktype: `type("boolean|undefined")` default and optional are not supported for primitive types
      type: coerce.boolean(z.boolean().optional()),
      meta: {
        description: "Show listy version.",
      },
    },

    ...sharedOptions,
  },
});

// Execute this function when the CLI is run
listCli.onExecute(results => {
  const { help, version, verbose } = results.options;

  if (verbose) {
    logCliContext(results.context);
  }

  if (help) {
    if (!listCli.formatCliHelpMessage) {
      console.error("Cli schema is not initialized.");
      return;
    }

    const helpMessage = listCli.formatCliHelpMessage();
    console.log(helpMessage);
    return;
  }

  if (version) {
    console.log("v1.0.0");
    return;
  }

  console.error("Please try `listy --help`");
});
