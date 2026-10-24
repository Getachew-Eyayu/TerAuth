"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_js_1 = __importDefault(require("../prisma.js"));
const auth_service_js_1 = require("../services/auth.service.js");
const audit_service_js_1 = require("../services/audit.service.js");
class AuthController {
    /**
     * User login (Super Admin, Institution Admin, Organization Admin)
     */
    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await prisma_js_1.default.user.findFirst({
                where: {
                    OR: [
                        { username: username.trim() },
                        { email: username.trim().toLowerCase() },
                    ],
                },
                include: {
                    institution: true,
                },
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password',
                });
                return;
            }
            const isMatch = await auth_service_js_1.AuthService.comparePassword(password, user.passwordHash);
            if (!isMatch) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid username or password',
                });
                return;
            }
            if (user.status !== 'ACTIVE') {
                res.status(403).json({
                    success: false,
                    message: 'Your account has been deactivated. Please contact support.',
                });
                return;
            }
            // Check institution status if user belongs to an institution
            if (user.role === 'INSTITUTION_ADMIN' && user.institution) {
                if (user.institution.status === 'PENDING') {
                    res.status(403).json({
                        success: false,
                        message: 'Your institution registration is currently PENDING approval by the Super Admin.',
                    });
                    return;
                }
                if (user.institution.status === 'REJECTED') {
                    res.status(403).json({
                        success: false,
                        message: `Institution registration rejected: ${user.institution.rejectionReason || 'Contact support'}`,
                    });
                    return;
                }
                if (user.institution.status === 'SUSPENDED') {
                    res.status(403).json({
                        success: false,
                        message: 'Institution access has been suspended.',
                    });
                    return;
                }
            }
            const tokenPayload = {
                id: user.id,
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
                institutionId: user.institutionId,
            };
            const accessToken = auth_service_js_1.AuthService.generateAccessToken(tokenPayload);
            const refreshToken = auth_service_js_1.AuthService.generateRefreshToken({ id: user.id, userId: user.userId });
            // Save hashed refresh token
            const refreshTokenHash = await auth_service_js_1.AuthService.hashPassword(refreshToken);
            await prisma_js_1.default.user.update({
                where: { id: user.id },
                data: { refreshTokenHash },
            });
            res.cookie('terauth_refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/auth',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    accessToken,
                    refreshToken,
                    user: {
                        id: user.id,
                        userId: user.userId,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        institutionId: user.institutionId,
                        institution: user.institution
                            ? {
                                id: user.institution.id,
                                institutionId: user.institution.institutionId,
                                name: user.institution.name,
                                status: user.institution.status,
                            }
                            : null,
                    },
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Login failed',
            });
        }
    }
    /**
     * Rotate access token using valid refresh token (supports cookie and body)
     */
    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies?.terauth_refresh_token || req.body?.refreshToken;
            if (!refreshToken) {
                res.status(401).json({
                    success: false,
                    message: 'Refresh token required',
                });
                return;
            }
            const decoded = auth_service_js_1.AuthService.verifyRefreshToken(refreshToken);
            const user = await prisma_js_1.default.user.findUnique({
                where: { id: decoded.id },
                include: { institution: true },
            });
            if (!user || !user.refreshTokenHash) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid or revoked refresh token',
                });
                return;
            }
            const isValidToken = await auth_service_js_1.AuthService.comparePassword(refreshToken, user.refreshTokenHash);
            if (!isValidToken) {
                res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token',
                });
                return;
            }
            const tokenPayload = {
                id: user.id,
                userId: user.userId,
                username: user.username,
                email: user.email,
                role: user.role,
                institutionId: user.institutionId,
            };
            const newAccessToken = auth_service_js_1.AuthService.generateAccessToken(tokenPayload);
            const newRefreshToken = auth_service_js_1.AuthService.generateRefreshToken({ id: user.id, userId: user.userId });
            const newHash = await auth_service_js_1.AuthService.hashPassword(newRefreshToken);
            await prisma_js_1.default.user.update({
                where: { id: user.id },
                data: { refreshTokenHash: newHash },
            });
            res.cookie('terauth_refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/auth',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            res.status(200).json({
                success: true,
                data: {
                    accessToken: newAccessToken,
                    refreshToken: newRefreshToken,
                },
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
        }
    }
    /**
     * Logout user by invalidating refresh token and clearing authentication cookie
     */
    static async logout(req, res) {
        try {
            res.clearCookie('terauth_refresh_token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/api/auth',
            });
            if (req.user?.id) {
                await prisma_js_1.default.user.update({
                    where: { id: req.user.id },
                    data: { refreshTokenHash: null },
                });
            }
            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Logout failed',
            });
        }
    }
    /**
     * Get authenticated user profile
     */
    static async getCurrentUser(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const user = await prisma_js_1.default.user.findUnique({
                where: { id: req.user.id },
                include: {
                    institution: true,
                },
            });
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    institution: user.institution,
                },
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch current user profile',
            });
        }
    }
    /**
     * Change authenticated user's password
     */
    static async changePassword(req, res) {
        try {
            if (!req.user?.id) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { currentPassword, newPassword } = req.body;
            const user = await prisma_js_1.default.user.findUnique({
                where: { id: req.user.id },
            });
            if (!user) {
                res.status(404).json({ success: false, message: 'User not found' });
                return;
            }
            const isCurrentMatch = await auth_service_js_1.AuthService.comparePassword(currentPassword, user.passwordHash);
            if (!isCurrentMatch) {
                res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect.',
                });
                return;
            }
            const newPasswordHash = await auth_service_js_1.AuthService.hashPassword(newPassword);
            await prisma_js_1.default.user.update({
                where: { id: user.id },
                data: { passwordHash: newPasswordHash },
            });
            await audit_service_js_1.AuditService.logAdminAction({
                actorId: user.id,
                actorUsername: user.username,
                action: 'PASSWORD_CHANGED',
                targetType: 'USER',
                targetId: user.userId,
                ipAddress: req.ip,
            });
            res.status(200).json({
                success: true,
                message: 'Password successfully changed.',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to change password.',
            });
        }
    }
}
exports.AuthController = AuthController;
