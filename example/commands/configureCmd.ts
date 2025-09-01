import * as z from "zod";
import { createSubcommand } from "zod-args-parser";

export const configureSchema = createSubcommand({
  name: "configure",
  description: "Simulate configuring the system",
  example: "argplay configure --no-enable-logging --mode production",
  options: [
    {
      name: "enableLogging",
      description: "Enable logging",
      example: "--enable-logging=false or --no-enable-logging",
      type: z.boolean().default(true),
    },
    {
      name: "mode",
      aliases: ["m"],
      placeholder: "<choice>",
      description: "Choose the mode (development, production, testing)",
      type: z.enum(["development", "production", "testing"]),
    },
  ],
});

configureSchema.setAction(results => {
  console.log("Configuring system:");
  console.log(`  Logging: ${results.enableLogging}`);
  console.log(`  Mode: ${results.mode}`);
  console.log(results.ctx.options.enableLogging.flag);

  const ctx = results.ctx;
  for (const option of Object.values(ctx.options)) {
    if (option.name === "enableLogging" && option.source !== "default") {
      option.rawValue = "false";
    }
  }
});

configureSchema.setPreValidationHook(ctx => {
  for (const option of Object.values(ctx.options)) {
    if (option.name === "enableLogging" && option.source !== "default") {
      option.rawValue = "false";
    }
  }
});
