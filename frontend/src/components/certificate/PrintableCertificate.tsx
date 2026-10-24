import React, { useRef } from 'react';
import { Certificate } from '../../types';
import { Shield, Award, CheckCircle, Download, Printer, Copy, Check } from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface PrintableCertificateProps {
  certificate: Certificate;
  onRevokeClick?: () => void;
  canRevoke?: boolean;
}

export const PrintableCertificate: React.FC<PrintableCertificateProps> = ({
  certificate,
  onRevokeClick,
  canRevoke = false,
}) => {
  const [copied, setCopied] = React.useState(false);
  const verifyUrl = `${window.location.origin}/verify/${certificate.certificateId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = certificate.qrCodeUrl;
    link.download = `QR_${certificate.certificateId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formattedDate = new Date(certificate.issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <StatusBadge status={certificate.status} size="lg" />
          <span className="text-xs text-slate-500 font-mono">
            Ref: <strong className="text-slate-800 font-bold">{certificate.certificateId}</strong>
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied URL!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={handleDownloadQR}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/60 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download QR PNG</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Export PDF</span>
          </button>

          {canRevoke && certificate.status === 'ACTIVE' && onRevokeClick && (
            <button
              onClick={onRevokeClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <span>Revoke Certificate</span>
            </button>
          )}
        </div>
      </div>

      {/* Revocation Banner if Revoked */}
      {certificate.status === 'REVOKED' && (
        <div className="no-print bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl">
          <div className="flex">
            <div>
              <h3 className="text-sm font-bold text-rose-800">NOTICE: This credential has been officially revoked</h3>
              <p className="text-xs text-rose-700 mt-1">
                <strong>Reason:</strong> {certificate.revocationReason || 'Revoked by authorized institution'}
              </p>
              {certificate.revokedAt && (
                <p className="text-[11px] text-rose-600 mt-0.5">
                  Revocation Recorded on: {new Date(certificate.revokedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Ornate Physical Certificate Sheet */}
      <div
        id="printable-certificate-area"
        className="bg-white border-8 border-double border-slate-300 p-8 sm:p-14 shadow-lg rounded-sm relative overflow-hidden text-slate-800 max-w-4xl mx-auto"
        style={{ minHeight: '680px' }}
      >
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <Shield className="w-[500px] h-[500px] text-navy-900" />
        </div>

        {/* Outer thin decorative border */}
        <div className="border border-amber-600/30 p-6 sm:p-10 h-full flex flex-col justify-between relative z-10 bg-gradient-to-b from-amber-50/20 via-transparent to-amber-50/20">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-navy-900 flex items-center justify-center text-amber-400 border border-amber-500/40 shadow-sm">
                <Award className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[11px] uppercase tracking-[0.25em] font-bold text-slate-500">
              {certificate.institution?.name || 'Accredited Higher Education Institution'}
            </p>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-navy-900 tracking-wide pt-1">
              CERTIFICATE OF MERIT & QUALIFICATION
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-2" />
          </div>

          {/* Body Content */}
          <div className="text-center my-8 space-y-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 italic">This is to officially certify that</p>
            <h2 className="text-2xl sm:text-4xl font-serif-title font-bold text-slate-900 tracking-wide text-blue-950 underline decoration-amber-500/40 underline-offset-8">
              {certificate.studentName}
            </h2>
            <p className="text-xs text-slate-600 pt-2">has successfully satisfied all requirements for the conferral of</p>
            <h3 className="text-lg sm:text-xl font-bold text-navy-900 tracking-tight">
              {certificate.degree}
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Major Field: <span className="font-semibold text-slate-800">{certificate.department}</span>
            </p>
          </div>

          {/* Footer details, Signatures & Anti-tamper QR Code */}
          <div className="pt-6 border-t border-slate-200 mt-6 grid grid-cols-3 items-end gap-4 text-center">
            {/* Left Signature */}
            <div className="space-y-1">
              <div className="h-10 flex items-end justify-center">
                <span className="font-serif italic text-sm text-slate-700 font-bold border-b border-slate-400 pb-1 px-4">
                  Office of Registrar
                </span>
              </div>
              <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">Authorized Signature</p>
              <p className="text-[10px] text-slate-400">Date: {formattedDate}</p>
            </div>

            {/* Center: Cryptographic Seal & ID */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="w-14 h-14 rounded-full border-2 border-dashed border-amber-600/60 flex items-center justify-center p-1 bg-amber-50/40">
                <div className="w-full h-full rounded-full bg-navy-900 flex flex-col items-center justify-center text-white">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span className="text-[7px] font-bold tracking-tighter uppercase text-amber-300">SEAL</span>
                </div>
              </div>
              <p className="text-[9px] font-mono font-bold text-slate-700 tracking-wider">
                {certificate.certificateId}
              </p>
              <span className="text-[8px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-0.5">
                <CheckCircle className="w-2.5 h-2.5" />
                Verified TerAuth
              </span>
            </div>

            {/* Right: Anti-tamper QR Code */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="p-1 bg-white border border-slate-300 rounded shadow-sm">
                <img
                  src={certificate.qrCodeUrl}
                  alt={`QR Code for ${certificate.certificateId}`}
                  className="w-20 h-20 object-contain"
                />
              </div>
              <p className="text-[9px] text-slate-600 font-medium text-center">
                Verify at <span className="font-bold text-blue-700">terauth.vercel.app</span> or scan QR code
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
