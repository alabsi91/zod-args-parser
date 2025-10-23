import * as z from "zod";
import { createSubcommand, stringToArray } from "zod-args-parser";
import { sharedOptions } from "../shared.js";

export const precessSchema = createSubcommand({
  name: "process",
  placeholder: "[options]",
  description: "Simulate processing data",
  example: 'argplay process --name "test" --count 5 --tags tag1;tag2;tag3 --verbose',
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
      description: "tags separated by semicolon (;)",
      example: "--tags tag1;tag2;tag3",
      type: z.preprocess((stringValue: string) => stringToArray(stringValue, ";"), z.array(z.string())),
    },
    ...sharedOptions,
  ],
});

precessSchema.setAction(results => {
  console.log(`Processing "${results.name}" ${results.count} times with tags:`, results.tags);
  if (results.verbose) console.log("Verbose mode ON.");
});
