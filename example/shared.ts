import * as z from "zod";
import { defineOptions, coerce } from "zod-args-parser";

export const sharedOptions = defineOptions({
  /** `--verbose` */
  verbose: {
    schema: z.boolean().optional(),
    coerce: coerce.boolean,
    meta: {
      description: "Enable verbose mode.",
    },
  },
});
