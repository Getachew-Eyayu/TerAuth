"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_js_1 = require("../controllers/user.controller.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN'), user_controller_js_1.UserController.getAll);
router.patch('/:id/status', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN'), user_controller_js_1.UserController.toggleStatus);
exports.default = router;
