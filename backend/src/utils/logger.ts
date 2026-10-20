type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  [key: string]: any;
}

class Logger {
  private formatLog(level: LogLevel, message: string, meta?: Record<string, any>): string {
    const isProduction = process.env.NODE_ENV === 'production';
    const payload: LogPayload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...(meta || {}),
    };

    if (isProduction) {
      return JSON.stringify(payload);
    }

    const reqIdTag = meta?.requestId ? ` [reqId:${meta.requestId}]` : '';
    const extraMeta = meta ? Object.keys(meta).filter((k) => k !== 'requestId').length > 0 ? ` ${JSON.stringify(meta)}` : '' : '';
    return `[${payload.timestamp}] [${level.toUpperCase()}]${reqIdTag} ${message}${extraMeta}`;
  }

  info(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'test') {
      console.log(this.formatLog('info', message, meta));
    }
  }

  warn(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(this.formatLog('warn', message, meta));
    }
  }

  error(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV !== 'test') {
      console.error(this.formatLog('error', message, meta));
    }
  }

  debug(message: string, meta?: Record<string, any>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatLog('debug', message, meta));
    }
  }
}

export const logger = new Logger();
