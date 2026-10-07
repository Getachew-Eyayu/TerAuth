import QRCode from 'qrcode';

export class QRService {
  /**
   * Generates standard verification URL pointing to TerAuth verification endpoint
   */
  static getVerificationUrl(certificateId: string): string {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return `${frontendUrl}/verify/${encodeURIComponent(certificateId)}`;
  }

  /**
   * Generates a high-quality QR code data URL (PNG) containing strictly the verification URL.
   * Does NOT embed raw student PII in the QR code.
   */
  static async generateQRCodeDataUrl(certificateId: string): Promise<string> {
    const url = this.getVerificationUrl(certificateId);
    
    return QRCode.toDataURL(url, {
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
  static async generateQRCodeSvg(certificateId: string): Promise<string> {
    const url = this.getVerificationUrl(certificateId);
    
    return QRCode.toString(url, {
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
