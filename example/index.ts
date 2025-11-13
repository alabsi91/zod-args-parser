import { listyCLI } from "./cli.ts";
// import "./scripts/generate-autocomplete-script.ts";
import "./scripts/generate-markdown.ts";

// * Test different inputs 👇

// const input = `--db.https=true --db.credentials.user true --db.credentials.pass toor --db.port 3000`;
// const input = `-h`;
// const input = "-v";

// const input = "help --verbose";
// const input = "help help --verbose";
const input = "help add-items --verbose";
// const input = "help create-list --verbose";
// const input = "help delete-list --verbose";
// const input = "help remove-items --verbose";

// const input = `create-list groceries "List of groceries" --verbose`;
// const input = "add-items --list groceries --items egg,milk,bread --tags food --verbose";
// const input = "remove-items --list groceries Egg Milk";
// const input = "view-list --verbose";
// const input = "delete-list groceries --verbose";

// const input = process.argv.slice(2); // 👈 use this in production

const results = listyCLI.run(input);

// ! Error
if (results.error) {
  console.error(results.error.message);
  console.log("\n`listy --help` for more information, or `listy help <command>` for command-specific help\n");
}
