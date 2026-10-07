import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/admin', authenticateToken, requireRoles('SUPER_ADMIN'), DashboardController.getAdminStats);
router.get('/institution', authenticateToken, requireRoles('INSTITUTION_ADMIN'), DashboardController.getInstitutionStats);

export default router;
