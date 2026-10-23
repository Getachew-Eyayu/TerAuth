"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_js_1 = require("../utils/logger.js");
const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
    logger_js_1.logger.error(err.message || 'Unhandled Application Error', {
        requestId: req.requestId,
        statusCode,
        path: req.originalUrl,
        method: req.method,
        stack: err.stack,
    });
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal server error occurred',
        requestId: req.requestId,
        ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
};
exports.errorHandler = errorHandler;
