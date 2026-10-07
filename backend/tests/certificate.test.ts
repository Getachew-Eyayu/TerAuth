import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';

describe('Certificate Management API Tests', () => {
  let aaitToken: string;

  beforeAll(async () => {
    await prisma.$connect();
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'aait_admin',
      password: 'Institution@12345',
    });
    aaitToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should allow institution admin to create a new certificate with secure ID and QR code', async () => {
    const certPayload = {
      studentName: 'Tewodros Kassahun',
      degree: 'Bachelor of Science in Computer Science',
      department: 'School of Information Technology',
      issueDate: '2026-07-20',
    };

    const res = await request(app)
      .post('/api/certificates')
      .set('Authorization', `Bearer ${aaitToken}`)
      .send(certPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.certificateId).toMatch(/^TER-\d{4}-[A-Z0-9]+$/);
    expect(res.body.data.qrCodeUrl).toContain('data:image/png;base64');
    expect(res.body.data.status).toBe('ACTIVE');
  });

  it('should list certificates scoped to the institution', async () => {
    const res = await request(app)
      .get('/api/certificates')
      .set('Authorization', `Bearer ${aaitToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});
