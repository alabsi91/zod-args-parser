import { defineArguments, defineOptions, coerce } from "zod-args-parser";
import * as z from "zod";

export const sharedOptions = defineOptions({
  verbose: {
    schema: z.boolean().optional(),
    coerce: coerce.boolean,
    meta: {
      description: "Enable verbose mode.",
    },
  },

  debug: {
    schema: z.boolean().optional(),
    coerce: coerce.boolean,
    meta: {
      description: "Enable debug mode.",

      // Only for internal use
      hidden: true,
    },
  },
});

export const sharedArguments = defineArguments({
  "input-path": {
    schema: z.string().optional(),
    coerce: coerce.string,
    meta: {
      description: "The path to the input file",
      example: "input.txt\ninput.json\ninput.csv",
    },
  },
});
