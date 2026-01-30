import esbuild from "esbuild";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const build = async () => {
  try {
    console.log("Starting build process...");

    // Ensure dist directory exists
    if (fs.existsSync("dist")) {
      fs.rmSync("dist", { recursive: true });
    }
    fs.mkdirSync("dist");

    // Build frontend using Vite
    console.log("Building frontend...");
    execSync("npx vite build", { stdio: "inherit" });

    // Build backend using esbuild
    console.log("Building backend...");
    const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    await esbuild.build({
      entryPoints: ["server/index.ts"],
      bundle: true,
      platform: "node",
      target: "node20",
      outfile: "dist/index.js",
      external: [...dependencies, ...devDependencies, "pg-native"],
      format: "esm",
      sourcemap: true,
      banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirname_fn } from 'path';
const require = createRequire(import.meta.url);
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_fn(__filename);
        `.trim(),
      },
    });

    // Check if output file exists
    if (!fs.existsSync("dist/index.js")) {
      throw new Error("Build output dist/index.js was not generated");
    }

    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
};

build();
