import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Middleware that assigns a unique Request ID to each incoming HTTP request,
 * attaches it to the response header `X-Request-Id`, and logs the request metrics upon completion.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  // Use existing X-Request-Id if provided by upstream gateway/proxy, else generate a new one
  const existingId = req.headers['x-request-id'];
  const requestId = (typeof existingId === 'string' && existingId.trim().length > 0)
    ? existingId.trim()
    : `REQ-${crypto.randomBytes(6).toString('hex')}`;

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';

    const logMeta = {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
      durationMs,
      clientIp,
    };

    if (statusCode >= 500) {
      logger.error(`HTTP ${req.method} ${req.originalUrl} failed with status ${statusCode} in ${durationMs}ms`, logMeta);
    } else if (statusCode >= 400) {
      logger.warn(`HTTP ${req.method} ${req.originalUrl} responded with status ${statusCode} in ${durationMs}ms`, logMeta);
    } else {
      logger.info(`HTTP ${req.method} ${req.originalUrl} completed with status ${statusCode} in ${durationMs}ms`, logMeta);
    }
  });

  next();
};
