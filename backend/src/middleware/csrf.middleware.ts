import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

/**
 * Double-submit anti-CSRF protection middleware.
 * - Issues a secure XSRF-TOKEN cookie on initial GET / auth requests.
 * - Validates matching X-CSRF-Token header on state-changing requests (POST, PUT, PATCH, DELETE).
 * - Excludes idempotent/safe methods (GET, HEAD, OPTIONS) and public verification endpoints.
 */
export const csrfProtection = (req: Request, res: Response, next: NextFunction): void => {
  // Ensure an XSRF-TOKEN cookie exists; if not, issue a cryptographically secure token
  const existingCookieToken = (req as any).cookies?.['XSRF-TOKEN'];
  if (!existingCookieToken) {
    const newToken = crypto.randomBytes(24).toString('hex');
    res.cookie('XSRF-TOKEN', newToken, {
      httpOnly: false, // Must be readable by client JS to copy into request header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  // Safe HTTP methods do not mutate state
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Exempt public verification, public registration, or login endpoints where session cookie doesn't yet exist
  const exemptPaths = [
    '/api/verify',
    '/api/health',
    '/api/auth/login',
    '/api/auth/register',
    '/api/institutions/register',
  ];

  if (exemptPaths.some((p) => req.path.startsWith(p))) {
    return next();
  }

  // For state-changing requests, enforce double-submit verification
  const cookieToken = (req as any).cookies?.['XSRF-TOKEN'];
  const rawHeader = req.headers['x-csrf-token'] || req.headers['X-CSRF-Token'];
  const headerToken = Array.isArray(rawHeader) ? rawHeader[0] : (rawHeader as string | undefined);

  if (cookieToken) {
    if (!headerToken) {
      res.status(403).json({
        success: false,
        message: 'CSRF token missing: X-CSRF-Token header is required for state-changing requests.',
      });
      return;
    }

    const cookieBuf = Buffer.from(cookieToken);
    const headerBuf = Buffer.from(headerToken);
    if (cookieBuf.length !== headerBuf.length || !crypto.timingSafeEqual(cookieBuf, headerBuf)) {
      res.status(403).json({
        success: false,
        message: 'CSRF token validation failed: Invalid or mismatched X-CSRF-Token header.',
      });
      return;
    }
  } else if (!req.headers.authorization) {
    res.status(403).json({
      success: false,
      message: 'CSRF protection: Session cookie or Authorization header required.',
    });
    return;
  }

  next();
};
