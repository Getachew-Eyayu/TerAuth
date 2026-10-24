"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyQuerySchema = exports.RevokeCertificateSchema = exports.CreateCertificateSchema = exports.ReviewInstitutionSchema = exports.RegisterInstitutionSchema = exports.RefreshTokenSchema = exports.LoginSchema = void 0;
const zod_1 = require("zod");
exports.LoginSchema = zod_1.z.object({
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.RefreshTokenSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(10, 'Valid refresh token required'),
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
exports.RegisterInstitutionSchema = zod_1.z.object({
    institutionName: zod_1.z.string().min(3, 'Institution name must be at least 3 characters'),
    officialEmail: zod_1.z
        .string()
        .email('Valid official email address is required')
        .refine((email) => {
        if (process.env.ENFORCE_ACADEMIC_EMAIL !== 'true')
            return true;
        const domain = email.split('@')[1]?.toLowerCase();
        return domain && !DISALLOWED_PUBLIC_EMAIL_DOMAINS.includes(domain);
    }, {
        message: 'Official institution email must use an organizational/academic domain (consumer providers like Gmail or Yahoo are not permitted in strict mode).',
    }),
    contactNumber: zod_1.z.string().min(7, 'Contact number is required').optional(),
    address: zod_1.z.string().min(3, 'Physical address is required').optional(),
    institutionType: zod_1.z.string().min(2, 'Institution type is required (e.g. University, Institute, College)'),
    adminFullName: zod_1.z.string().min(3, 'Administrator full name is required'),
    adminUsername: zod_1.z.string().min(3, 'Admin username must be at least 3 characters').regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and hyphens'),
    adminEmail: zod_1.z.string().email('Valid administrator email address is required'),
    password: zod_1.z.string().min(8, 'Password must be at least 8 characters'),
});
exports.ReviewInstitutionSchema = zod_1.z.object({
    action: zod_1.z.enum(['APPROVE', 'REJECT']),
    reason: zod_1.z.string().optional(),
});
exports.CreateCertificateSchema = zod_1.z.object({
    studentName: zod_1.z.string().min(2, 'Student full name is required').max(150, 'Student name too long'),
    degree: zod_1.z.string().min(2, 'Degree/Qualification name is required (e.g., Bachelor of Science in Software Engineering)').max(200),
    department: zod_1.z.string().min(2, 'Department / Field of study is required').max(200),
    issueDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid issue date format (YYYY-MM-DD)',
    }),
    metadata: zod_1.z
        .record(zod_1.z.union([zod_1.z.string(), zod_1.z.number(), zod_1.z.boolean(), zod_1.z.null()]))
        .optional()
        .refine((data) => !data || JSON.stringify(data).length <= 4096, { message: 'Certificate metadata payload exceeds maximum allowed size of 4KB.' }),
});
exports.RevokeCertificateSchema = zod_1.z.object({
    reason: zod_1.z.string().min(5, 'Revocation reason must be at least 5 characters'),
});
exports.VerifyQuerySchema = zod_1.z.object({
    certificateId: zod_1.z.string().min(4, 'Certificate ID must be at least 4 characters').trim(),
});
