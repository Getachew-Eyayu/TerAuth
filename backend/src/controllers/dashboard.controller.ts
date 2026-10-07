import { Response } from 'express';
import prisma from '../prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export class DashboardController {
  /**
   * Super Admin Dashboard Metrics
   */
  static async getAdminStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const [
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
        recentInstitutions,
        recentCertificates,
        recentLogs,
      ] = await Promise.all([
        prisma.institution.count(),
        prisma.institution.count({ where: { status: 'PENDING' } }),
        prisma.institution.count({ where: { status: 'APPROVED' } }),
        prisma.institution.count({ where: { status: 'REJECTED' } }),
        prisma.certificate.count(),
        prisma.certificate.count({ where: { status: 'ACTIVE' } }),
        prisma.certificate.count({ where: { status: 'REVOKED' } }),
        prisma.verificationLog.count(),
        prisma.verificationLog.count({ where: { result: 'VALID' } }),
        prisma.verificationLog.count({ where: { result: 'REVOKED' } }),
        prisma.verificationLog.count({ where: { result: 'INVALID' } }),
        prisma.institution.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.certificate.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { institution: { select: { name: true } } },
        }),
        prisma.verificationLog.findMany({
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch dashboard metrics',
      });
    }
  }

  /**
   * Institution Admin Dashboard Metrics
   */
  static async getInstitutionStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const institutionId = req.user?.institutionId;

      if (!institutionId) {
        res.status(400).json({
          success: false,
          message: 'No institution associated with this user',
        });
        return;
      }

      const [
        totalCertificates,
        activeCertificates,
        revokedCertificates,
        totalVerifications,
        recentCertificates,
        recentLogs,
        institution,
      ] = await Promise.all([
        prisma.certificate.count({ where: { institutionId } }),
        prisma.certificate.count({ where: { institutionId, status: 'ACTIVE' } }),
        prisma.certificate.count({ where: { institutionId, status: 'REVOKED' } }),
        prisma.verificationLog.count({
          where: { certificate: { institutionId } },
        }),
        prisma.certificate.findMany({
          where: { institutionId },
          take: 5,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.verificationLog.findMany({
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
        prisma.institution.findUnique({
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch institution dashboard metrics',
      });
    }
  }
}
