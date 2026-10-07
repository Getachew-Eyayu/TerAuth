import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { VerificationResponse } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { QRScannerModal } from '../../components/common/QRScannerModal';
import {
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Search,
  Camera,
  CheckCircle2,
  Calendar,
  Building2,
  User,
  GraduationCap,
  Share2,
  Printer,
  Copy,
  Check,
  RefreshCw,
  Info,
} from 'lucide-react';

export const VerifyPage: React.FC = () => {
  const { certificateId: paramCertId } = useParams<{ certificateId?: string }>();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState<string>(paramCertId || '');
  const [result, setResult] = useState<VerificationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    if (paramCertId) {
      setSearchId(paramCertId);
      performVerification(paramCertId);
    }
  }, [paramCertId]);

  const performVerification = async (id: string) => {
    const cleanId = id.trim();
    if (!cleanId) return;

    setIsLoading(true);
    setHasSearched(true);
    setResult(null);

    try {
      const res = await api.get(`/verify/${encodeURIComponent(cleanId)}`);
      setResult(res.data);
    } catch (error: any) {
      if (error.response?.data) {
        setResult(error.response.data);
      } else {
        setResult({
          success: false,
          status: 'INVALID',
          message: 'Unable to communicate with the verification server. Please check connection.',
          queriedId: cleanId,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify/${encodeURIComponent(searchId.trim())}`);
    }
  };

  const handleScanSuccess = (scannedId: string) => {
    setSearchId(scannedId);
    navigate(`/verify/${encodeURIComponent(scannedId)}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Public Credential Verification Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            Verify Digital Certificate
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Directly query the TerAuth national database to validate certificate authenticity, check revocation status, and view certified institutional credentials.
          </p>
        </div>

        {/* Search & Scan Box */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                placeholder="Enter Certificate ID (e.g. TER-2026-8F4K2M9X)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase font-semibold text-slate-900 placeholder:normal-case placeholder:font-sans placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isLoading || !searchId.trim()}
                className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>Verify</span>
              </button>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-colors"
                title="Scan QR with Camera or Image"
              >
                <Camera className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Camera</span>
              </button>
            </div>
          </form>

          {/* Quick instructions */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 px-1">
            <span>Tip: Certificate IDs are formatted like <code className="text-slate-600 font-mono">TER-YYYY-XXXXXXXX</code></span>
            <span className="text-emerald-600 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" /> 256-bit Secure
            </span>
          </div>
        </div>

        {/* Verification Result Area */}
        {isLoading && (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-4 shadow-sm">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">Contacting TerAuth Verification Node...</p>
              <p className="text-xs text-slate-500">Querying real-time database ledger and revocation index.</p>
            </div>
          </div>
        )}

        {!isLoading && result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Case 1: VALID Certificate */}
            {result.status === 'VALID' && result.data && (
              <div className="bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md overflow-hidden">
                {/* Header status bar */}
                <div className="bg-emerald-600 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">VERIFIED CERTIFICATE</h2>
                      <p className="text-xs text-emerald-100">Authenticated and registered on TerAuth Platform</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold tracking-wider">
                    ACTIVE
                  </span>
                </div>

                {/* Certificate Details Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Student & Qualification Highlight */}
                  <div className="border-b border-slate-100 pb-6 space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Awarded To</span>
                    <h3 className="text-2xl font-bold text-slate-900 font-serif-title">{result.data.studentName}</h3>
                    <p className="text-base font-semibold text-blue-900 pt-1">{result.data.degree}</p>
                    <p className="text-xs text-slate-500">{result.data.department}</p>
                  </div>

                  {/* Grid of metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Issuing Institution</span>
                        <span className="font-bold text-slate-800 text-sm block mt-0.5">{result.data.institution.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">Code: {result.data.institution.institutionId}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Date of Conferral</span>
                        <span className="font-bold text-slate-800 text-sm block mt-0.5">
                          {new Date(result.data.issueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-medium">Status: ACTIVE</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3 sm:col-span-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="w-full">
                        <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider block">Cryptographic Reference</span>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className="font-mono font-bold text-slate-900 text-sm">{result.data.certificateId}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                            Verified by TerAuth
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Share & Print Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <span className="text-slate-400">
                      Verified at: {new Date(result.data.verificationTimestamp).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{copied ? 'Copied' : 'Share Link'}</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 text-white font-medium hover:bg-navy-800 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Record</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Case 2: REVOKED Certificate */}
            {result.status === 'REVOKED' && result.data && (
              <div className="bg-white rounded-2xl border-2 border-rose-500 shadow-md overflow-hidden">
                <div className="bg-rose-600 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-6 h-6 text-white" />
                    <div>
                      <h2 className="text-lg font-bold tracking-tight">CERTIFICATE REVOKED</h2>
                      <p className="text-xs text-rose-100">This credential has been officially invalidated by the institution</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-mono font-bold tracking-wider">
                    REVOKED
                  </span>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Revocation Alert Box */}
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800 text-sm">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Official Revocation Statement</span>
                    </div>
                    <p className="font-semibold text-rose-800">
                      Reason: <span className="font-normal">{result.data.revocationReason || 'Revoked by authority'}</span>
                    </p>
                    {result.data.revokedAt && (
                      <p className="text-[11px] text-rose-600">
                        Date Revoked: {new Date(result.data.revokedAt).toLocaleString()}
                      </p>
                    )}
                  </div>

                  <div className="border-b border-slate-100 pb-6 space-y-1 opacity-75">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Awarded To (Past Record)</span>
                    <h3 className="text-2xl font-bold text-slate-900 font-serif-title">{result.data.studentName}</h3>
                    <p className="text-base font-semibold text-slate-700 pt-1">{result.data.degree}</p>
                    <p className="text-xs text-slate-500">{result.data.department} • {result.data.institution.name}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-mono">ID: {result.data.certificateId}</span>
                    <span className="text-rose-600 font-bold">TerAuth Registry: REVOKED</span>
                  </div>
                </div>
              </div>
            )}

            {/* Case 3: INVALID / NOT FOUND */}
            {result.status === 'INVALID' && (
              <div className="bg-white rounded-2xl border-2 border-slate-300 shadow-sm p-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">CERTIFICATE NOT FOUND</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    The requested identifier <strong className="font-mono text-slate-800">{result.queriedId || searchId}</strong> does not match any record in the TerAuth registry.
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-xs max-w-lg mx-auto text-left space-y-1.5">
                  <p className="font-semibold flex items-center gap-1.5 text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Important Fraud Prevention Notice</span>
                  </p>
                  <p className="leading-relaxed">
                    If someone presented a document bearing this ID, it is either unauthenticated, improperly formatted, or fraudulent. Contact the issuing institution directly for clarification.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Scanner Modal */}
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      </div>
    </div>
  );
};
