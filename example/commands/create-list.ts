import * as z from "zod";
import { coerce, defineSubcommand, type InferArgumentsInputType } from "zod-args-parser";

import { lists } from "../lists.ts";
import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const createListCommand = defineSubcommand({
  name: "create-list",
  aliases: ["cl"],
  meta: {
    description: "Create a new list.",
    example: 'listy create-list groceries "List of groceries"',
  },

  options: {
    overwrite: {
      aliases: ["o"],
      schema: z.boolean().default(false),
      coerce: coerce.boolean,
      meta: {
        description: "Overwrite the list if it already exists.",
      },
    },
    ...sharedOptions,
  },

  arguments: {
    listName: {
      schema: z.string(),
      meta: {
        description: "The name of the list to create.",
      },
    },
    listDescription: {
      schema: z.string().optional(),
      meta: {
        description: "The description of the list to create.",
      },
    },
  },
});

createListCommand.onExecute(results => {
  const { overwrite, verbose } = results.options;
  const { listName, listDescription } = results.arguments;

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
function executeCreateList({ listName, listDescription }: InferArgumentsInputType<typeof createListCommand>) {
  createListCommand.execute({ arguments: { listName, listDescription } });
}

export { createListCommand, executeCreateList };
