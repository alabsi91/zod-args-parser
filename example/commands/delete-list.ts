import * as z from "zod";
import { coerce, createSubcommand } from "zod-args-parser";
import { lists } from "../lists.ts";
import { logCliContext } from "../log-verbose.ts";
import { sharedOptions } from "../shared.ts";

const deleteListSubcommandSchema = createSubcommand({
  name: "delete-list",
  aliases: ["dl"],
  meta: {
    description: "Delete a specific list.",
    example: "listy delete-list groceries",
  },

  options: sharedOptions,

  arguments: [
    {
      type: coerce.string(z.string()),
      meta: {
        name: "list-name",
        description: "The name of the list to delete.",
      },
    },
  ],
});

deleteListSubcommandSchema.setAction(results => {
  const { verbose } = results.options;
  const [listName] = results.arguments;

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
  deleteListSubcommandSchema.execute({ arguments: [listName] });
}

export { deleteListSubcommandSchema, executeDeleteListCommand };
