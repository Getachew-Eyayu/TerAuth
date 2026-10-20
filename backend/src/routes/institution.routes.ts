import { Router } from 'express';
import { InstitutionController } from '../controllers/institution.controller.js';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { RegisterInstitutionSchema } from '../validators/schemas.js';

const router = Router();

// Public registration
router.post('/register', validateRequest(RegisterInstitutionSchema), InstitutionController.register);

// Super Admin and Institution Admin endpoints
router.get('/', authenticateToken, requireRoles('SUPER_ADMIN'), InstitutionController.getAll);
router.get('/:id', authenticateToken, requireRoles('SUPER_ADMIN', 'INSTITUTION_ADMIN'), InstitutionController.getById);
router.patch('/:id/approve', authenticateToken, requireRoles('SUPER_ADMIN'), InstitutionController.approve);
router.patch('/:id/reject', authenticateToken, requireRoles('SUPER_ADMIN'), InstitutionController.reject);
router.patch('/:id/status', authenticateToken, requireRoles('SUPER_ADMIN'), InstitutionController.toggleStatus);

export default router;
