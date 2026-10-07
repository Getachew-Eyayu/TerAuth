import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';

describe('Public Verification API Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return VALID for an active certificate without leaking sensitive fields', async () => {
    const validId = 'TER-2026-8F4K2M9X';
    const res = await request(app).get(`/api/verify/${validId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('VALID');
    expect(res.body.data.certificateId).toBe(validId);
    expect(res.body.data.studentName).toBe('Abebe Bikila');
    expect(res.body.data.passwordHash).toBeUndefined();
    expect(res.body.data.id).toBeUndefined(); // database internal UUID should not leak
  });

  it('should return REVOKED for a revoked certificate with revocation reason', async () => {
    const revokedId = 'TER-2026-6M2D9V1K';
    const res = await request(app).get(`/api/verify/${revokedId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('REVOKED');
    expect(res.body.data.certificateId).toBe(revokedId);
    expect(res.body.data.revocationReason).toBeDefined();
  });

  it('should return 404 / INVALID for a non-existent certificate ID', async () => {
    const invalidId = 'TER-9999-NONEXISTENT';
    const res = await request(app).get(`/api/verify/${invalidId}`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('INVALID');
  });

  it('should log verification attempts in the verification log table', async () => {
    const testId = 'TER-2026-8F4K2M9X';
    await request(app).get(`/api/verify/${testId}`);

    const log = await prisma.verificationLog.findFirst({
      where: { queriedId: testId },
      orderBy: { timestamp: 'desc' },
    });

    expect(log).not.toBeNull();
    expect(log?.result).toBe('VALID');
  });
});
