type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, context: string, message: string, data?: Record<string, any>): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] [${context}] ${message}`;
  if (data && Object.keys(data).length > 0) {
    const safeData = { ...data };
    const sensitiveKeys = ['password', 'passwordHash', 'token', 'secret', 'apiKey', 'authorization', 'cookie', 'otp'];
    for (const key of Object.keys(safeData)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        safeData[key] = '[REDACTED]';
      }
    }
    return `${base} ${JSON.stringify(safeData)}`;
  }
  return base;
}

function createLogger(context: string) {
  return {
    debug(message: string, data?: Record<string, any>) {
      if (shouldLog('debug')) console.log(formatMessage('debug', context, message, data));
    },
    info(message: string, data?: Record<string, any>) {
      if (shouldLog('info')) console.log(formatMessage('info', context, message, data));
    },
    warn(message: string, data?: Record<string, any>) {
      if (shouldLog('warn')) console.warn(formatMessage('warn', context, message, data));
    },
    error(message: string, error?: any, data?: Record<string, any>) {
      if (shouldLog('error')) {
        const errorData = {
          ...data,
          ...(error instanceof Error ? { errorMessage: error.message, stack: error.stack?.split('\n').slice(0, 3).join(' -> ') } : { errorMessage: String(error) }),
        };
        console.error(formatMessage('error', context, message, errorData));
      }
    },
  };
}

export { createLogger };
export type { LogLevel };
export type Logger = ReturnType<typeof createLogger>;
