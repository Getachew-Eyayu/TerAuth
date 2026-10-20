import React from 'react';
import { FileText, ShieldAlert, Award, AlertCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
            <p className="text-xs text-slate-500">Effective: October 2026</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-sm leading-relaxed space-y-6 text-slate-700">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" /> 1. Platform Purpose & Authority
            </h2>
            <p>
              TerAuth provides centralized cryptographic verification of academic certificates. Issuance of credentials is restricted strictly to verified administrative personnel of accredited educational bodies. Unauthorized issuance or misrepresentation constitutes credential fraud.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600" /> 2. Acceptable Use & Rate Limiting
            </h2>
            <p>
              Automated high-frequency scraping, denial-of-service attempts, or bypass of verification rate limiters is strictly forbidden. The platform applies IP rate limiting and telemetry tracking on public verification endpoints to prevent enumeration attacks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" /> 3. Academic Capstone & Scope Notice
            </h2>
            <p>
              This software deployment demonstrates secure digital credential lifecycle management. While using production-ready cryptographic protocols, data records within test environments reflect demonstration seed catalogs unless linked to an accredited registry authority.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Limitation of Liability</h2>
            <p>
              The platform serves as an anti-tamper ledger verifying records against issuing institutions. Employers and licensing boards are advised to cross-reference official transcripts for legal or regulatory certifications.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
