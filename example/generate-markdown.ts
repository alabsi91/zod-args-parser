import { writeFile } from "node:fs/promises";
import { generateMarkdown } from "zod-args-parser";
import { cliSchema } from "./cli.js";

const markdown = generateMarkdown(cliSchema);
await writeFile("./CLI.md", markdown, { encoding: "utf8" });
