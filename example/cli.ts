import * as z from "zod";
import { coerce, defineCLI, helpMessageStyles } from "zod-args-parser";

import { addItemsCommand } from "./commands/add-items.ts";
import { createListCommand } from "./commands/create-list.ts";
import { deleteListCommand } from "./commands/delete-list.ts";
import { helpCommand } from "./commands/help-cmd.ts";
import { removeItemsCommand } from "./commands/remove-items.ts";
import { viewListCommand } from "./commands/view-list.ts";

const defaultDB = {
  host: "localhost",
  port: 5432,
  https: false,
  credentials: {
    user: "postgres",
    pass: "postgres",
  },
};

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
    /**
     * 💡 **Tip:** Adding a **JSDoc** comment here will be displayed in IDE hovers alongside the TypeScript type.
     *
     * `--help` or `-h`
     */
    help: {
      aliases: ["h"],
      exclusive: true,
      schema: z.boolean().optional(),
      coerce: coerce.boolean,
      meta: {
        description: "Show help message.",
      },
    },

    /** `--version` or `-v` */
    version: {
      aliases: ["v"],
      schema: z.boolean().optional(),
      coerce: coerce.boolean,
      meta: {
        description: "Show listy version.",
      },
    },

    db: {
      schema: z
        .object({
          host: z.string().default("localhost"),
          port: z.number().default(5432),
          https: z.boolean().default(false),
          credentials: z.object({ user: z.string(), pass: z.string() }),
        })
        .default(defaultDB),
      coerce: coerce.object({ coerceBoolean: ["https"], coerceNumber: ["port"] }),
    },
  },
});

// Execute this function when the CLI is run
listyCLI.onExecute(results => {
  const { help, version } = results.options;

  console.log(results.options.db);
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
