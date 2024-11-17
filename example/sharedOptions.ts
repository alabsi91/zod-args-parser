import { z } from "zod";
import { createOptions } from "zod-args-parser";

export const sharedOptions = createOptions([
  {
    name: "verbose",
    aliases: ["v"],
    description: "Enable verbose mode",
    type: z.boolean().optional(),
  },
]);
