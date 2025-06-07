import { writeFile } from "node:fs/promises";
import { generateMarkdown } from "zod-args-parser";
import { cliCommands } from "./cli.js";

const markdown = generateMarkdown(...cliCommands);
await writeFile("./CLI.md", markdown, { encoding: "utf-8" });
