import { createArguments, createOptions, coerce } from "typed-arg-parser";
import * as z from "zod";

export const sharedOptions = createOptions({
  verbose: {
    type: z.object({ value: z.boolean().optional() }),
    coerce: coerce.boolean,
    meta: {
      description: "Enable verbose mode.",
    },
  },

  debug: {
    type: z.object({ value: z.boolean().optional() }),
    coerce: coerce.boolean,
    meta: {
      description: "Enable debug mode.",

      // Only for internal use
      hidden: true,
    },
  },
});

export const sharedArguments = createArguments({
  type: z.object({ value: z.string().optional() }),
  coerce: coerce.string,
  meta: {
    name: "input-path",
    description: "The path to the input file",
    example: "input.txt\ninput.json\ninput.csv",
  },
});
