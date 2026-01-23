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
      outfile: "dist/index.cjs",
      // Externalize all dependencies to avoid bundling issues
      external: [...dependencies, ...devDependencies, "pg-native"],
      format: "cjs",
      sourcemap: true,
    });

    // Check if output file exists
    if (!fs.existsSync("dist/index.cjs")) {
      throw new Error("Build output dist/index.cjs was not generated");
    }

    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
};

build();
