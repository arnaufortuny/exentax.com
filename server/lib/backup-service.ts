import fs from "fs";
import path from "path";
import { objectStorageClient, ObjectStorageService } from "../replit_integrations/object_storage";
import { logAudit } from "./security";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const BACKUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const BACKUP_TRACKING_FILE = path.join(process.cwd(), ".backup-state.json");
const BACKUP_TEMP_FILE = path.join(process.cwd(), ".backup-state.json.tmp");

interface BackupFileState {
  size: number;
  mtimeMs: number;
  objectPath: string;
}

interface BackupState {
  lastBackup: string;
  backedUpFiles: Record<string, BackupFileState>;
}

function loadBackupState(): BackupState {
  try {
    if (fs.existsSync(BACKUP_TRACKING_FILE)) {
      const content = fs.readFileSync(BACKUP_TRACKING_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed.backedUpFiles === "object") {
        return parsed as BackupState;
      }
    }
  } catch (error) {
    console.error("[Backup] Error loading backup state:", error);
  }
  return { lastBackup: "", backedUpFiles: {} };
}

function saveBackupStateAtomic(state: BackupState): void {
  try {
    const content = JSON.stringify(state, null, 2);
    fs.writeFileSync(BACKUP_TEMP_FILE, content, "utf-8");
    fs.renameSync(BACKUP_TEMP_FILE, BACKUP_TRACKING_FILE);
  } catch (error) {
    console.error("[Backup] Error saving backup state:", error);
    try {
      if (fs.existsSync(BACKUP_TEMP_FILE)) {
        fs.unlinkSync(BACKUP_TEMP_FILE);
      }
    } catch {}
  }
}

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) {
    return fileList;
  }
  
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    } catch {
      continue;
    }
  }
  return fileList;
}

async function backupFile(
  filePath: string,
  state: BackupState,
  objectStorageService: ObjectStorageService
): Promise<{ backed: boolean; error?: string }> {
  try {
    const stat = fs.statSync(filePath);
    const relativePath = path.relative(UPLOADS_DIR, filePath);
    const stateKey = relativePath;
    
    const existingBackup = state.backedUpFiles[stateKey];
    if (existingBackup) {
      if (
        existingBackup.size === stat.size &&
        existingBackup.mtimeMs === stat.mtimeMs
      ) {
        return { backed: false };
      }
    }
    
    const privateDir = objectStorageService.getPrivateObjectDir();
    const objectPath = `${privateDir}/backups/${relativePath}`;
    const { bucketName, objectName } = parseObjectPath(objectPath);
    
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);
    
    const fileContent = fs.readFileSync(filePath);
    await file.save(fileContent, {
      metadata: {
        contentType: getContentType(filePath),
        metadata: {
          originalPath: relativePath,
          backupDate: new Date().toISOString(),
        },
      },
    });
    
    state.backedUpFiles[stateKey] = {
      size: stat.size,
      mtimeMs: stat.mtimeMs,
      objectPath,
    };
    
    return { backed: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Backup] Error backing up ${filePath}:`, errorMsg);
    return { backed: false, error: errorMsg };
  }
}

function parseObjectPath(pathStr: string): { bucketName: string; objectName: string } {
  if (!pathStr.startsWith("/")) {
    pathStr = `/${pathStr}`;
  }
  const parts = pathStr.split("/");
  if (parts.length < 3) {
    throw new Error("Invalid path: must contain at least a bucket name");
  }
  return {
    bucketName: parts[1],
    objectName: parts.slice(2).join("/"),
  };
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
  };
  return mimeTypes[ext] || "application/octet-stream";
}

function pruneDeletedFiles(state: BackupState, currentFiles: Set<string>): number {
  let pruned = 0;
  const toDelete: string[] = [];
  
  for (const key of Object.keys(state.backedUpFiles)) {
    if (!currentFiles.has(key)) {
      toDelete.push(key);
    }
  }
  
  for (const key of toDelete) {
    delete state.backedUpFiles[key];
    pruned++;
  }
  
  return pruned;
}

export async function runBackup(): Promise<{ backedUp: number; skipped: number; errors: number; pruned: number }> {
  const objectStorageService = new ObjectStorageService();
  const state = loadBackupState();
  
  let backedUp = 0;
  let skipped = 0;
  let errors = 0;
  const failedFiles: string[] = [];
  
  try {
    const files = getAllFiles(UPLOADS_DIR);
    const currentFiles = new Set<string>(
      files.map(f => path.relative(UPLOADS_DIR, f))
    );
    
    const pruned = pruneDeletedFiles(state, currentFiles);
    
    for (const filePath of files) {
      const result = await backupFile(filePath, state, objectStorageService);
      if (result.error) {
        errors++;
        failedFiles.push(path.relative(UPLOADS_DIR, filePath));
      } else if (result.backed) {
        backedUp++;
      } else {
        skipped++;
      }
    }
    
    state.lastBackup = new Date().toISOString();
    saveBackupStateAtomic(state);
    
    logAudit({
      action: "backup_completed",
      details: { 
        backedUp, 
        skipped, 
        errors, 
        pruned,
        totalFiles: files.length,
        failedFiles: failedFiles.length > 0 ? failedFiles.slice(0, 10) : undefined
      },
    });
    
    console.log(`[Backup] Completed: ${backedUp} backed up, ${skipped} skipped, ${errors} errors, ${pruned} pruned`);
    return { backedUp, skipped, errors, pruned };
  } catch (error) {
    console.error("[Backup] Error during backup:", error);
    logAudit({
      action: "backup_failed",
      details: { 
        error: error instanceof Error ? error.message : "Unknown error",
        backedUp,
        skipped,
        errors
      },
    });
    return { backedUp, skipped, errors, pruned: 0 };
  }
}

export function startBackupService(): void {
  console.log("[Backup] Starting backup service...");
  
  setTimeout(() => {
    runBackup().catch(console.error);
  }, 5000);
  
  setInterval(() => {
    runBackup().catch(console.error);
  }, BACKUP_INTERVAL);
  
  console.log(`[Backup] Service started. Will backup every ${BACKUP_INTERVAL / 1000 / 60} minutes.`);
}

export function getBackupStatus(): BackupState {
  return loadBackupState();
}
