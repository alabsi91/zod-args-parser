import * as z from "zod";
import { createCli, helpMsgStyles } from "zod-args-parser";

import { configureSchema } from "./commands/configure-cmd.ts";
import { convertSchema } from "./commands/convert-cmd.ts";
import { countSchema } from "./commands/count-cmd.ts";
import { helpCommandSchema } from "./commands/help-cmd.ts";
import { precessSchema } from "./commands/process-cmd.ts";

// Create a CLI schema
// This will be used when no subcommands are provided. E.g. `argplay --help`
const cliSchema = createCli({
  cliName: "argplay",
  description: "A CLI to test argument parsing",
  example: "example of how to use argplay\nargplay --help",
  options: [
    {
      name: "help",
      aliases: ["h"],
      description: "Show this help message",
      type: z.boolean().optional(),
    },
    {
      name: "version",
      aliases: ["v"],
      description: "Show version",
      type: z.boolean().optional(),
    },
  ],
});

// Execute this function when the CLI is run
cliSchema.setAction(results => {
  const { help, version } = results;

  if (help) {
    results.printCliHelp(helpMsgStyles.default);
    return;
  }

  if (version) {
    console.log("v1.0.0");
    return;
  }

  console.error("Please try `argplay --help`");
});

export const cliSchemas = [
  cliSchema,
  precessSchema,
  convertSchema,
  configureSchema,
  countSchema,
  helpCommandSchema,
] as const;
