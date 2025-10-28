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
      example: "--enable-logging=false\n--no-enable-logging",
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

configureSchema.setAction(({ options }) => {
  console.log("Configuring system:");
  console.log(`  Logging: ${options.enableLogging}`);
  console.log(`  Mode: ${options.mode}`);
});
