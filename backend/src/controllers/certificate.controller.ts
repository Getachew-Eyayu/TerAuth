import { Response } from 'express';
import prisma from '../prisma.js';
import { CertificateService } from '../services/certificate.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export class CertificateController {
  /**
   * Create / Issue Certificate
   * Automatically associated with the logged-in institution administrator
   */
  static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      let targetInstitutionId = req.user.institutionId;

      // Super admin can specify institutionId in body if desired
      if (req.user.role === 'SUPER_ADMIN' && req.body.institutionId) {
        targetInstitutionId = req.body.institutionId;
      }

      if (!targetInstitutionId) {
        res.status(400).json({
          success: false,
          message: 'An institution must be associated with the certificate issuer.',
        });
        return;
      }

      const { studentName, degree, department, issueDate, metadata } = req.body;

      const certificate = await CertificateService.createCertificate({
        studentName,
        degree,
        department,
        issueDate: new Date(issueDate),
        institutionId: targetInstitutionId,
        metadata,
      });

      res.status(201).json({
        success: true,
        message: 'Certificate successfully created and registered on TerAuth.',
        data: certificate,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to issue certificate',
      });
    }
  }

  /**
   * List certificates with pagination, search, status filter, and role-based scoping
   */
  static async getAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        search,
        status,
        startDate,
        endDate,
        institutionId,
        page = '1',
        limit = '20',
      } = req.query;

      const pageNumber = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNumber = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 20));
      const skip = (pageNumber - 1) * limitNumber;

      const where: any = {};

      // Role Scoping: INSTITUTION_ADMIN can ONLY see their own institution's certificates
      if (req.user?.role === 'INSTITUTION_ADMIN') {
        where.institutionId = req.user.institutionId;
      } else if (institutionId) {
        where.institutionId = institutionId as string;
      }

      if (status && status !== 'ALL') {
        where.status = status as string;
      }

      if (startDate || endDate) {
        where.issueDate = {};
        if (startDate) where.issueDate.gte = new Date(startDate as string);
        if (endDate) where.issueDate.lte = new Date(endDate as string);
      }

      if (search) {
        const query = (search as string).trim();
        where.OR = [
          { certificateId: { contains: query } },
          { studentName: { contains: query } },
          { degree: { contains: query } },
          { department: { contains: query } },
        ];
      }

      const [certificates, total] = await Promise.all([
        prisma.certificate.findMany({
          where,
          skip,
          take: limitNumber,
          orderBy: { createdAt: 'desc' },
          include: {
            institution: {
              select: {
                id: true,
                institutionId: true,
                name: true,
                type: true,
              },
            },
            _count: {
              select: {
                verificationLogs: true,
              },
            },
          },
        }),
        prisma.certificate.count({ where }),
      ]);

      res.status(200).json({
        success: true,
        data: certificates,
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
        message: error.message || 'Failed to fetch certificates',
      });
    }
  }

  /**
   * Get single certificate details by internal ID or certificateId
   */
  static async getById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const certificate = await prisma.certificate.findFirst({
        where: {
          OR: [{ id }, { certificateId: id }],
        },
        include: {
          institution: {
            select: {
              id: true,
              institutionId: true,
              name: true,
              officialEmail: true,
              contactNumber: true,
              address: true,
              type: true,
            },
          },
          verificationLogs: {
            take: 25,
            orderBy: { timestamp: 'desc' },
          },
        },
      });

      if (!certificate) {
        res.status(404).json({ success: false, message: 'Certificate not found' });
        return;
      }

      // Role check: If institution admin, must belong to their institution
      if (
        req.user?.role === 'INSTITUTION_ADMIN' &&
        req.user.institutionId !== certificate.institutionId
      ) {
        res.status(403).json({
          success: false,
          message: 'Access restricted: This certificate belongs to another institution.',
        });
        return;
      }

      res.status(200).json({ success: true, data: certificate });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch certificate',
      });
    }
  }

  /**
   * Revoke certificate
   */
  static async revoke(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
      const updated = await CertificateService.revokeCertificate(
        id,
        reason,
        req.user.institutionId || undefined,
        isSuperAdmin
      );

      res.status(200).json({
        success: true,
        message: `Certificate ${updated.certificateId} has been revoked.`,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Revocation failed',
      });
    }
  }
}
