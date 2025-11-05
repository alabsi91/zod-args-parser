import * as z from "zod";

import { coerce, createSubcommand, type InferInputType } from "../../src/index.ts";
import { lists } from "../lists.ts";
import { logCliContext } from "../log-verbose.ts";
import { sharedOptions } from "../shared.ts";

const createListSubcommandSchema = createSubcommand({
  name: "create-list",
  aliases: ["cl"],
  meta: {
    description: "Create a new list.",
    example: 'listy create-list groceries "List of groceries"',
  },

  options: {
    overwrite: {
      aliases: ["o"],
      type: coerce.boolean(z.boolean().default(false)),
      meta: {
        description: "Overwrite the list if it already exists.",
      },
    },
    ...sharedOptions,
  },

  arguments: [
    {
      type: coerce.string(z.string()),
      meta: {
        name: "list-name",
        description: "The name of the list to create.",
      },
    },
    {
      type: coerce.string(z.string().optional()),
      meta: {
        name: "list-description",
        description: "The description of the list to create.",
      },
    },
  ],
});

createListSubcommandSchema.setAction(results => {
  const { overwrite, verbose } = results.options;
  const [listName, listDescription] = results.arguments;

  if (verbose) {
    logCliContext(results.context);
  }

  const exists = lists.has(listName);
  if (exists && !overwrite) {
    console.error(`List "${listName}" already exists`);
    return;
  }

  lists.set(listName, {
    name: listName,
    description: listDescription,
    items: [],
  });

  console.log(`Created list "${listName}" with description "${listDescription}"`);
});

// Provide a programmatic way to execute the command
function executeCreateListCommand(
  ...[name, description]: InferInputType<typeof createListSubcommandSchema>["arguments"]
) {
  createListSubcommandSchema.execute({ arguments: [name, description] });
}

export { createListSubcommandSchema, executeCreateListCommand };
