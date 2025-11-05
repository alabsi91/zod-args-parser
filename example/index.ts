import { parse } from "../src/index.ts";
import { cliSchema } from "./cli.ts";

// * Test different inputs 👇

const arguments_ = "-h";
// const arguments_ = "--version";

// const arguments_ = "help help";
// const arguments_ = "help add-items";
// const arguments_ = "help create-list";
// const arguments_ = "help delete-list";
// const arguments_ = "help remove-items";

// const arguments_ = "add --list groceries --items egg,milk,bread --tags food";

// const arguments_ = process.argv.slice(2); // 👈 use this in production

const results = parse(arguments_, cliSchema);

// ! Error
if (!results.success) {
  console.error(results.error.message);
  console.log("\n`listy --help` for more information, or `listy help <command>` for command-specific help\n");
}
