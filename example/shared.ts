import * as z from "zod";

import { createArguments, createOptions, coerce } from "../src/index.ts";

export const sharedOptions = createOptions({
  verbose: {
    type: coerce.boolean(z.boolean().optional()),
    meta: {
      description: "Enable verbose mode.",
    },
  },

  debug: {
    type: coerce.boolean(z.boolean().optional()),
    meta: {
      description: "Enable debug mode.",

      // Only for internal use
      hidden: true,
    },
  },
});

export const sharedArguments = createArguments({
  type: coerce.string(z.string().optional()),
  meta: {
    name: "input-path",
    description: "The path to the input file",
    example: "input.txt\ninput.json\ninput.csv",
  },
});
