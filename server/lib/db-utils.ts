import { pool } from "../db";
import { createLogger } from "./logger";

const log = createLogger('db');
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 200;

function isTransientError(error: any): boolean {
  if (!error) return false;
  const code = error.code || '';
  const message = (error.message || '').toLowerCase();
  const transientCodes = [
    '57P01', // admin_shutdown
    '57P02', // crash_shutdown
    '57P03', // cannot_connect_now
    '08006', // connection_failure
    '08001', // sqlclient_unable_to_establish_sqlconnection
    '08004', // sqlserver_rejected_establishment_of_sqlconnection
    '40001', // serialization_failure
    '40P01', // deadlock_detected
    'ECONNRESET',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'EPIPE',
  ];
  if (transientCodes.includes(code)) return true;
  if (message.includes('connection terminated') || message.includes('connection refused') || 
      message.includes('timeout') || message.includes('econnreset') || 
      message.includes('too many clients') || message.includes('remaining connection slots')) {
    return true;
  }
  return false;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  label = 'db_operation'
): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (!isTransientError(error) || attempt === MAX_RETRIES - 1) {
        throw error;
      }
      const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 100;
      log.warn(`Retry ${label} attempt ${attempt + 1}/${MAX_RETRIES}`, { error: error.message, delayMs: Math.round(delay) });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export async function checkPoolHealth(): Promise<{
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  healthy: boolean;
}> {
  try {
    const totalCount = pool.totalCount;
    const idleCount = pool.idleCount;
    const waitingCount = pool.waitingCount;
    return {
      totalCount,
      idleCount,
      waitingCount,
      healthy: waitingCount < 10 && totalCount <= 25,
    };
  } catch (error: any) {
    log.error('Pool health check failed', error);
    return { totalCount: 0, idleCount: 0, waitingCount: 0, healthy: false };
  }
}
