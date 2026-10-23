"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const prisma_js_1 = __importDefault(require("../prisma.js"));
class AuditService {
    /**
     * Logs a certificate verification attempt to the database
     */
    static async logVerification(params) {
        try {
            return await prisma_js_1.default.verificationLog.create({
                data: {
                    certificateId: params.certificateId || null,
                    queriedId: params.queriedId,
                    result: params.result,
                    ipAddress: params.ipAddress || 'unknown',
                    userAgent: params.userAgent ? params.userAgent.substring(0, 255) : 'unknown',
                },
            });
        }
        catch (error) {
            // Audit log failures should not block the response but should be logged to stderr
            console.error('Failed to record verification audit log:', error);
            return null;
        }
    }
    /**
     * Logs administrative privilege actions (approval, rejection, revocation, suspension)
     */
    static async logAdminAction(params) {
        try {
            const { logger } = await import('../utils/logger.js');
            logger.info(`ADMIN ACTION [${params.action}] performed on ${params.targetType} ${params.targetId}`, {
                actorId: params.actorId || 'system',
                actorUsername: params.actorUsername || 'unknown',
                action: params.action,
                targetType: params.targetType,
                targetId: params.targetId,
                reason: params.reason || null,
                ipAddress: params.ipAddress || 'internal',
                timestamp: new Date().toISOString(),
            });
        }
        catch (err) {
            console.error('Failed to log admin action:', err);
        }
    }
}
exports.AuditService = AuditService;
