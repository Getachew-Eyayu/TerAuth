import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Valid refresh token required'),
});

export const RegisterInstitutionSchema = z.object({
  institutionName: z.string().min(3, 'Institution name must be at least 3 characters'),
  officialEmail: z.string().email('Valid official email address is required'),
  contactNumber: z.string().min(7, 'Contact number is required').optional(),
  address: z.string().min(3, 'Physical address is required').optional(),
  institutionType: z.string().min(2, 'Institution type is required (e.g. University, Institute, College)'),
  adminFullName: z.string().min(3, 'Administrator full name is required'),
  adminUsername: z.string().min(3, 'Admin username must be at least 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
  adminEmail: z.string().email('Valid administrator email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const ReviewInstitutionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
});

export const CreateCertificateSchema = z.object({
  studentName: z.string().min(2, 'Student full name is required'),
  degree: z.string().min(2, 'Degree/Qualification name is required (e.g., Bachelor of Science in Software Engineering)'),
  department: z.string().min(2, 'Department / Field of study is required (e.g., School of Electrical & Computer Engineering)'),
  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid issue date format (YYYY-MM-DD)',
  }),
  metadata: z.record(z.any()).optional(),
});

export const RevokeCertificateSchema = z.object({
  reason: z.string().min(5, 'Revocation reason must be at least 5 characters'),
});

export const VerifyQuerySchema = z.object({
  certificateId: z.string().min(4, 'Certificate ID must be at least 4 characters').trim(),
});
