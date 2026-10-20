import request from 'supertest';
import app from '../src/app';
import prisma from '../src/prisma';

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should successfully log in as Super Admin with valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'superadmin',
      password: 'Admin@12345',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.role).toBe('SUPER_ADMIN');
    expect(res.body.data.user.passwordHash).toBeUndefined(); // Security: never expose password hash
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      username: 'superadmin',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should prevent access to protected admin route without token', async () => {
    const res = await request(app).get('/api/institutions');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow superadmin to fetch list of institutions', async () => {
    const loginRes = await request(app).post('/api/auth/login').send({
      username: 'superadmin',
      password: 'Admin@12345',
    });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .get('/api/institutions')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should throw fatal configuration error if JWT secret is missing or default in production', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_ACCESS_SECRET;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.JWT_ACCESS_SECRET;

      const { AuthService, validateJwtConfiguration } = require('../src/services/auth.service');
      expect(() => validateJwtConfiguration()).toThrow('FATAL CONFIGURATION ERROR');
    } finally {
      process.env.NODE_ENV = originalEnv;
      if (originalSecret) {
        process.env.JWT_ACCESS_SECRET = originalSecret;
      }
    }
  });

  it('should restrict institution admin to viewing only their own institution details', async () => {
    // Log in as AAiT admin
    const aaitLogin = await request(app).post('/api/auth/login').send({
      username: 'aait_admin',
      password: 'Institution@12345',
    });
    const aaitToken = aaitLogin.body.data.accessToken;
    const aaitInstId = aaitLogin.body.data.user.institutionId;

    // Allowed: access own institution
    const ownRes = await request(app)
      .get(`/api/institutions/${aaitInstId}`)
      .set('Authorization', `Bearer ${aaitToken}`);
    expect(ownRes.status).toBe(200);
    expect(ownRes.body.success).toBe(true);

    // Forbidden: access another institution (NSTU)
    const otherInst = await prisma.institution.findFirst({
      where: { institutionId: 'INST-NSTU-002' },
    });
    if (otherInst) {
      const otherRes = await request(app)
        .get(`/api/institutions/${otherInst.id}`)
        .set('Authorization', `Bearer ${aaitToken}`);
      expect(otherRes.status).toBe(403);
      expect(otherRes.body.success).toBe(false);
      expect(otherRes.body.message).toContain('Access restricted');
    }
  });
});
