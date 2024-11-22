import { z } from "zod";
import { createArguments, createOptions } from "zod-args-parser";

export const sharedOptions = createOptions([
  {
    name: "verbose",
    aliases: ["v"],
    description: "Enable verbose mode",
    type: z.boolean().optional(),
  },
]);

export const sharedArgs = createArguments([
  {
    name: "input-path",
    description: "The path to the input file",
    type: z.string().optional(),
  },
]);
