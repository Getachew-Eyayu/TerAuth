"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_js_1 = require("../controllers/dashboard.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.get('/admin', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN'), dashboard_controller_js_1.DashboardController.getAdminStats);
router.get('/institution', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('INSTITUTION_ADMIN'), dashboard_controller_js_1.DashboardController.getInstitutionStats);
exports.default = router;
