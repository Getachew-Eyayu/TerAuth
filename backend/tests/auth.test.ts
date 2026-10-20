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
});
