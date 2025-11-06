import { listCli } from "./cli.ts";

// import "./scripts/generate-autocomplete-script.ts";
// import "./scripts/generate-markdown.ts";

// * Test different inputs 👇

// const input = "-h --verbose";
// const input = "--version --verbose";

// const input = "help help --verbose";
// const input = "help add-items --verbose";
// const input = "help create-list --verbose";
// const input = "help delete-list --verbose";
// const input = "help remove-items --verbose";

// const input = "add --list groceries --items egg,milk,bread --tags food --verbose";
const input = "view-list --verbose";

// const input = process.argv.slice(2); // 👈 use this in production

const results = listCli.run(input);

// ! Error
if (results.error) {
  console.error(results.error.message);
  console.log("\n`listy --help` for more information, or `listy help <command>` for command-specific help\n");
}
