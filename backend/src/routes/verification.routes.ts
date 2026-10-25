import { Router } from 'express';
import { VerificationController } from '../controllers/verification.controller.js';
import { verificationRateLimiter } from '../middleware/rateLimit.middleware.js';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();

// Handle missing certificateId on public verification route (/api/verify)
router.get('/', (req, res, next) => {
  if (req.baseUrl === '/api/verify') {
    res.status(400).json({
      success: false,
      status: 'INVALID',
      message: 'Certificate ID is required for verification.',
    });
    return;
  }
  next();
});

// Internal verification logs - role protected (/api/verifications)
router.get('/', authenticateToken, requireRoles('SUPER_ADMIN', 'INSTITUTION_ADMIN'), VerificationController.getLogs);

// Public verification endpoint - rate limited (/api/verify/:certificateId)
router.get('/:certificateId', verificationRateLimiter, VerificationController.verify);

export default router;
