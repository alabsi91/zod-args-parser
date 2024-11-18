import { z } from "zod";
import { createSubcommand } from "zod-args-parser";
import { sharedOptions } from "../sharedOptions.js";

const parseArr = (val: unknown) => {
  if (typeof val === "string") {
    return val.split(",").filter(Boolean);
  }
  return val;
};

export const precessSchema = createSubcommand({
  name: "process",
  placeholder: "[options]",
  description: "Simulate processing data",
  example: 'argplay process --name "test" --count 5 --tags tag1,tag2,tag3 --verbose',
  options: [
    {
      name: "name",
      aliases: ["n"],
      placeholder: "<string>",
      description: "The name to process",
      type: z.string(),
    },
    {
      name: "count",
      aliases: ["c"],
      placeholder: "<number>",
      description: "The number of times to process",
      type: z.coerce.number().default(1),
    },
    {
      name: "tags",
      aliases: ["t"],
      placeholder: "<list>",
      description: "Comma-separated tags",
      type: z.preprocess(parseArr, z.array(z.string())),
    },
    ...sharedOptions,
  ],
});

precessSchema.setAction(results => {
  console.log(`Processing "${results.name}" ${results.count} times with tags: ${results.tags}`);
  if (results.verbose) console.log("Verbose mode ON.");
});
