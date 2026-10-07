import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  CheckCircle2,
  QrCode,
  Building2,
  Search,
  Lock,
  ArrowRight,
  Database,
  FileCheck,
  Award,
  Globe2,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [certInput, setCertInput] = useState('');
  const navigate = useNavigate();

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (certInput.trim()) {
      navigate(`/verify/${encodeURIComponent(certInput.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>National Digital Credential Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Secure Certificate <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                Authentication & Verification
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
              Verify academic credentials instantly through a centralized, tamper-proof digital platform.
              Guarding national qualification integrity for institutions, students, and employers.
            </p>

            {/* Instant Verification Search Box */}
            <div className="pt-4 max-w-2xl mx-auto">
              <form
                onSubmit={handleVerifySubmit}
                className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={certInput}
                    onChange={(e) => setCertInput(e.target.value)}
                    placeholder="Enter Certificate ID (e.g. TER-2026-8F4K2M9X)"
                    className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-sm font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 sm:flex-initial px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
                  >
                    <span>Verify Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <Link
                    to="/verify"
                    className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 border border-white/20 transition-all"
                    title="Scan with Camera"
                  >
                    <QrCode className="w-5 h-5 text-sky-300" />
                    <span className="hidden sm:inline">Scan QR</span>
                  </Link>
                </div>
              </form>
              <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mt-3">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant Database Lookup</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5 text-blue-400" /> Zero Personal Data Exposure in QR</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats Banner */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-navy-900 font-mono">100%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Anti-Tamper Record</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-navy-900 font-mono">&lt; 150ms</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Real-Time Validation</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-navy-900 font-mono">100%</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Free Public Verification</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-navy-900 font-mono">SHA-256</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mt-1">Cryptographic Defense</p>
            </div>
          </div>
        </div>
      </section>

      {/* How TerAuth Works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              System Architecture Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-3">How TerAuth Works</h2>
            <p className="text-sm text-slate-600 mt-2">
              From accredited institution issuance to instant public verification in three cryptographically guarded steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold text-lg mb-5 border border-blue-100">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Institutional Issuance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Accredited universities register on the platform. Once approved by the Super Admin, administrators issue credentials with cryptographically generated non-colliding IDs.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-extrabold text-lg mb-5 border border-indigo-100">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Secure Reference QR</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                TerAuth generates a high-density QR code embedding strictly the verification URL. Sensitive student PII is never exposed inside the QR matrix.
              </p>
            </div>

            <div className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm relative">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold text-lg mb-5 border border-emerald-100">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Validation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Verifiers scan the QR code or type the ID. The TerAuth server queries the live database and returns instant VALID, REVOKED, or INVALID status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* For Institutions & Verifiers split section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: For Institutions */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>For Educational Institutions</span>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">
                Modernize Your Credential Issuance With Full Audit Control
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Eliminate paper document fraud. Issue authentic verifiable credentials with digital seals, revoke compromised records with published justifications, and review real-time verification logs.
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Centralized digital register with unique collision-free serials</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Immediate credential revocation capability with audit trails</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Print-ready ornate certificate preview with embedded QR code</span>
                </li>
              </ul>
              <div className="pt-2">
                <Link
                  to="/register-institution"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy-900 text-white text-sm font-semibold hover:bg-navy-800 transition-colors shadow-sm"
                >
                  <span>Apply for Institutional Accreditation</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right: Security Highlight Card */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-xl space-y-6">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center border border-blue-500/30">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">Why Real-Time Server Verification Matters</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Static certificates or simple offline QR codes can easily be counterfeited, modified, or forged.
                TerAuth mandates that all verification queries resolve directly against our live database:
              </p>
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400">STATUS: ACTIVE</span>
                  <span className="text-slate-400">Live DB Validation = VALID</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-rose-400">STATUS: REVOKED</span>
                  <span className="text-slate-400">Old QR Immediately Blocked</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400">STATUS: UNREGISTERED</span>
                  <span className="text-slate-400">Fake ID = NOT FOUND</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-700 to-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl font-extrabold">Ready to Verify an Academic Credential?</h2>
          <p className="text-sm text-blue-100 max-w-xl mx-auto">
            TerAuth requires no account for public verification. Simply enter a Certificate ID or scan the QR code.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/verify"
              className="px-6 py-3 bg-white text-navy-900 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg"
            >
              Verify a Certificate
            </Link>
            <Link
              to="/register-institution"
              className="px-6 py-3 bg-blue-800/60 border border-blue-400/40 text-white text-sm font-semibold rounded-xl hover:bg-blue-800 transition-colors"
            >
              Register New Institution
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
