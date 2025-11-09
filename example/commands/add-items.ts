import * as z from "zod";
import { coerce, defineSubcommand, type inferOptionsInputType } from "zod-args-parser";

import { lists } from "../lists.ts";
import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const addItemsCommand = defineSubcommand({
  name: "add-items",
  aliases: ["ai"],
  meta: {
    description: "Add new items to the list.",
    example:
      "listy add --list groceries --items egg,milk,bread --tags food\n" +
      "listy add --list todos --items clean,cook --tags chores,work",
  },

  options: {
    list: {
      aliases: ["l"],
      schema: z.string(),
      coerce: coerce.string,
      meta: {
        placeholder: "<list-name>",
        description: "The name of the list to add items to.",
      },
    },
    items: {
      aliases: ["i"],
      schema: z.set(z.string()),
      coerce: coerce.stringSet(","),
      meta: {
        placeholder: "<item, ...items>",
        descriptionMarkdown: "The items to add to the list. separated by a comma `,`.",
      },
    },
    tags: {
      aliases: ["t"],
      schema: z.string().array().optional(),
      coerce: coerce.stringArray(","),
      meta: {
        placeholder: "<tag, ...tags>",
        descriptionMarkdown: "The tags to add to the list. separated by a comma `,`.",
      },
    },
    ...sharedOptions,
  },
});

addItemsCommand.onExecute(results => {
  const { list, items, tags, verbose } = results.options;

  if (verbose) {
    logCliContext(results.context);
  }

  if (items.size === 0) {
    console.error("No items provided");
    return;
  }

  const getList = lists.get(list);
  if (!getList) {
    console.error(`List "${list}" not found`);
    return;
  }

  const newItems = Array.from(items).map(item => ({ name: item, tags: tags ?? [] }));
  getList.items.push(...newItems);

  console.log(`Added ${items.size} items to the list`);
});

// Provide a programmatic way to execute the command
function executeAddItemsCommand(options: inferOptionsInputType<typeof addItemsCommand>) {
  addItemsCommand.execute({ options });
}

export { addItemsCommand, executeAddItemsCommand };
