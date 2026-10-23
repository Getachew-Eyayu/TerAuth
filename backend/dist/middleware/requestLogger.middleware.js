"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const crypto_1 = __importDefault(require("crypto"));
const logger_js_1 = require("../utils/logger.js");
/**
 * Middleware that assigns a unique Request ID to each incoming HTTP request,
 * attaches it to the response header `X-Request-Id`, and logs the request metrics upon completion.
 */
const requestLogger = (req, res, next) => {
    // Use existing X-Request-Id if provided by upstream gateway/proxy, else generate a new one
    const existingId = req.headers['x-request-id'];
    const requestId = (typeof existingId === 'string' && existingId.trim().length > 0)
        ? existingId.trim()
        : `REQ-${crypto_1.default.randomBytes(6).toString('hex')}`;
    req.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);
    const startTime = Date.now();
    res.on('finish', () => {
        const durationMs = Date.now() - startTime;
        const statusCode = res.statusCode;
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
        const logMeta = {
            requestId,
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode,
            durationMs,
            clientIp,
        };
        if (statusCode >= 500) {
            logger_js_1.logger.error(`HTTP ${req.method} ${req.originalUrl} failed with status ${statusCode} in ${durationMs}ms`, logMeta);
        }
        else if (statusCode >= 400) {
            logger_js_1.logger.warn(`HTTP ${req.method} ${req.originalUrl} responded with status ${statusCode} in ${durationMs}ms`, logMeta);
        }
        else {
            logger_js_1.logger.info(`HTTP ${req.method} ${req.originalUrl} completed with status ${statusCode} in ${durationMs}ms`, logMeta);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
