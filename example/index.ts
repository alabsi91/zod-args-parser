import { safeParse } from "zod-args-parser";
import { cliSchemas } from "./cli.js";

// * Test different inputs 👇

// const arguments_: string[] = ["-h"];
// const arguments_: string[] = ["--version"];

// const arguments_: string[] = ["help", "help"];
// const arguments_: string[] = ["help", "process"];
const arguments_: string[] = ["help", "convert"];
// const arguments_: string[] = ["help", "configure"];
// const arguments_: string[] = ["help", "count"];

// const arguments_: string[] = ["process", "--name", "test", "-c", "5", "--tags", "tag1;tag2;tag3", "-v"];
// const arguments_: string[] = ["convert", "input.txt", "output.json", "--format", "json", "--overwrite", "--verbose"];
// const arguments_: string[] = ["configure", "--enable-logging=false", "--mode", "production"];
// const arguments_: string[] = ["list", "item1", "item2", "item3"];

// const arguments_ = process.argv.slice(2); // 👈 use this in production

const results = safeParse(arguments_, ...cliSchemas);

// ! Error
if (!results.success) {
  console.error(results.error.message);
  console.log("\n`argplay --help` for more information, or `argplay help <command>` for command-specific help\n");
}
