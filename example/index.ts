import { safeParse } from "zod-args-parser";
import { cliCommands } from "./cli.js";

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

const results = safeParse(args, ...cliCommands);

// ! Error
if (!results.success) {
  console.error(results.error.message);
  console.log("\n`argplay --help` for more information, or `argplay help <command>` for command-specific help\n");
  process.exit(1);
}
