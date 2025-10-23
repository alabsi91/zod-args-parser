import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig({
  files: ["src/**/*.ts"],
  extends: [
    pluginJs.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    eslintPluginPrettierRecommended,
    eslintPluginUnicorn.configs.recommended,
  ],
  /** @type {import("typescript-eslint").ConfigArray[number]["languageOptions"]} */
  languageOptions: {
    globals: globals.node,
    parserOptions: {
      projectService: {
        allowDefaultProject: ["eslint.config.js"],
      },
      tsconfigRootDir: import.meta.dirname,
    },
  },
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
});
