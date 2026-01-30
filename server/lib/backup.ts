import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

const BACKUP_DIR = "/tmp/db-backups";
const MAX_BACKUPS = 7;

async function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

async function cleanOldBackups() {
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith(".sql"))
    .map(f => ({
      name: f,
      path: path.join(BACKUP_DIR, f),
      time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  while (files.length > MAX_BACKUPS) {
    const oldest = files.pop();
    if (oldest) {
      fs.unlinkSync(oldest.path);
      console.log(`[Backup] Deleted old backup: ${oldest.name}`);
    }
  }
}

export async function createBackup(): Promise<string | null> {
  try {
    await ensureBackupDir();

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("[Backup] DATABASE_URL not configured");
      return null;
    }

    const pgDumpCmd = `pg_dump "${databaseUrl}" --no-owner --no-acl -f "${backupFile}"`;
    
    await execAsync(pgDumpCmd);
    
    await cleanOldBackups();

    console.log(`[Backup] Created successfully: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error("[Backup] Failed:", error);
    return null;
  }
}

export function scheduleBackups() {
  const BACKUP_INTERVAL = 24 * 60 * 60 * 1000;

  createBackup();

  setInterval(() => {
    createBackup();
  }, BACKUP_INTERVAL);

  console.log("[Backup] Scheduled daily backups");
}

export async function listBackups(): Promise<string[]> {
  await ensureBackupDir();
  return fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith(".sql"))
    .sort()
    .reverse();
}
