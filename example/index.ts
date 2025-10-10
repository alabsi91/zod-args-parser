import { safeParse } from "zod-args-parser";
import { cliSchemas } from "./cli.js";

// * Test different inputs 👇

const args: string[] = ["-h"];
// const args: string[] = ["--version"];

// const args: string[] = ["help", "help"];
// const args: string[] = ["help", "process"];
// const args: string[] = ["help", "convert"];
// const args: string[] = ["help", "configure"];
// const args: string[] = ["help", "count"];

// const args: string[] = ["process", "--name", "test", "-c", "5", "--tags", "tag1;tag2;tag3", "-v"];
// const args: string[] = ["convert", "input.txt", "output.json", "--format", "json", "--overwrite", "--verbose"];
// const args: string[] = ["configure", "--enable-logging=false", "--mode", "production"];
// const args: string[] = ["list", "item1", "item2", "item3"];

// const args = process.argv.slice(2); // 👈 use this in production

const results = safeParse(args, ...cliSchemas);

// ! Error
if (!results.success) {
  console.error(results.error.message);
  console.log("\n`argplay --help` for more information, or `argplay help <command>` for command-specific help\n");
  process.exit(1);
}
