import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import { includeIgnoreFile } from "@eslint/compat";
import path from "path";

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
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
