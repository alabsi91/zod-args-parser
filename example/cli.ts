import { z } from "zod";
import { createCli, safeParse } from "zod-args-parser";

import { configureSchema } from "./commands/configureCmd.js";
import { convertSchema } from "./commands/convertCmd.js";
import { countSchema } from "./commands/countCmd.js";
import { helpCommandSchema } from "./commands/helpCmd.js";
import { precessSchema } from "./commands/processCmd.js";

// Create a CLI schema
// This will be used when no subcommands are provided
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

// * Test different inputs 👇

const args = ["--help"];
// const args = ["--version"];

// const args = ["help", "process"];
// const args = ["help", "convert"];
// const args = ["help", "configure"];
// const args = ["help", "count"];

// const args = ["process", "--name", "test", "-c", "5", "--tags", "tag1,tag2,tag3", "-v"];
// const args = ["convert", "input.txt", "output.json", "--format", "json", "--overwrite", "--verbose"];
// const args = ["configure", "--enable-logging=false", "--mode", "production"];
// const args = ["list", "item1", "item2", "item3"];

// const args = process.argv.slice(2); // 👈 use this in production

const results = safeParse(
  args,
  cliSchema,
  precessSchema,
  convertSchema,
  configureSchema,
  countSchema,
  helpCommandSchema,
);

// ! Error
if (!results.success) {
  console.error(results.error.message);
  console.log("\n`argplay --help` for more information, or `argplay help <command>` for command-specific help\n");
  process.exit(1);
}
