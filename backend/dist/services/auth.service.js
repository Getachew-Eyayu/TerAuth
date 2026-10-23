"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
exports.validateJwtConfiguration = validateJwtConfiguration;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function getJwtAccessSecret() {
    const secret = process.env.JWT_ACCESS_SECRET;
    if (!secret || secret === 'default_access_secret_change_in_production') {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL CONFIGURATION ERROR: JWT_ACCESS_SECRET must be securely configured in production environment.');
        }
        return 'default_access_secret_change_in_production';
    }
    return secret;
}
function getJwtRefreshSecret() {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (!secret || secret === 'default_refresh_secret_change_in_production') {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('FATAL CONFIGURATION ERROR: JWT_REFRESH_SECRET must be securely configured in production environment.');
        }
        return 'default_refresh_secret_change_in_production';
    }
    return secret;
}
function validateJwtConfiguration() {
    getJwtAccessSecret();
    getJwtRefreshSecret();
}
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
class AuthService {
    /**
     * Hashes a plaintext password using bcrypt with standard salt rounds
     */
    static async hashPassword(password) {
        const salt = await bcryptjs_1.default.genSalt(12);
        return bcryptjs_1.default.hash(password, salt);
    }
    /**
     * Verifies a plaintext password against a stored bcrypt hash
     */
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    /**
     * Generates a signed JWT Access Token
     */
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, getJwtAccessSecret(), {
            expiresIn: ACCESS_EXPIRES_IN,
        });
    }
    /**
     * Generates a signed JWT Refresh Token
     */
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, getJwtRefreshSecret(), {
            expiresIn: REFRESH_EXPIRES_IN,
        });
    }
    /**
     * Verifies an Access Token
     */
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, getJwtAccessSecret());
    }
    /**
     * Verifies a Refresh Token
     */
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, getJwtRefreshSecret());
    }
}
exports.AuthService = AuthService;
