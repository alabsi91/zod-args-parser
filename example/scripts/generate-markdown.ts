import { writeFileSync } from "node:fs";
import path from "node:path";
import { generateMarkdown } from "zod-args-parser";

import { listyCLI } from "../cli.ts";

const markdown = generateMarkdown(listyCLI);

writeFileSync(path.join(import.meta.dirname, "..", "README.md"), markdown, { encoding: "utf8" });
