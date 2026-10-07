import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller.js';
import { authenticateToken, requireRoles } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { CreateCertificateSchema, RevokeCertificateSchema } from '../validators/schemas.js';

const router = Router();

// Create certificate: Super Admin or Institution Admin
router.post(
  '/',
  authenticateToken,
  requireRoles('SUPER_ADMIN', 'INSTITUTION_ADMIN'),
  validateRequest(CreateCertificateSchema),
  CertificateController.create
);

// List certificates (role scoped)
router.get(
  '/',
  authenticateToken,
  requireRoles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ORGANIZATION_ADMIN'),
  CertificateController.getAll
);

// Get single certificate details
router.get(
  '/:id',
  authenticateToken,
  requireRoles('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ORGANIZATION_ADMIN'),
  CertificateController.getById
);

// Revoke certificate
router.patch(
  '/:id/revoke',
  authenticateToken,
  requireRoles('SUPER_ADMIN', 'INSTITUTION_ADMIN'),
  validateRequest(RevokeCertificateSchema),
  CertificateController.revoke
);

export default router;
