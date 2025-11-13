import * as z from "zod";
import { defineSubcommand, type InferInputType } from "zod-args-parser";

import { lists } from "../lists.ts";
import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const removeItemsCommand = defineSubcommand({
  name: "remove-items",
  aliases: ["ri"],
  meta: {
    placeholder: "[options] <...items>",
    description: "Remove items from the list.",
    example: "listy remove-items --list groceries egg milk bread\n" + "listy remove-items --list todos clean cook",
  },

  options: {
    /** `--list` or `-l` */
    list: {
      aliases: ["l"],
      schema: z.string(),
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

removeItemsCommand.onExecute(results => {
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

  let removedCount = 0;

  for (const item of items) {
    const index = getList.items.findIndex(listItem => listItem.name === item);
    if (index === -1) {
      console.error(`Item "${item}" not found in list "${list}"`);
      continue;
    }

    getList.items.splice(index, 1);
    removedCount++;
  }

  console.log(`Removed ${removedCount} items from the list`);
});

type InputType = InferInputType<typeof removeItemsCommand>;

// Provide a programmatic way to execute the command
function executeRemoveItemsCommand(listName: InputType["options"]["list"], ...items: InputType["positionals"]) {
  removeItemsCommand.execute({ options: { list: listName }, positionals: items });
}

export { executeRemoveItemsCommand, removeItemsCommand };
