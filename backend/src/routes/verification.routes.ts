import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller.js';
import { verificationRateLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Public verification endpoint - rate limited
router.get('/:certificateId', verificationRateLimiter, VerificationController.verify);

// Internal verification logs - role protected
router.get('/', authenticateToken, requireRoles('SUPER_ADMIN', 'INSTITUTION_ADMIN'), VerificationController.getLogs);

export default router;
