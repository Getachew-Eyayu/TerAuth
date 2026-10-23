"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
class Logger {
    formatLog(level, message, meta) {
        const isProduction = process.env.NODE_ENV === 'production';
        const payload = {
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
    info(message, meta) {
        if (process.env.NODE_ENV !== 'test') {
            console.log(this.formatLog('info', message, meta));
        }
    }
    warn(message, meta) {
        if (process.env.NODE_ENV !== 'test') {
            console.warn(this.formatLog('warn', message, meta));
        }
    }
    error(message, meta) {
        if (process.env.NODE_ENV !== 'test') {
            console.error(this.formatLog('error', message, meta));
        }
    }
    debug(message, meta) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatLog('debug', message, meta));
        }
    }
}
exports.logger = new Logger();
