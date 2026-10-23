"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QRService = void 0;
const qrcode_1 = __importDefault(require("qrcode"));
class QRService {
    /**
     * Generates standard verification URL pointing to TerAuth verification endpoint
     */
    static getVerificationUrl(certificateId) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return `${frontendUrl}/verify/${encodeURIComponent(certificateId)}`;
    }
    /**
     * Generates a high-quality QR code data URL (PNG) containing strictly the verification URL.
     * Does NOT embed raw student PII in the QR code.
     */
    static async generateQRCodeDataUrl(certificateId) {
        const url = this.getVerificationUrl(certificateId);
        return qrcode_1.default.toDataURL(url, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            margin: 2,
            width: 400,
            color: {
                dark: '#0f172a', // Deep navy
                light: '#ffffff',
            },
        });
    }
    /**
     * Generates an SVG representation of the QR code
     */
    static async generateQRCodeSvg(certificateId) {
        const url = this.getVerificationUrl(certificateId);
        return qrcode_1.default.toString(url, {
            type: 'svg',
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        });
    }
}
exports.QRService = QRService;
