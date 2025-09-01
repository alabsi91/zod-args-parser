import c from "chalk";
import * as z from "zod";
import { createSubcommand } from "zod-args-parser";
import { sharedOptions } from "../shared.js";

export const convertSchema = createSubcommand({
  name: "convert",
  usage: `${c.dim("$")} argplay ${c.yellow("convert")} ${c.green("<source> <destination>")} ${c.cyan("[options]")}`,
  description: "Simulate file conversion",
  placeholder: "<source> <destination>",
  example: 'argplay convert "input.txt" "output.csv" --format csv --overwrite',
  options: [
    {
      name: "format",
      aliases: ["f"],
      placeholder: "<string>",
      description: "Target format",
      example: "json or csv",
      type: z.string(),
    },
    {
      name: "overwrite",
      description: "Overwrite existing file",
      type: z.boolean().default(false),
    },
    ...sharedOptions,
  ],
  arguments: [
    {
      name: "source",
      description: "Source file",
      type: z.string(),
    },
    {
      name: "destination",
      description: "Destination file",
      type: z.string(),
    },
  ],
});

convertSchema.setAction(results => {
  const [source, destination] = results.arguments;
  const { format, overwrite, verbose } = results;
  console.log(`Converting "${source}" to "${destination}" in ${format} format.`);
  if (overwrite) console.log("Overwrite enabled.");
  if (verbose) console.log("Verbose mode enabled.");
});

convertSchema.setPreValidationHook(ctx => {
  if (ctx.options.verbose.source === "default") {
    ctx.options.verbose.rawValue = "true";
  }

  if (ctx.arguments[0].source === "cli") {
    console.log("Input directory:", ctx.arguments[0].rawValue);
  }
});
