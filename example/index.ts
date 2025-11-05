import { cliSchema } from "./cli.ts";

// * Test different inputs 👇

const input = "-h sdf";
// const input = "--version";

// const input = "help help";
// const input = "help add-items";
// const input = "help create-list";
// const input = "help delete-list";
// const input = "help remove-items";

// const input = "add --list groceries --items egg,milk,bread --tags food";

// const input = process.argv.slice(2); // 👈 use this in production

const results = cliSchema.validate(input);

// ! Error
if (results.error) {
  console.error(results.error.message);
  console.log("\n`listy --help` for more information, or `listy help <command>` for command-specific help\n");
}
