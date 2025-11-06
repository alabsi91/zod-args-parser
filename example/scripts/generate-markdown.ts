import { writeFileSync } from "node:fs";
import path from "node:path";

import { generateMarkdown } from "../../src/index.ts";
import { listCli } from "../cli.ts";

const markdown = generateMarkdown(listCli);

writeFileSync(path.join(import.meta.dirname, "..", "README.md"), markdown, { encoding: "utf8" });
