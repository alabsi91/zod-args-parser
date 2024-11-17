import babel from "@babel/core";
import { promises as fs } from "fs";
import { mkdir } from "fs/promises";
import { glob } from "glob";
import path from "path";
import ts from "typescript";

// Paths
const srcDir = "src";
const libDir = "lib";
const tsLibDir = path.join(libDir, "typescript");
const commonjsDir = path.join(libDir, "commonjs");
const esmDir = path.join(libDir, "module");

// Clean lib directory
console.log("🧹 ", `Cleaning "${libDir}"...\n`);
await fs.rm(libDir, { recursive: true, force: true });

// TypeScript Compiler Options
console.log("📦 ", `Generating TypeScript declaration files...`);

const tsConfigPath = path.resolve("tsconfig.json");
const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile).config;
tsConfig.compilerOptions.declarationDir = tsLibDir;
tsConfig.compilerOptions.emitDeclarationOnly = true;

const parsedCommandLine = ts.parseJsonConfigFileContent(tsConfig, ts.sys, path.dirname(tsConfigPath));

const tsFiles = await glob(srcDir + "/**/*.ts", { ignore: "node_modules/**" });
const host = ts.createCompilerHost(parsedCommandLine.options);
const program = ts.createProgram(tsFiles, parsedCommandLine.options, host);
program.emit();

/**
 * @param {string} filename
 * @param {string} sourceRoot
 * @param {boolean} [commonjs=false] Default is `false`
 * @returns
 */
const babelOptions = (filename, sourceRoot, commonjs = false) => ({
  presets: [
    ["@babel/preset-env", { targets: "defaults", modules: commonjs ? "commonjs" : false }],
    "@babel/preset-typescript",
  ],
  filename,
  sourceRoot,
  compact: true,
  comments: false,
  sourceMaps: true,
});

console.log("\n⚙️ ", `Building for commonjs...`);

for (const filePath of tsFiles) {
  const dir = path.dirname(filePath).replace(srcDir, ""); // file target directory
  const fileName = path.basename(filePath);
  const fileBaseName = path.basename(fileName, path.extname(fileName)); // without extension
  const fileContent = await fs.readFile(filePath, "utf8");

  // Ignore
  if (["types.ts"].includes(fileName)) {
    continue;
  }

  // commonjs paths
  const commonjsOutputDir = path.join(commonjsDir, dir);
  const commonjsOutputPath = path.join(commonjsOutputDir, `${fileBaseName}.js`);
  const commonjsMapOutputPath = path.join(commonjsOutputDir, `${fileBaseName}.js.map`);
  await mkdir(commonjsOutputDir, { recursive: true }); // Ensure directories exist

  // Source root relative path for source maps
  const sourceRoot = path.relative(commonjsOutputDir, path.join(srcDir, dir)).replaceAll(path.sep, "/");

  // Transpile using Babel
  const commonjsResult = await babel.transformAsync(fileContent, babelOptions(fileName, sourceRoot, true));

  if (!commonjsResult || !commonjsResult.code) {
    console.error(`Failed to transpile ${filePath}`);
    continue;
  }

  // Write the transpiled code and source maps to the respective directories
  await fs.writeFile(commonjsOutputPath, commonjsResult.code, "utf8");

  // write source maps if they exist
  if (commonjsResult.map) await fs.writeFile(commonjsMapOutputPath, JSON.stringify(commonjsResult.map ?? ""), "utf8");
}

console.log("\n⚙️ ", `Building for Module js...`);

for (const filePath of tsFiles) {
  const dir = path.dirname(filePath).replace(srcDir, ""); // file target directory
  const fileName = path.basename(filePath);
  const fileBaseName = path.basename(fileName, path.extname(fileName)); // without extension
  const fileContent = await fs.readFile(filePath, "utf8");

  // Ignore
  if (["types.ts"].includes(fileName)) {
    continue;
  }

  // esm paths
  const esmOutputDir = path.join(esmDir, dir);
  const esmOutputPath = path.join(esmOutputDir, `${fileBaseName}.js`);
  const esmMapOutputPath = path.join(esmOutputDir, `${fileBaseName}.js.map`);
  await mkdir(esmOutputDir, { recursive: true }); // Ensure directories exist

  // Source root relative path for source maps
  const sourceRoot = path.relative(esmOutputDir, path.join(srcDir, dir)).replaceAll(path.sep, "/");

  // Transpile using Babel
  const esmResult = await babel.transformAsync(fileContent, babelOptions(fileName, sourceRoot));

  if (!esmResult || !esmResult.code) {
    console.error(`Failed to transpile ${filePath}`);
    continue;
  }

  // Write the transpiled code and source maps to the respective directories
  await fs.writeFile(esmOutputPath, esmResult.code, "utf8");

  // write source maps if they exist
  if (esmResult.map) await fs.writeFile(esmMapOutputPath, JSON.stringify(esmResult.map ?? ""), "utf8");
}

console.log("\n✅ Compilation successful!\n");
