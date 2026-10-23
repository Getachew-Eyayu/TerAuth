"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRoles = exports.authenticateToken = void 0;
const auth_service_js_1 = require("../services/auth.service.js");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        res.status(401).json({
            success: false,
            message: 'Access denied: Authentication token required',
        });
        return;
    }
    try {
        const decoded = auth_service_js_1.AuthService.verifyAccessToken(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token',
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]`,
            });
            return;
        }
        next();
    };
};
exports.requireRoles = requireRoles;
