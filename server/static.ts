import express, { type Express } from "express";
import fs from "fs";
import path from "path";

function findDistPublic(): string {
  const candidates = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(__dirname, "public"),
    path.resolve(__dirname, "..", "dist", "public"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.existsSync(path.join(candidate, "index.html"))) {
      return candidate;
    }
  }

  throw new Error(
    `Could not find the build directory. Searched:\n${candidates.join("\n")}\nMake sure to build the client first.`,
  );
}

let cachedIndexHtml: string | null = null;
let distPublicPath: string | null = null;

export function setupStaticFiles(app: Express) {
  distPublicPath = findDistPublic();
  cachedIndexHtml = fs.readFileSync(path.join(distPublicPath, "index.html"), "utf-8");

  app.get("/", (_req, res) => {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.status(200).send(cachedIndexHtml);
  });

  app.use(express.static(distPublicPath, {
    maxAge: '1y',
    immutable: true,
    index: false,
    etag: true,
    lastModified: true,
  }));
}

export function setupSPAFallback(app: Express) {
  app.use("*", (_req, res) => {
    if (cachedIndexHtml) {
      res.setHeader("Content-Type", "text/html");
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.status(200).send(cachedIndexHtml);
    } else {
      res.status(503).send("Application starting...");
    }
  });
}
