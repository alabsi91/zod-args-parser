import * as z from "zod";
import { createSubcommand, stringToArray } from "zod-args-parser";
import { sharedOptions } from "../shared.js";

export const precessSchema = createSubcommand({
  name: "process",
  meta: {
    placeholder: "[options]",
    description: "Simulate processing data",
    example: 'argplay process --name "test" --count 5 --tags tag1;tag2;tag3 --verbose',
  },
  options: [
    {
      name: "name",
      aliases: ["n"],
      type: z.string(),
      meta: {
        placeholder: "<string>",
        description: "The name to process",
      },
    },
    {
      name: "count",
      aliases: ["c"],
      type: z.coerce.number().default(1),
      meta: {
        placeholder: "<number>",
        description: "The number of times to process",
      },
    },
    {
      name: "tags",
      aliases: ["t"],
      type: z.preprocess((stringValue: string) => stringToArray(stringValue, ";"), z.array(z.string())),
      meta: {
        placeholder: "<list>",
        description: "tags separated by semicolon (;)",
        example: "--tags tag1;tag2;tag3",
      },
    },
    ...sharedOptions,
  ],
});

precessSchema.setAction(({ options }) => {
  console.log(`Processing "${options.name}" ${options.count} times with tags:`, options.tags);
  if (options.verbose) console.log("Verbose mode ON.");
});
