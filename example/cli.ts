import * as z from "zod";

import { coerce, createCli } from "../src/index.ts";
import { addItemsSubcommandSchema } from "./commands/add-items.ts";
import { createListSubcommandSchema } from "./commands/create-list.ts";
import { deleteListSubcommandSchema } from "./commands/delete-list.ts";
import { helpSubcommandSchema } from "./commands/help-cmd.ts";
import { removeItemsSubcommandSchema } from "./commands/remove-items.ts";
import { logCliContext } from "./log-verbose.ts";
import { sharedOptions } from "./shared.ts";

export const cliSchema = createCli({
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
    addItemsSubcommandSchema,
    removeItemsSubcommandSchema,
    createListSubcommandSchema,
    deleteListSubcommandSchema,
    helpSubcommandSchema,
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
cliSchema.setAction(results => {
  const { help, version, verbose } = results.options;

  if (verbose) {
    logCliContext(results.context);
  }

  if (help) {
    if (!cliSchema.formatCliHelpMessage) {
      console.error("Cli schema is not initialized.");
      return;
    }

    const helpMessage = cliSchema.formatCliHelpMessage();
    console.log(helpMessage);
    return;
  }

  if (version) {
    console.log("v1.0.0");
    return;
  }

  console.error("Please try `listy --help`");
});
