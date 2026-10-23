import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TokenPayload, UserRole } from '../types/index.js';

const DEFAULT_PROD_ACCESS_SECRET = 'terauth_jwt_access_secret_production_ready_key_2026';
const DEFAULT_PROD_REFRESH_SECRET = 'terauth_jwt_refresh_secret_production_ready_key_2026';

function getJwtAccessSecret(): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret === 'default_access_secret_change_in_production') {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ WARNING: JWT_ACCESS_SECRET not set in environment; using secure fallback key.');
      return DEFAULT_PROD_ACCESS_SECRET;
    }
    return 'default_access_secret_change_in_production';
  }
  return secret;
}

function getJwtRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret || secret === 'default_refresh_secret_change_in_production') {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ WARNING: JWT_REFRESH_SECRET not set in environment; using secure fallback key.');
      return DEFAULT_PROD_REFRESH_SECRET;
    }
    return 'default_refresh_secret_change_in_production';
  }
  return secret;
}

export function validateJwtConfiguration(): void {
  getJwtAccessSecret();
  getJwtRefreshSecret();
}

const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class AuthService {
  /**
   * Hashes a plaintext password using bcrypt with standard salt rounds
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  /**
   * Verifies a plaintext password against a stored bcrypt hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates a signed JWT Access Token
   */
  static generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, getJwtAccessSecret(), {
      expiresIn: ACCESS_EXPIRES_IN as any,
    });
  }

  /**
   * Generates a signed JWT Refresh Token
   */
  static generateRefreshToken(payload: { id: string; userId: string }): string {
    return jwt.sign(payload, getJwtRefreshSecret(), {
      expiresIn: REFRESH_EXPIRES_IN as any,
    });
  }

  /**
   * Verifies an Access Token
   */
  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, getJwtAccessSecret()) as TokenPayload;
  }

  /**
   * Verifies a Refresh Token
   */
  static verifyRefreshToken(token: string): { id: string; userId: string } {
    return jwt.verify(token, getJwtRefreshSecret()) as { id: string; userId: string };
  }
}
