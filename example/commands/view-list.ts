import * as z from "zod";
import { defineSubcommand, type InferArgumentsInputType } from "zod-args-parser";

import { lists } from "../lists.ts";
import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const viewListCommand = defineSubcommand({
  name: "view-list",
  aliases: ["vl"],
  meta: {
    description: "View a specific list or all lists.",
    example: "listy view-list groceries",
  },

  options: sharedOptions,

  arguments: {
    listName: {
      schema: z.string().optional(),
      meta: {
        description: "The name of the list to view. Leave blank to view all lists.",
      },
    },
  },
});

viewListCommand.onExecute(results => {
  const { verbose } = results.options;
  const { listName } = results.arguments;

  if (verbose) {
    logCliContext(results.context);
  }

  if (listName) {
    const list = lists.get(listName);
    if (!list) {
      console.error(`List "${listName}" not found`);
      return;
    }

    console.log(`Viewing list "${listName}" with description "${list.description}"`);

    if (list.items.length === 0) {
      console.log("  No items found");
      return;
    }

    console.log("Items:");
    for (const item of list.items) {
      console.log(`  - ${item.name}`.padEnd(10), "| tags:", item.tags.join(", "));
    }

    return;
  }

  console.log("Viewing all lists:");
  for (const [listName, list] of lists) {
    console.log(`- ${listName} (${list.description})`);

    if (list.items.length === 0) {
      console.log("  No items found\n");
      continue;
    }

    for (const item of list.items) {
      console.log(`  - ${item.name}`.padEnd(10), "tags:", item.tags.join(", "));
    }

    console.log();
  }
});

function executeViewListCommand(listName: InferArgumentsInputType<typeof viewListCommand>["listName"]) {
  viewListCommand.execute({ arguments: { listName } });
}

export { executeViewListCommand, viewListCommand };
