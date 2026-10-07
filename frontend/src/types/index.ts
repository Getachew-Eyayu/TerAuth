export type UserRole = 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'ORGANIZATION_ADMIN' | 'PUBLIC_VERIFIER';
export type InstitutionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type CertificateStatus = 'ACTIVE' | 'REVOKED';
export type VerificationResultType = 'VALID' | 'REVOKED' | 'INVALID';

export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  institutionId?: string | null;
  institution?: Institution | null;
  createdAt: string;
}

export interface Institution {
  id: string;
  institutionId: string;
  name: string;
  officialEmail: string;
  contactNumber?: string | null;
  address?: string | null;
  type: string;
  status: InstitutionStatus;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    certificates: number;
    users: number;
  };
}

export interface Certificate {
  id: string;
  certificateId: string;
  studentName: string;
  degree: string;
  department: string;
  issueDate: string;
  qrCodeUrl: string;
  institutionId: string;
  status: CertificateStatus;
  revocationReason?: string | null;
  revokedAt?: string | null;
  metadata?: string | null;
  createdAt: string;
  updatedAt: string;
  institution?: {
    id: string;
    institutionId: string;
    name: string;
    type?: string;
    officialEmail?: string;
    contactNumber?: string;
    address?: string;
  };
  _count?: {
    verificationLogs: number;
  };
}

export interface VerificationLog {
  id: string;
  certificateId?: string | null;
  queriedId: string;
  result: VerificationResultType;
  ipAddress?: string | null;
  userAgent?: string | null;
  timestamp: string;
  certificate?: {
    certificateId: string;
    studentName: string;
    institution?: {
      name: string;
    };
  } | null;
}

export interface VerificationResponse {
  success: boolean;
  status: VerificationResultType;
  message: string;
  queriedId?: string;
  data?: {
    certificateId: string;
    studentName: string;
    degree: string;
    department: string;
    institution: {
      name: string;
      institutionId: string;
      type?: string;
    };
    issueDate: string;
    status: CertificateStatus;
    revocationReason?: string;
    revokedAt?: string;
    verifiedBy: string;
    verificationTimestamp: string;
  };
}
