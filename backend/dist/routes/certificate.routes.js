"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const certificate_controller_js_1 = require("../controllers/certificate.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const schemas_js_1 = require("../validators/schemas.js");
const router = (0, express_1.Router)();
// Create certificate: Super Admin or Institution Admin
router.post('/', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN', 'INSTITUTION_ADMIN'), (0, validate_middleware_js_1.validateRequest)(schemas_js_1.CreateCertificateSchema), certificate_controller_js_1.CertificateController.create);
// List certificates (role scoped)
router.get('/', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ORGANIZATION_ADMIN'), certificate_controller_js_1.CertificateController.getAll);
// Get single certificate details
router.get('/:id', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'ORGANIZATION_ADMIN'), certificate_controller_js_1.CertificateController.getById);
// Revoke certificate
router.patch('/:id/revoke', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN', 'INSTITUTION_ADMIN'), (0, validate_middleware_js_1.validateRequest)(schemas_js_1.RevokeCertificateSchema), certificate_controller_js_1.CertificateController.revoke);
exports.default = router;
