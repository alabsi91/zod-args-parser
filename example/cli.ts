import * as z from "zod";
import { createCli } from "zod-args-parser";

import { configureSchema } from "./commands/configureCmd.js";
import { convertSchema } from "./commands/convertCmd.js";
import { countSchema } from "./commands/countCmd.js";
import { helpCommandSchema } from "./commands/helpCmd.js";
import { precessSchema } from "./commands/processCmd.js";

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
      type: z.boolean().optional().describe("Show this help message"),
    },
    {
      name: "version",
      aliases: ["v"],
      type: z.boolean().optional().describe("Show version"),
    },
  ],
});

// Execute this function when the CLI is run
cliSchema.setAction(results => {
  const { help, version } = results;

  if (help) {
    results.printCliHelp();
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
