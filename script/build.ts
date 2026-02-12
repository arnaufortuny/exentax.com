import esbuild from "esbuild";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const BOOT_SCRIPT = `"use strict";
var http = require("http");
var fs = require("fs");
var path = require("path");

var port = parseInt(process.env.PORT || "5000", 10);
var indexHtml = null;

try {
  var candidates = [
    path.resolve(__dirname, "public", "index.html"),
    path.resolve(process.cwd(), "dist", "public", "index.html")
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (fs.existsSync(candidates[i])) {
      indexHtml = fs.readFileSync(candidates[i], "utf-8");
      console.log("[boot] Cached index.html from " + candidates[i]);
      break;
    }
  }
} catch (e) {
  console.error("[boot] Could not cache index.html:", e.message);
}

var expressApp = null;

var server = http.createServer(function(req, res) {
  if (expressApp) {
    return expressApp(req, res);
  }
  if (req.url === "/_health" || req.url === "/_health/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    return res.end("ok");
  }
  if (req.url === "/" || req.url === "") {
    res.writeHead(200, {
      "Content-Type": "text/html",
      "Cache-Control": "no-cache, no-store, must-revalidate"
    });
    return res.end(indexHtml || "<!DOCTYPE html><html><head><title>Exentax</title></head><body><p>Loading...</p><script>setTimeout(function(){location.reload()},1000)</script></body></html>");
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(indexHtml || "<!DOCTYPE html><html><head><title>Exentax</title></head><body><p>Loading...</p><script>setTimeout(function(){location.reload()},1000)</script></body></html>");
});

server.listen(port, "0.0.0.0", function() {
  console.log("[boot] Server listening on 0.0.0.0:" + port + " - health check ready immediately");

  setTimeout(function() {
    console.log("[boot] Loading full application...");
    process.env.BOOT_SERVER = "1";
    process.env.BOOT_PORT = String(port);
    try {
      var appModule = require("./index.cjs");
      if (appModule && appModule.__httpServer && appModule.__expressApp) {
        expressApp = appModule.__expressApp;
        appModule.__httpServer.removeAllListeners("request");
        server.removeAllListeners("upgrade");
        if (appModule.__httpServer.listeners) {
          var upgradeListeners = appModule.__httpServer.listeners("upgrade");
          for (var j = 0; j < upgradeListeners.length; j++) {
            server.on("upgrade", upgradeListeners[j]);
          }
        }
        console.log("[boot] Express app active - full application ready");
      } else {
        console.log("[boot] Application loaded");
      }
    } catch (e) {
      console.error("[boot] Failed to load application:", e);
    }
  }, 0);
});
`;

const build = async () => {
  try {
    console.log("Starting build process...");

    if (fs.existsSync("dist")) {
      fs.rmSync("dist", { recursive: true });
    }
    fs.mkdirSync("dist");

    console.log("Building frontend...");
    execSync("npx vite build", { stdio: "inherit" });

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
      external: [...dependencies, ...devDependencies, "pg-native"],
      format: "cjs",
      sourcemap: true,
    });

    if (!fs.existsSync("dist/index.cjs")) {
      throw new Error("Build output dist/index.cjs was not generated");
    }

    console.log("Generating boot script...");
    fs.writeFileSync("dist/boot.cjs", BOOT_SCRIPT, "utf8");

    console.log("Build completed successfully!");
  } catch (error) {
    console.error("Build failed:", error);
    process.exit(1);
  }
};

build();
