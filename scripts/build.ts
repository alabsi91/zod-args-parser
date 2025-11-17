import { readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import esbuild, { type Plugin } from "esbuild";
import { globSync } from "glob";
import { minify } from "terser";
import ts from "typescript";

const libDir = "lib";
const tsLibDir = path.join(libDir, "types");

const tsFiles = globSync("src/**/*.ts", { ignore: "**/*.d.ts" });

// Clean lib directory
console.log("🧹", `Cleaning "${libDir}" directory ...`);
rmSync(libDir, { recursive: true, force: true });

// TypeScript Compiler Options
{
  console.log("📦", `Generating TypeScript declaration files...`);

  const tsConfigPath = path.resolve("tsconfig.json");

  const tsConfigReadResult = ts.readConfigFile(tsConfigPath, path => ts.sys.readFile(path));
  if (tsConfigReadResult.error) {
    throw tsConfigReadResult.error;
  }

  const tsConfig = tsConfigReadResult.config as { compilerOptions: ts.CompilerOptions };
  tsConfig.compilerOptions.declarationDir = tsLibDir;
  tsConfig.compilerOptions.emitDeclarationOnly = true;
  tsConfig.compilerOptions.noEmitOnError = false;

  const parsedCommandLine = ts.parseJsonConfigFileContent(tsConfig, ts.sys, path.dirname(tsConfigPath));
  if (parsedCommandLine.errors.length > 0) {
    throw new Error("Failed to parse tsconfig");
  }

  const host = ts.createCompilerHost(parsedCommandLine.options);
  const program = ts.createProgram(tsFiles, parsedCommandLine.options, host);

  const emitResult = program.emit();

  const allDiagnostics = [
    ...program.getSyntacticDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getDeclarationDiagnostics(),
    ...emitResult.diagnostics,
  ];

  if (allDiagnostics.length > 0) {
    const diagnostics = ts.formatDiagnosticsWithColorAndContext(allDiagnostics, host);
    console.log();
    console.log(diagnostics);
    throw new Error("Failed to emit typescript declaration files");
  }
}

const tsFilesWithoutTypes = globSync("src/**/*.ts", { ignore: ["src/types/**", "**/*.d.ts"] });

// mjs: transformed not bundled or minified targets only nodejs
{
  console.log("⚙️ ", `Building for mjs...`);

  await esbuild.build({
    entryPoints: tsFilesWithoutTypes,
    outdir: path.join(libDir, "mjs"),
    outExtension: { ".js": ".mjs" },
    format: "esm",
    platform: "node",
    target: "esnext",
    sourcemap: true,
    bundle: true,
    minify: false,
    packages: "external",
    plugins: [rewriteRelativeImportExtensionsPlugin({ replaceWith: ".mjs" })],
  });
}

// esm: transformed not bundled or minified targets both nodejs and browsers
{
  console.log("⚙️ ", `Building for esm...`);

  await esbuild.build({
    entryPoints: tsFilesWithoutTypes,
    outdir: path.join(libDir, "esm"),
    format: "esm",
    platform: "neutral",
    target: "esnext",
    sourcemap: true,
    bundle: true,
    minify: false,
    packages: "external",
    plugins: [rewriteRelativeImportExtensionsPlugin({ replaceWith: ".js" })],
  });
}

// iife bundled for browser and minified later with terser
{
  console.log("⚙️ ", `Building for iife...`);

  await esbuild.build({
    entryPoints: [path.join("src", "index.ts")],
    outdir: path.join(libDir, "iife"),
    format: "iife",
    globalName: "ZodArgsParser",
    platform: "browser",
    target: "esnext",
    treeShaking: true,
    sourcemap: true,
    bundle: true,
    minify: false,
    packages: "bundle",
  });
}

{
  console.log("🔻", `Minifying...`);

  const outputFiles = globSync(`${libDir}/iife/**/*.js`);

  for (const filePath of outputFiles) {
    const mapFilePath = filePath + ".map";
    const mapFilename = path.basename(mapFilePath);

    const minified = await minify(readFileSync(filePath, "utf8"), {
      sourceMap: { content: readFileSync(mapFilePath, "utf8"), url: mapFilename },
    });

    if (!minified.code || !minified.map) {
      console.warn(`    Failed to minify "${filePath}"`);
      continue;
    }

    writeFileSync(filePath, minified.code, { encoding: "utf8" });
    writeFileSync(mapFilePath, minified.map as string, { encoding: "utf8" });
  }
}

console.log("\n🚀", `Done!`);

// esbuild plugin to map import extensions

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
