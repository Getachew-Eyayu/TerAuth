"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const certificate_service_js_1 = require("../services/certificate.service.js");
const audit_service_js_1 = require("../services/audit.service.js");
const prisma_js_1 = __importDefault(require("../prisma.js"));
class VerificationController {
    /**
     * Public Certificate Verification
     * Can be accessed anonymously by anyone via QR code scan or manual ID entry.
     * Rate limited. Logs every verification event.
     */
    static async verify(req, res) {
        try {
            const { certificateId } = req.params;
            const cleanId = (certificateId || '').trim();
            const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];
            if (!cleanId) {
                res.status(400).json({
                    success: false,
                    status: 'INVALID',
                    message: 'Certificate ID is required.',
                });
                return;
            }
            // Live Database Lookup (Never trust client-supplied data)
            const certificate = await certificate_service_js_1.CertificateService.getCertificateForVerification(cleanId);
            if (!certificate) {
                // Record invalid verification attempt
                await audit_service_js_1.AuditService.logVerification({
                    queriedId: cleanId,
                    result: 'INVALID',
                    ipAddress,
                    userAgent,
                });
                res.status(404).json({
                    success: false,
                    status: 'INVALID',
                    message: 'Certificate not found in the TerAuth National Registry.',
                    queriedId: cleanId,
                });
                return;
            }
            // Check Revocation Status
            if (certificate.status === 'REVOKED') {
                const certRecord = await prisma_js_1.default.certificate.findUnique({
                    where: { certificateId: cleanId },
                    select: { id: true },
                });
                await audit_service_js_1.AuditService.logVerification({
                    certificateId: certRecord?.id,
                    queriedId: cleanId,
                    result: 'REVOKED',
                    ipAddress,
                    userAgent,
                });
                res.status(200).json({
                    success: true,
                    status: 'REVOKED',
                    message: 'WARNING: This certificate has been revoked by the issuing institution.',
                    data: {
                        certificateId: certificate.certificateId,
                        studentName: certificate.studentName,
                        degree: certificate.degree,
                        department: certificate.department,
                        institution: certificate.institution,
                        issueDate: certificate.issueDate,
                        status: 'REVOKED',
                        revocationReason: certificate.revocationReason || 'Revoked by authority',
                        revokedAt: certificate.revokedAt,
                        verifiedBy: 'TerAuth National Verification Service',
                        verificationTimestamp: new Date().toISOString(),
                    },
                });
                return;
            }
            // Certificate is VALID and ACTIVE
            const certRecord = await prisma_js_1.default.certificate.findUnique({
                where: { certificateId: cleanId },
                select: { id: true },
            });
            await audit_service_js_1.AuditService.logVerification({
                certificateId: certRecord?.id,
                queriedId: cleanId,
                result: 'VALID',
                ipAddress,
                userAgent,
            });
            res.status(200).json({
                success: true,
                status: 'VALID',
                message: 'Certificate is authentic, valid, and active.',
                data: {
                    certificateId: certificate.certificateId,
                    studentName: certificate.studentName,
                    degree: certificate.degree,
                    department: certificate.department,
                    institution: certificate.institution,
                    issueDate: certificate.issueDate,
                    status: 'ACTIVE',
                    verifiedBy: 'TerAuth National Verification Service',
                    verificationTimestamp: new Date().toISOString(),
                },
            });
        }
        catch (error) {
            console.error('Verification error:', error);
            res.status(500).json({
                success: false,
                status: 'INVALID',
                message: error?.message || 'Internal verification processing error',
            });
        }
    }
    /**
     * Get Verification Logs (Filtered by role: Super Admin sees all, Institution Admin sees their own)
     */
    static async getLogs(req, res) {
        try {
            const { search, result, page = '1', limit = '20' } = req.query;
            const pageNumber = Math.max(1, parseInt(page, 10) || 1);
            const limitNumber = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
            const skip = (pageNumber - 1) * limitNumber;
            const where = {};
            if (result && result !== 'ALL') {
                where.result = result;
            }
            if (search) {
                where.queriedId = { contains: search.trim() };
            }
            // If Institution Admin, filter logs only for certificates issued by this institution
            if (req.user?.role === 'INSTITUTION_ADMIN') {
                where.certificate = {
                    institutionId: req.user.institutionId,
                };
            }
            const [logs, total] = await Promise.all([
                prisma_js_1.default.verificationLog.findMany({
                    where,
                    skip,
                    take: limitNumber,
                    orderBy: { timestamp: 'desc' },
                    include: {
                        certificate: {
                            select: {
                                certificateId: true,
                                studentName: true,
                                institution: {
                                    select: { name: true },
                                },
                            },
                        },
                    },
                }),
                prisma_js_1.default.verificationLog.count({ where }),
            ]);
            res.status(200).json({
                success: true,
                data: logs,
                pagination: {
                    total,
                    page: pageNumber,
                    limit: limitNumber,
                    totalPages: Math.ceil(total / limitNumber),
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch verification logs',
            });
        }
    }
}
exports.VerificationController = VerificationController;
