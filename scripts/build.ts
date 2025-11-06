import esbuild, { type Plugin } from "esbuild";
import { globSync } from "glob";
import { rmSync } from "node:fs";
import path, { join } from "node:path";
import ts from "typescript";

const libDir = "lib";
const tsLibDir = path.join(libDir, "typescript");

const tsFiles = globSync("src/**/*.ts", { ignore: "node_modules/**" });

// Clean lib directory
console.log("🧹", `Cleaning "${libDir}" directory ...`);
rmSync(libDir, { recursive: true, force: true });

// esbuild plugin

interface PluginOptions {
  replaceWith?: ".mjs" | ".cjs" | ".js";
}

function replaceExtension(filePath: string, ext: ".mjs" | ".cjs" | ".js"): string {
  const { dir, name } = path.parse(filePath);
  return path
    .normalize(path.format({ dir, name, ext }))
    .replace(/\\/g, "/")
    .replace(/^([^./])/, "./$1");
}

/** Please see https://github.com/evanw/esbuild/issues/2435 */
function rewriteRelativeImportExtensionsPlugin(options: PluginOptions = {}): Plugin {
  options.replaceWith ??= ".js";

  return {
    name: "rewrite-relative-import",
    setup(build) {
      build.onResolve({ filter: /\..+$/ }, args => {
        if (args.kind === "entry-point") return;
        return {
          path: replaceExtension(args.path, options.replaceWith!),
          external: true,
        };
      });
    },
  };
}

// TypeScript Compiler Options
{
  console.log("📦", `Generating TypeScript declaration files...`);

  const tsConfigPath = path.resolve("tsconfig.json");
  const tsConfig = ts.readConfigFile(tsConfigPath, ts.sys.readFile).config;
  tsConfig.compilerOptions.declarationDir = tsLibDir;
  tsConfig.compilerOptions.emitDeclarationOnly = true;

  const parsedCommandLine = ts.parseJsonConfigFileContent(tsConfig, ts.sys, path.dirname(tsConfigPath));

  const host = ts.createCompilerHost(parsedCommandLine.options);
  const program = ts.createProgram(tsFiles, parsedCommandLine.options, host);
  program.emit();
}

// cjs
{
  console.log("⚙️ ", `Building for cjs...`);

  await esbuild.build({
    entryPoints: tsFiles,
    outdir: join(libDir, "cjs"),
    format: "cjs",
    platform: "node",
    target: "es2020",
    sourcemap: true,
    bundle: true,
    packages: "external",
    plugins: [rewriteRelativeImportExtensionsPlugin({ replaceWith: ".cjs" })],
  });
}

// mjs
{
  console.log("⚙️ ", `Building for mjs...`);

  await esbuild.build({
    entryPoints: tsFiles,
    outdir: join(libDir, "mjs"),
    format: "esm",
    platform: "node",
    target: "es2020",
    sourcemap: true,
    bundle: true,
    packages: "external",
    plugins: [rewriteRelativeImportExtensionsPlugin({ replaceWith: ".mjs" })],
  });
}

// esm
{
  console.log("⚙️ ", `Building for esm...`);

  await esbuild.build({
    entryPoints: tsFiles,
    outdir: join(libDir, "esm"),
    format: "esm",
    platform: "browser",
    target: "es2020",
    sourcemap: true,
    bundle: true,
    packages: "external",
    plugins: [rewriteRelativeImportExtensionsPlugin({ replaceWith: ".js" })],
  });
}

// iife
{
  console.log("⚙️ ", `Building for iife...`);

  await esbuild.build({
    entryPoints: [join(libDir, "esm", "index.js")],
    outdir: join(libDir, "iife"),
    format: "iife",
    platform: "browser",
    target: "es2020",
    treeShaking: true,
    sourcemap: true,
    bundle: true,
    minify: true,
    packages: "bundle",
  });
}

console.log("\n🚀", `Done!`);
