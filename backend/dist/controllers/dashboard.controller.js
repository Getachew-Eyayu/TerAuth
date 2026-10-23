"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const prisma_js_1 = __importDefault(require("../prisma.js"));
class DashboardController {
    /**
     * Super Admin Dashboard Metrics
     */
    static async getAdminStats(req, res) {
        try {
            const [totalInstitutions, pendingInstitutions, approvedInstitutions, rejectedInstitutions, totalCertificates, activeCertificates, revokedCertificates, totalVerifications, validVerifications, revokedVerifications, invalidVerifications, recentInstitutions, recentCertificates, recentLogs,] = await Promise.all([
                prisma_js_1.default.institution.count(),
                prisma_js_1.default.institution.count({ where: { status: 'PENDING' } }),
                prisma_js_1.default.institution.count({ where: { status: 'APPROVED' } }),
                prisma_js_1.default.institution.count({ where: { status: 'REJECTED' } }),
                prisma_js_1.default.certificate.count(),
                prisma_js_1.default.certificate.count({ where: { status: 'ACTIVE' } }),
                prisma_js_1.default.certificate.count({ where: { status: 'REVOKED' } }),
                prisma_js_1.default.verificationLog.count(),
                prisma_js_1.default.verificationLog.count({ where: { result: 'VALID' } }),
                prisma_js_1.default.verificationLog.count({ where: { result: 'REVOKED' } }),
                prisma_js_1.default.verificationLog.count({ where: { result: 'INVALID' } }),
                prisma_js_1.default.institution.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma_js_1.default.certificate.findMany({
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    include: { institution: { select: { name: true } } },
                }),
                prisma_js_1.default.verificationLog.findMany({
                    take: 8,
                    orderBy: { timestamp: 'desc' },
                    include: {
                        certificate: {
                            select: {
                                studentName: true,
                                institution: { select: { name: true } },
                            },
                        },
                    },
                }),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    metrics: {
                        totalInstitutions,
                        pendingInstitutions,
                        approvedInstitutions,
                        rejectedInstitutions,
                        totalCertificates,
                        activeCertificates,
                        revokedCertificates,
                        totalVerifications,
                        validVerifications,
                        revokedVerifications,
                        invalidVerifications,
                    },
                    recentInstitutions,
                    recentCertificates,
                    recentLogs,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch dashboard metrics',
            });
        }
    }
    /**
     * Institution Admin Dashboard Metrics
     */
    static async getInstitutionStats(req, res) {
        try {
            const institutionId = req.user?.institutionId;
            if (!institutionId) {
                res.status(400).json({
                    success: false,
                    message: 'No institution associated with this user',
                });
                return;
            }
            const [totalCertificates, activeCertificates, revokedCertificates, totalVerifications, recentCertificates, recentLogs, institution,] = await Promise.all([
                prisma_js_1.default.certificate.count({ where: { institutionId } }),
                prisma_js_1.default.certificate.count({ where: { institutionId, status: 'ACTIVE' } }),
                prisma_js_1.default.certificate.count({ where: { institutionId, status: 'REVOKED' } }),
                prisma_js_1.default.verificationLog.count({
                    where: { certificate: { institutionId } },
                }),
                prisma_js_1.default.certificate.findMany({
                    where: { institutionId },
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                }),
                prisma_js_1.default.verificationLog.findMany({
                    where: { certificate: { institutionId } },
                    take: 8,
                    orderBy: { timestamp: 'desc' },
                    include: {
                        certificate: {
                            select: {
                                certificateId: true,
                                studentName: true,
                                degree: true,
                            },
                        },
                    },
                }),
                prisma_js_1.default.institution.findUnique({
                    where: { id: institutionId },
                }),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    institution,
                    metrics: {
                        totalCertificates,
                        activeCertificates,
                        revokedCertificates,
                        totalVerifications,
                    },
                    recentCertificates,
                    recentLogs,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch institution dashboard metrics',
            });
        }
    }
}
exports.DashboardController = DashboardController;
