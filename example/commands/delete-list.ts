import * as z from "zod";
import { coerce, defineSubcommand } from "zod-args-parser";

import { lists } from "../lists.ts";
import { sharedOptions } from "../shared.ts";
import { logCliContext } from "../utilities.ts";

const deleteListCommand = defineSubcommand({
  name: "delete-list",
  aliases: ["dl"],
  meta: {
    description: "Delete a specific list.",
    example: "listy delete-list groceries",
  },

  options: sharedOptions,

  arguments: {
    listName: {
      schema: z.string(),
      coerce: coerce.string,
      meta: {
        description: "The name of the list to delete.",
      },
    },
  },
});

deleteListCommand.onExecute(results => {
  const { verbose } = results.options;
  const { listName } = results.arguments;

  if (verbose) {
    logCliContext(results.context);
  }

  if (!lists.has(listName)) {
    console.error("List not found");
    return;
  }

  lists.delete(listName);

  console.log(`Deleted list "${listName}"`);
});

// Provide a programmatic way to execute the command
function executeDeleteListCommand(listName: string) {
  deleteListCommand.execute({ arguments: { listName } });
}

export { deleteListCommand, executeDeleteListCommand };
