"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const institution_controller_js_1 = require("../controllers/institution.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const validate_middleware_js_1 = require("../middleware/validate.middleware.js");
const schemas_js_1 = require("../validators/schemas.js");
const router = (0, express_1.Router)();
// Public registration
router.post('/register', (0, validate_middleware_js_1.validateRequest)(schemas_js_1.RegisterInstitutionSchema), institution_controller_js_1.InstitutionController.register);
// Super Admin and Institution Admin endpoints
router.get('/', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN'), institution_controller_js_1.InstitutionController.getAll);
router.get('/:id', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN', 'INSTITUTION_ADMIN'), institution_controller_js_1.InstitutionController.getById);
router.patch('/:id', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN', 'INSTITUTION_ADMIN'), (0, validate_middleware_js_1.validateRequest)(schemas_js_1.UpdateInstitutionSchema), institution_controller_js_1.InstitutionController.update);
router.patch('/:id/approve', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN'), institution_controller_js_1.InstitutionController.approve);
router.patch('/:id/reject', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN'), institution_controller_js_1.InstitutionController.reject);
router.patch('/:id/status', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN'), institution_controller_js_1.InstitutionController.toggleStatus);
exports.default = router;
