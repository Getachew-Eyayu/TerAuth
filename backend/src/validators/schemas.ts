import { z } from 'zod';

export const LoginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(10, 'Valid refresh token required'),
});

const DISALLOWED_PUBLIC_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'mail.com',
];

export const RegisterInstitutionSchema = z.object({
  institutionName: z.string().min(3, 'Institution name must be at least 3 characters'),
  officialEmail: z
    .string()
    .email('Valid official email address is required')
    .refine(
      (email) => {
        if (process.env.ENFORCE_ACADEMIC_EMAIL !== 'true') return true;
        const domain = email.split('@')[1]?.toLowerCase();
        return domain && !DISALLOWED_PUBLIC_EMAIL_DOMAINS.includes(domain);
      },
      {
        message: 'Official institution email must use an organizational/academic domain (consumer providers like Gmail or Yahoo are not permitted in strict mode).',
      }
    ),
  contactNumber: z.string().min(7, 'Contact number is required').optional(),
  address: z.string().min(3, 'Physical address is required').optional(),
  institutionType: z.string().min(2, 'Institution type is required (e.g. University, Institute, College)'),
  adminFullName: z.string().min(3, 'Administrator full name is required'),
  adminUsername: z.string().min(3, 'Admin username must be at least 3 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and hyphens'),
  adminEmail: z.string().email('Valid administrator email address is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const ReviewInstitutionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().optional(),
});

export const CreateCertificateSchema = z.object({
  studentName: z.string().min(2, 'Student full name is required').max(150, 'Student name too long'),
  degree: z.string().min(2, 'Degree/Qualification name is required (e.g., Bachelor of Science in Software Engineering)').max(200),
  department: z.string().min(2, 'Department / Field of study is required').max(200),
  issueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid issue date format (YYYY-MM-DD)',
  }),
  metadata: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional()
    .refine(
      (data) => !data || JSON.stringify(data).length <= 4096,
      { message: 'Certificate metadata payload exceeds maximum allowed size of 4KB.' }
    ),
});

export const RevokeCertificateSchema = z.object({
  reason: z.string().min(5, 'Revocation reason must be at least 5 characters'),
});

export const VerifyQuerySchema = z.object({
  certificateId: z.string().min(4, 'Certificate ID must be at least 4 characters').trim(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const UpdateInstitutionSchema = z.object({
  name: z.string().min(3, 'Institution name must be at least 3 characters').optional(),
  officialEmail: z.string().email('Valid official email address is required').optional(),
  contactNumber: z.string().min(7, 'Contact number is required').optional().nullable(),
  address: z.string().min(3, 'Physical address is required').optional().nullable(),
  type: z.string().min(2, 'Institution type is required').optional(),
});
