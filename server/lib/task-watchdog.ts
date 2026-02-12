import { createLogger } from "./logger";

const log = createLogger('watchdog');

interface TaskHealth {
  name: string;
  lastRun: Date | null;
  lastSuccess: boolean;
  lastError: string | null;
  runCount: number;
  errorCount: number;
  intervalMs: number;
}

const taskRegistry = new Map<string, TaskHealth>();

export function registerTask(name: string, intervalMs: number) {
  taskRegistry.set(name, {
    name,
    lastRun: null,
    lastSuccess: true,
    lastError: null,
    runCount: 0,
    errorCount: 0,
    intervalMs,
  });
}

export function recordTaskRun(name: string, success: boolean, error?: string) {
  const task = taskRegistry.get(name);
  if (!task) return;
  task.lastRun = new Date();
  task.lastSuccess = success;
  task.runCount++;
  if (!success) {
    task.errorCount++;
    task.lastError = error || "Unknown error";
    log.warn(`Task "${name}" failed (${task.errorCount} total errors)`, { error });
  }
}

export function getTaskHealthStatus(): TaskHealth[] {
  return Array.from(taskRegistry.values());
}

export function getOverdueTasksCount(): number {
  const now = Date.now();
  let overdue = 0;
  const tasks = Array.from(taskRegistry.values());
  for (const task of tasks) {
    if (task.lastRun) {
      const msSinceRun = now - task.lastRun.getTime();
      if (msSinceRun > task.intervalMs * 3) {
        overdue++;
      }
    }
  }
  return overdue;
}

export function runWatchedTask(name: string, intervalMs: number, fn: () => Promise<void>) {
  registerTask(name, intervalMs);

  const execute = async () => {
    try {
      await fn();
      recordTaskRun(name, true);
    } catch (e: any) {
      recordTaskRun(name, false, e?.message);
    }
  };

  execute();
  return setInterval(execute, intervalMs);
}
