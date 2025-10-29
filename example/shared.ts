import * as z from "zod";
import { createArguments, createOptions } from "zod-args-parser";

export const sharedOptions = createOptions([
  {
    name: "verbose",
    aliases: ["v"],
    type: z.boolean().optional(),
    meta: {
      description: "Enable verbose mode",
    },
  },
]);

export const sharedArguments = createArguments([
  {
    name: "input-path",
    description: "The path to the input file",
    type: z.string().optional(),
    meta: {
      description: "<string>",
    },
  },
]);
