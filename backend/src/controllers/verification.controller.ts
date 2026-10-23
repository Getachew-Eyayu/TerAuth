import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { CertificateService } from '../services/certificate.service.js';
import { AuditService } from '../services/audit.service.js';
import prisma from '../prisma.js';

export class VerificationController {
  /**
   * Public Certificate Verification
   * Can be accessed anonymously by anyone via QR code scan or manual ID entry.
   * Rate limited. Logs every verification event.
   */
  static async verify(req: Request, res: Response): Promise<void> {
    try {
      const { certificateId } = req.params;
      const cleanId = (certificateId || '').trim();

      const ipAddress = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || req.socket.remoteAddress;
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
      const certificate = await CertificateService.getCertificateForVerification(cleanId);

      if (!certificate) {
        // Record invalid verification attempt
        await AuditService.logVerification({
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
        const certRecord = await prisma.certificate.findUnique({
          where: { certificateId: cleanId },
          select: { id: true },
        });

        await AuditService.logVerification({
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
      const certRecord = await prisma.certificate.findUnique({
        where: { certificateId: cleanId },
        select: { id: true },
      });

      await AuditService.logVerification({
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
    } catch (error: any) {
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
  static async getLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { search, result, page = '1', limit = '20' } = req.query;

      const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {};

      if (result && result !== 'ALL') {
        where.result = result;
      }

      if (search) {
        where.queriedId = { contains: (search as string).trim() };
      }

      // If Institution Admin, filter logs only for certificates issued by this institution
      if (req.user?.role === 'INSTITUTION_ADMIN') {
        where.certificate = {
          institutionId: req.user.institutionId,
        };
      }

      const [logs, total] = await Promise.all([
        prisma.verificationLog.findMany({
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
        prisma.verificationLog.count({ where }),
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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch verification logs',
      });
    }
  }
}
