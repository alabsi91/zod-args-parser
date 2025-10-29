import { createSubcommand } from "zod-args-parser";

export const countSchema = createSubcommand({
  name: "count",
  aliases: ["list"],
  meta: {
    description: "Print a list of items provided by the user",
  },
  allowPositionals: true,
});

countSchema.setAction(results => {
  const items = results.positionals;
  if (items.length === 0) {
    console.log("No items provided");
    return;
  }

  console.log("-- List of items --\n", "-", items.join("\n - "));
});
