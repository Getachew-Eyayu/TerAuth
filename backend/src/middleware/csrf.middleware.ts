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
      sameSite: 'strict',
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

  // For state-changing requests, if an XSRF-TOKEN cookie is set, verify header matches
  const cookieToken = (req as any).cookies?.['XSRF-TOKEN'];
  const headerToken = req.headers['x-csrf-token'];

  if (cookieToken && (!headerToken || headerToken !== cookieToken)) {
    res.status(403).json({
      success: false,
      message: 'CSRF token validation failed: Invalid or missing X-CSRF-Token header.',
    });
    return;
  }

  next();
};
