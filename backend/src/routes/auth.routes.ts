import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { LoginSchema, RefreshTokenSchema } from '../validators/schemas.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/login', authRateLimiter, validateRequest(LoginSchema), AuthController.login);
router.post('/refresh', validateRequest(RefreshTokenSchema), AuthController.refreshToken);
router.post('/logout', authenticateToken, AuthController.logout);
router.get('/me', authenticateToken, AuthController.getCurrentUser);

export default router;
