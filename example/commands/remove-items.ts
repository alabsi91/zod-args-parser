import * as z from "zod";

import { coerce, createSubcommand, type InferInputType } from "../../src/index.ts";
import { lists } from "../lists.ts";
import { logCliContext } from "../log-verbose.ts";
import { sharedOptions } from "../shared.ts";

const removeItemsSubcommandSchema = createSubcommand({
  name: "remove-items",
  aliases: ["r", "remove"],
  meta: {
    placeholder: "[options] <...items>",
    description: "Remove items from the list.",
    example: "listy remove --list groceries egg milk bread\n" + "listy remove --list todos clean cook",
  },

  options: {
    list: {
      aliases: ["l"],
      type: coerce.string(z.string()),
      meta: {
        placeholder: "<list-name>",
        description: "The name of the list to remove items from.",
      },
    },
    ...sharedOptions,
  },

  // allows any number of positional arguments
  allowPositionals: true,
});

removeItemsSubcommandSchema.setAction(results => {
  const { list, verbose } = results.options;
  const items = results.positionals;

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

  getList.items = getList.items.filter(item => !items.includes(item.name));

  console.log(`Removed ${items.length} items from the list`);
});

type InputType = InferInputType<typeof removeItemsSubcommandSchema>;

// Provide a programmatic way to execute the command
function executeRemoveItemsCommand(listName: InputType["options"]["list"], ...items: InputType["positionals"]) {
  removeItemsSubcommandSchema.execute({ options: { list: listName }, positionals: items });
}

export { removeItemsSubcommandSchema, executeRemoveItemsCommand };
