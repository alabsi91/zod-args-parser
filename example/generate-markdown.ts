import { writeFile } from "node:fs/promises";

import { generateMarkdown } from "../src/index.ts";
import { cliSchema } from "./cli.ts";

const markdown = generateMarkdown(cliSchema);
await writeFile("./CLI.md", markdown, { encoding: "utf8" });
