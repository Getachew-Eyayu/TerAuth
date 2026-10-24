import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

async function generateQR(certificateId: string): Promise<string> {
  const rawUrl =
    process.env.FRONTEND_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'https://terauth.vercel.app';
  const cleanUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const url = `${cleanUrl.replace(/\/$/, '')}/verify/${certificateId}`;
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    width: 400,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });
}

async function seed() {
  console.log(' Starting database seed...');

  // Clean existing data in reverse order of foreign key dependency
  await prisma.verificationLog.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  console.log(' Cleared existing database tables.');

  // 1. Create Super Admin
  const adminPasswordHash = await hashPassword('Admin@12345');
  const superAdmin = await prisma.user.create({
    data: {
      userId: 'USR-SA-001',
      username: 'superadmin',
      email: 'admin@terauth.gov.et',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
  console.log(` Created Super Admin: ${superAdmin.username} (${superAdmin.email})`);

  // 2. Create Sample Institutions
  const aait = await prisma.institution.create({
    data: {
      institutionId: 'INST-AAIT-001',
      name: 'Addis Ababa Institute of Technology (AAiT), AAU',
      officialEmail: 'registrar@aait.edu.et',
      contactNumber: '+251 11 123 2411',
      address: 'King George VI St, Sidist Kilo, Addis Ababa, Ethiopia',
      type: 'University Institute',
      status: 'APPROVED',
    },
  });

  const nstu = await prisma.institution.create({
    data: {
      institutionId: 'INST-NSTU-002',
      name: 'Addis Ababa Science and Technology University (AASTU)',
      officialEmail: 'info@aastu.edu.et',
      contactNumber: '+251 11 888 0604',
      address: 'Kilinto, Akaki Kaliti Sub-City, Addis Ababa, Ethiopia',
      type: 'Public University',
      status: 'APPROVED',
    },
  });

  const gba = await prisma.institution.create({
    data: {
      institutionId: 'INST-GBA-003',
      name: "St. Mary's University",
      officialEmail: 'contact@smuc.edu.et',
      contactNumber: '+251 11 553 8020',
      address: 'Mexico Square, Addis Ababa, Ethiopia',
      type: 'Accredited University',
      status: 'PENDING',
    },
  });

  const hti = await prisma.institution.create({
    data: {
      institutionId: 'INST-HTI-004',
      name: 'Hawassa Polytechnic College',
      officialEmail: 'info@hpc.edu.et',
      contactNumber: '+251 46 220 5412',
      address: 'Hawassa Industrial Zone Highway, Sidama, Ethiopia',
      type: 'Vocational Institute',
      status: 'REJECTED',
      rejectionReason: 'Incomplete accreditation documentation and unverified campus facilities.',
    },
  });

  console.log(' Created 4 sample institutions (2 Approved, 1 Pending, 1 Rejected).');

  // 3. Create Institution Admin Users
  const instPasswordHash = await hashPassword('Institution@12345');

  const aaitAdmin = await prisma.user.create({
    data: {
      userId: 'USR-AAIT-001',
      username: 'aait_admin',
      email: 'admin@aait.edu.et',
      passwordHash: instPasswordHash,
      role: 'INSTITUTION_ADMIN',
      status: 'ACTIVE',
      institutionId: aait.id,
    },
  });

  const nstuAdmin = await prisma.user.create({
    data: {
      userId: 'USR-NSTU-001',
      username: 'nstu_admin',
      email: 'admin@nstu.edu.et',
      passwordHash: instPasswordHash,
      role: 'INSTITUTION_ADMIN',
      status: 'ACTIVE',
      institutionId: nstu.id,
    },
  });

  const orgPasswordHash = await hashPassword('OrgAdmin@12345');
  const orgAdmin = await prisma.user.create({
    data: {
      userId: 'USR-ORG-001',
      username: 'hr_director',
      email: 'hr@ethiotelecom.et',
      passwordHash: orgPasswordHash,
      role: 'ORGANIZATION_ADMIN',
      status: 'ACTIVE',
    },
  });

  console.log(' Created Institution Admins (aait_admin, nstu_admin) and Organization Admin (hr_director).');

  // 4. Create Sample Certificates
  const certsToCreate = [
    {
      certificateId: 'TER-2026-8F4K2M9X',
      studentName: 'Abebe Bikila',
      degree: 'Bachelor of Science in Software Engineering',
      department: 'School of Information Technology and Electrical Engineering',
      issueDate: new Date('2026-07-08'),
      institutionId: aait.id,
      status: 'ACTIVE',
      metadata: JSON.stringify({ cgpa: '3.89', distinction: 'Very Great Distinction', studentId: 'AAU/ET/2022/491' }),
    },
    {
      certificateId: 'TER-2026-7H2R9W5K',
      studentName: 'Hawlet Romedan',
      degree: 'Bachelor of Science in Computer Science and Engineering',
      department: 'School of Information Technology and Electrical Engineering',
      issueDate: new Date('2026-07-08'),
      institutionId: aait.id,
      status: 'ACTIVE',
      metadata: JSON.stringify({ cgpa: '3.94', distinction: 'Very Great Distinction', studentId: 'AAU/ET/2022/612' }),
    },
    {
      certificateId: 'TER-2026-3P9W7L4Q',
      studentName: 'Sara Yohannes',
      degree: 'Master of Science in Cybersecurity & Information Assurance',
      department: 'Department of Computer Science',
      issueDate: new Date('2026-06-25'),
      institutionId: aait.id,
      status: 'ACTIVE',
      metadata: JSON.stringify({ cgpa: '3.95', distinction: 'Summa Cum Laude', studentId: 'AAU/PG/2024/112' }),
    },
    {
      certificateId: 'TER-2026-6M2D9V1K',
      studentName: 'Dawit Haile',
      degree: 'Bachelor of Science in Electrical and Computer Engineering',
      department: 'Department of Electrical Engineering',
      issueDate: new Date('2025-07-12'),
      institutionId: aait.id,
      status: 'REVOKED',
      revocationReason: 'Credential revoked following academic integrity review committee ruling #2026/04.',
      revokedAt: new Date('2026-02-14'),
      metadata: JSON.stringify({ studentId: 'AAU/ET/2021/308' }),
    },
    {
      certificateId: 'TER-2026-9X5T3B8R',
      studentName: 'Bethlehem Tadesse',
      degree: 'Bachelor of Science in Artificial Intelligence',
      department: 'Faculty of Computing & Data Science',
      issueDate: new Date('2026-07-10'),
      institutionId: nstu.id,
      status: 'ACTIVE',
      metadata: JSON.stringify({ cgpa: '3.92', distinction: 'Great Distinction', studentId: 'AASTU/AI/2022/019' }),
    },
    {
      certificateId: 'TER-2026-1Y8N4K6J',
      studentName: 'Kenenisa Bekele',
      degree: 'Bachelor of Science in Civil & Environmental Engineering',
      department: 'Faculty of Engineering',
      issueDate: new Date('2026-07-10'),
      institutionId: nstu.id,
      status: 'ACTIVE',
      metadata: JSON.stringify({ cgpa: '3.75', distinction: 'Distinction', studentId: 'AASTU/CE/2022/088' }),
    },
    {
      certificateId: 'TER-2026-4C7V2N5M',
      studentName: 'Meron Gebremariam',
      degree: 'Postgraduate Diploma in Network Engineering',
      department: 'Department of Information Technology',
      issueDate: new Date('2025-11-20'),
      institutionId: nstu.id,
      status: 'REVOKED',
      revocationReason: 'Administrative error: Duplicate credential issued with incorrect major specialization. Re-issued under credential TER-2026-9X5T3B8R.',
      revokedAt: new Date('2026-01-20'),
      metadata: JSON.stringify({ studentId: 'AASTU/PG/2025/004' }),
    },
  ];

  const createdCertificates = [];
  for (const c of certsToCreate) {
    const qrCodeUrl = await generateQR(c.certificateId);
    const cert = await prisma.certificate.create({
      data: {
        ...c,
        qrCodeUrl,
      },
    });
    createdCertificates.push(cert);
    console.log(` Created Certificate: [${cert.status}] ${cert.certificateId} - ${cert.studentName}`);
  }

  // 5. Create Sample Verification Logs
  const activeCert = createdCertificates[0];
  const revokedCert = createdCertificates[2];

  const logsToCreate = [
    {
      certificateId: activeCert.id,
      queriedId: activeCert.certificateId,
      result: 'VALID',
      ipAddress: '197.156.104.22',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      certificateId: activeCert.id,
      queriedId: activeCert.certificateId,
      result: 'VALID',
      ipAddress: '213.55.76.10',
      userAgent: 'TerAuth Mobile Scanner (iOS 17.4)',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
      certificateId: revokedCert.id,
      queriedId: revokedCert.certificateId,
      result: 'REVOKED',
      ipAddress: '197.156.110.45',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    },
    {
      certificateId: null,
      queriedId: 'TER-9999-FAKE0001',
      result: 'INVALID',
      ipAddress: '185.220.101.5',
      userAgent: 'Mozilla/5.0 (Unknown; Linux x86_64)',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      certificateId: null,
      queriedId: 'CERT-000123',
      result: 'INVALID',
      ipAddress: '197.156.88.19',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X)',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
  ];

  for (const log of logsToCreate) {
    await prisma.verificationLog.create({ data: log });
  }

  console.log(' Created sample verification audit logs.');
  console.log('\n=============================================');
  console.log(' TerAuth Database Seeding Complete!');
  console.log('=============================================');
  console.log('Demo Credentials:');
  console.log('  1. Super Admin:');
  console.log('     Username: superadmin');
  console.log('     Password: Admin@12345');
  console.log('  2. AAIT Institution Admin:');
  console.log('     Username: aait_admin');
  console.log('     Password: Institution@12345');
  console.log('  3. NSTU Institution Admin:');
  console.log('     Username: nstu_admin');
  console.log('     Password: Institution@12345');
  console.log('  4. Organization Admin:');
  console.log('     Username: hr_director');
  console.log('     Password: OrgAdmin@12345');
  console.log('Sample Certificate IDs:');
  console.log('  - VALID:   TER-2026-8F4K2M9X (Abebe Bikila)');
  console.log('  - VALID:   TER-2026-3P9W7L4Q (Sara Yohannes)');
  console.log('  - REVOKED: TER-2026-6M2D9V1K (Dawit Haile)');
  console.log('=============================================\n');
}

seed()
  .catch((e) => {
    console.error(' Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
