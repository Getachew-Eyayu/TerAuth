import crypto from 'crypto';
import prisma from '../prisma.js';
import { QRService } from './qr.service.js';

export class CertificateService {
  /**
   * Generates a cryptographically strong, non-sequential, non-colliding Certificate ID
   * Format: TER-YYYY-XXXXXXXX (e.g. TER-2026-8F4K2M9X)
   */
  static generateCertificateId(): string {
    const year = new Date().getFullYear();
    // Use unambiguous uppercase characters (omits 0, O, 1, I, L)
    const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
    const bytes = crypto.randomBytes(8);
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += alphabet[bytes[i] % alphabet.length];
    }
    return `TER-${year}-${code}`;
  }

  /**
   * Issues a new certificate with unique ID and QR code
   */
  static async createCertificate(data: {
    studentName: string;
    degree: string;
    department: string;
    issueDate: Date;
    institutionId: string;
    metadata?: Record<string, any>;
  }) {
    // Check if institution is approved
    const institution = await prisma.institution.findUnique({
      where: { id: data.institutionId },
    });

    if (!institution) {
      throw new Error('Institution not found');
    }

    if (institution.status !== 'APPROVED') {
      throw new Error('Institution is not approved to issue certificates');
    }

    // Generate unique Certificate ID with collision prevention
    let certificateId = '';
    let exists = true;
    let attempts = 0;

    while (exists && attempts < 10) {
      certificateId = this.generateCertificateId();
      const existing = await prisma.certificate.findUnique({
        where: { certificateId },
      });
      if (!existing) {
        exists = false;
      }
      attempts++;
    }

    if (exists) {
      throw new Error('Failed to generate a unique Certificate ID. Please try again.');
    }

    // Generate QR code data URL
    const qrCodeUrl = await QRService.generateQRCodeDataUrl(certificateId);

    // Create certificate in database
    const certificate = await prisma.certificate.create({
      data: {
        certificateId,
        studentName: data.studentName.trim(),
        degree: data.degree.trim(),
        department: data.department.trim(),
        issueDate: data.issueDate,
        qrCodeUrl,
        institutionId: data.institutionId,
        status: 'ACTIVE',
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
      include: {
        institution: {
          select: {
            id: true,
            institutionId: true,
            name: true,
            officialEmail: true,
            type: true,
          },
        },
      },
    });

    return certificate;
  }

  /**
   * Revoke a certificate with documented justification
   */
  static async revokeCertificate(certificateId: string, reason: string, institutionId?: string, isSuperAdmin = false) {
    const certificate = await prisma.certificate.findUnique({
      where: { certificateId },
      include: { institution: true },
    });

    if (!certificate) {
      throw new Error('Certificate not found');
    }

    // Authorization check: Institution admin can only revoke their own certificates
    if (!isSuperAdmin && institutionId && certificate.institutionId !== institutionId) {
      throw new Error('Unauthorized to revoke certificates belonging to another institution');
    }

    if (certificate.status === 'REVOKED') {
      throw new Error('Certificate is already revoked');
    }

    const updated = await prisma.certificate.update({
      where: { certificateId },
      data: {
        status: 'REVOKED',
        revocationReason: reason.trim(),
        revokedAt: new Date(),
      },
      include: {
        institution: {
          select: {
            name: true,
            institutionId: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Safe public certificate retrieval for verification
   * Sanitizes all sensitive internal metadata and returns public verification schema
   */
  static async getCertificateForVerification(certificateId: string) {
    const cert = await prisma.certificate.findUnique({
      where: { certificateId },
      include: {
        institution: {
          select: {
            name: true,
            institutionId: true,
            type: true,
          },
        },
      },
    });

    if (!cert) {
      return null;
    }

    return {
      id: cert.id,
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      degree: cert.degree,
      department: cert.department,
      issueDate: cert.issueDate,
      status: cert.status,
      revocationReason: cert.status === 'REVOKED' ? cert.revocationReason : undefined,
      revokedAt: cert.status === 'REVOKED' ? cert.revokedAt : undefined,
      institution: {
        name: cert.institution.name,
        institutionId: cert.institution.institutionId,
        type: cert.institution.type,
      },
    };
  }
}
