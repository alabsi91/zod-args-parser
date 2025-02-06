import { includeIgnoreFile } from "@eslint/compat";
import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import path from "path";
import tseslint from "typescript-eslint";

const gitignorePath = path.resolve(".gitignore");

/** @type {import("eslint").Linter.Config[]} */
export default [
  {
    files: ["**/*"],
    languageOptions: { globals: globals.node },
  },
  includeIgnoreFile(gitignorePath),
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
