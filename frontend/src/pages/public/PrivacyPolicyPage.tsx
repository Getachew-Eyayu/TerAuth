import React from 'react';
import { Shield, Lock, Eye, Database, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-xs text-slate-500">Last updated: October 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6 text-slate-700">
          <p>
            TerAuth operates as a secure national digital credential authentication and verification platform. This Privacy Policy details how data is collected, handled, and protected when credentials are authenticated or verified through our infrastructure.
          </p>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" /> 1. Data Processed for Verification
            </h2>
            <p>
              When a certificate is queried by its unique cryptographic identifier (`TER-YYYY-XXXXXXXX`) or scanned via QR code, the TerAuth platform performs server-side validation against the accredited issuing institution's records.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Verified student full legal name and conferred qualification.</li>
              <li>Conferral date and accredited academic department.</li>
              <li>Issuing institution identity and real-time accreditation status.</li>
              <li>Credential state (ACTIVE, REVOKED, or INVALID).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" /> 2. Audit & Telemetry Logging
            </h2>
            <p>
              To detect credential fraud and prevent brute-force querying, verification queries record non-reversible telemetry:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Client IP address and requesting user agent for anti-scraping rate limiting.</li>
              <li>Timestamp of verification event and queried identifier.</li>
              <li>Outcome of query (VALID, REVOKED, or INVALID).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" /> 3. Data Protection & Security Controls
            </h2>
            <p>
              TerAuth uses strict encryption in transit (TLS 1.3), hashed authentication credentials (bcrypt salt rounds 12), and role-based access control (RBAC). Student Personally Identifiable Information is never embedded unauthenticated in public QR code pixels.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" /> 4. Institutional Authority & Correction
            </h2>
            <p>
              Academic records are managed exclusively by accredited educational institutions. For data corrections, revocations, or transcript inquiries, verifiers and certificate holders must directly consult the issuing institution's official registrar office.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
