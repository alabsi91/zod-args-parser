import { writeFile } from "node:fs/promises";
import { generateMarkdown } from "zod-args-parser";
import { cliSchemas } from "./cli.js";

const markdown = generateMarkdown(...cliSchemas);
await writeFile("./CLI.md", markdown, { encoding: "utf8" });
