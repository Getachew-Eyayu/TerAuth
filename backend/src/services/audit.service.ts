import prisma from '../prisma.js';

export class AuditService {
  /**
   * Logs a certificate verification attempt to the database
   */
  static async logVerification(params: {
    certificateId?: string | null;
    queriedId: string;
    result: 'VALID' | 'REVOKED' | 'INVALID';
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      return await prisma.verificationLog.create({
        data: {
          certificateId: params.certificateId || null,
          queriedId: params.queriedId,
          result: params.result,
          ipAddress: params.ipAddress || 'unknown',
          userAgent: params.userAgent ? params.userAgent.substring(0, 255) : 'unknown',
        },
      });
    } catch (error) {
      // Audit log failures should not block the response but should be logged to stderr
      console.error('Failed to record verification audit log:', error);
      return null;
    }
  }
}
