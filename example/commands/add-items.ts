import * as z from "zod";

import { coerce, createSubcommand, type inferOptionsInputType } from "../../src/index.ts";
import { lists } from "../lists.ts";
import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const addItemsCommand = createSubcommand({
  name: "add-items",
  aliases: ["a", "add"],
  meta: {
    description: "Add new items to the list.",
    example:
      "listy add --list groceries --items egg,milk,bread --tags food\n" +
      "listy add --list todos --items clean,cook --tags chores,work",
  },

  options: {
    list: {
      aliases: ["l"],
      type: z.object({ value: z.string() }),
      coerce: coerce.string,
      meta: {
        placeholder: "<list-name>",
        description: "The name of the list to add items to.",
      },
    },
    items: {
      aliases: ["i"],
      type: z.object({ value: z.set(z.string()) }),
      coerce: coerce.stringSet(","),
      meta: {
        placeholder: "<item, ...items>",
        descriptionMarkdown: "The items to add to the list. separated by a comma `,`.",
      },
    },
    tags: {
      aliases: ["t"],
      type: z.object({ value: z.string().array().optional() }),
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
