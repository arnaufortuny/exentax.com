import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function getDirname(): string {
  try {
    if (typeof import.meta?.url !== 'undefined') {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {}
  return path.resolve();
}

const __dirname = getDirname();

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath, {
    maxAge: '1y',
    immutable: true,
    index: false,
    etag: true,
    lastModified: true
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  });
}
