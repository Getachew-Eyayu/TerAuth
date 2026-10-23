"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verification_controller_js_1 = require("../controllers/verification.controller.js");
const rateLimit_middleware_js_1 = require("../middleware/rateLimit.middleware.js");
const auth_middleware_js_1 = require("../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Public verification endpoint - rate limited
router.get('/:certificateId', rateLimit_middleware_js_1.verificationRateLimiter, verification_controller_js_1.VerificationController.verify);
// Internal verification logs - role protected
router.get('/', auth_middleware_js_1.authenticateToken, (0, auth_middleware_js_1.requireRoles)('SUPER_ADMIN', 'INSTITUTION_ADMIN'), verification_controller_js_1.VerificationController.getLogs);
exports.default = router;
