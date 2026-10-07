import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticateToken, requireRoles('SUPER_ADMIN'), UserController.getAll);
router.patch('/:id/status', authenticateToken, requireRoles('SUPER_ADMIN'), UserController.toggleStatus);

export default router;
