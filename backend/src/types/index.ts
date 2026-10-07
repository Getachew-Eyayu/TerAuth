import { Request } from 'express';

export type UserRole = 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'ORGANIZATION_ADMIN' | 'PUBLIC_VERIFIER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type InstitutionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type CertificateStatus = 'ACTIVE' | 'REVOKED';
export type VerificationResult = 'VALID' | 'REVOKED' | 'INVALID';

export interface TokenPayload {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  institutionId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}
