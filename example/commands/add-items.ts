import * as z from "zod";
import { coerce, createSubcommand, type InferInputType } from "zod-args-parser";
import { lists } from "../lists.ts";
import { logCliContext } from "../log-verbose.ts";
import { sharedOptions } from "../shared.ts";

const addItemsSubcommandSchema = createSubcommand({
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
      type: coerce.string(z.string().default("default")),
      meta: {
        placeholder: "<list-name>",
        description: "The name of the list to add items to.",
      },
    },
    items: {
      aliases: ["i"],
      type: coerce.arrayOfStrings(z.string().array(), ","),
      meta: {
        placeholder: "<item, ...items>",
        descriptionMarkdown: "The items to add to the list. separated by a comma `,`.",
      },
    },
    tags: {
      aliases: ["t"],
      type: coerce.arrayOfStrings(z.string().array().optional(), ","),
      meta: {
        placeholder: "<tag, ...tags>",
        descriptionMarkdown: "The tags to add to the list. separated by a comma `,`.",
      },
    },
    ...sharedOptions,
  },
});

addItemsSubcommandSchema.setAction(results => {
  const { list, items, tags, verbose } = results.options;

  if (verbose) {
    logCliContext(results.context);
  }

  if (items.length === 0) {
    console.error("No items provided");
    return;
  }

  const getList = lists.get(list);
  if (!getList) {
    console.error(`List "${list}" not found`);
    return;
  }

  const newItems = items.map(item => ({ name: item, tags: tags ?? [] }));
  getList.items.push(...newItems);

  console.log(`Added ${items.length} items to the list`);
});

// Provide a programmatic way to execute the command
function executeAddItemsCommand(options: InferInputType<typeof addItemsSubcommandSchema>["options"]) {
  addItemsSubcommandSchema.execute({ options });
}

export { addItemsSubcommandSchema, executeAddItemsCommand };
