import { createSubcommand } from "zod-args-parser";

export const countSchema = createSubcommand({
  name: "count",
  aliases: ["list"],
  description: "Print a list of items provided by the user",
  allowPositional: true,
});

countSchema.setAction(results => {
  const items = results.positional;
  if (items.length === 0) {
    console.log("No items provided");
    return;
  }

  console.log("-- List of items --\n", "-", items.join("\n - "));
});
