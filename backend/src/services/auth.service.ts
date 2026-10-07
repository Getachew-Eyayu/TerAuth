import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TokenPayload, UserRole } from '../types/index.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'default_access_secret_change_in_production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_in_production';
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
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_EXPIRES_IN as any,
    });
  }

  /**
   * Generates a signed JWT Refresh Token
   */
  static generateRefreshToken(payload: { id: string; userId: string }): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_EXPIRES_IN as any,
    });
  }

  /**
   * Verifies an Access Token
   */
  static verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
  }

  /**
   * Verifies a Refresh Token
   */
  static verifyRefreshToken(token: string): { id: string; userId: string } {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { id: string; userId: string };
  }
}
