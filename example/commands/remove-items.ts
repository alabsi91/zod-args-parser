import { coerce, defineSubcommand, type InferInputType } from "typed-arg-parser";
import * as z from "zod";

import { lists } from "../lists.ts";
import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const removeItemsCommand = defineSubcommand({
  name: "remove-items",
  aliases: ["ri"],
  meta: {
    placeholder: "[options] <...items>",
    description: "Remove items from the list.",
    example: "listy remove --list groceries egg milk bread\n" + "listy remove --list todos clean cook",
  },

  options: {
    list: {
      aliases: ["l"],
      type: z.object({ value: z.string() }),
      coerce: coerce.string,
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

  getList.items = getList.items.filter(item => !items.includes(item.name));

  console.log(`Removed ${items.length} items from the list`);
});

type InputType = InferInputType<typeof removeItemsCommand>;

// Provide a programmatic way to execute the command
function executeRemoveItemsCommand(listName: InputType["options"]["list"], ...items: InputType["positionals"]) {
  removeItemsCommand.execute({ options: { list: listName }, positionals: items });
}

export { removeItemsCommand, executeRemoveItemsCommand };
