import React from 'react';
import { Shield, Lock, FileCheck, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-12 pb-8 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">TER<span className="text-blue-400">AUTH</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Secure centralized digital credential authentication platform for academic institutions, licensing bodies, and employers.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded w-fit">
              <Lock className="w-3.5 h-3.5" />
              <span>TLS 1.3 & SHA-256 Validated</span>
            </div>
          </div>

          {/* Column 2: Public Verification */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Verification</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/verify" className="hover:text-white transition-colors">Verify by Certificate ID</Link></li>
              <li><Link to="/verify" className="hover:text-white transition-colors">Camera QR Verification</Link></li>
              <li><Link to="/register-institution" className="hover:text-white transition-colors">Accreditation Registry</Link></li>
            </ul>
          </div>

          {/* Column 3: Institutional Services */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Institutions</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/register-institution" className="hover:text-white transition-colors">Institutional Onboarding</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Administrative Portal</Link></li>
              <li><span className="text-slate-500">API Documentation</span></li>
            </ul>
          </div>

          {/* Column 4: System Architecture Notice */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Academic Project Notice</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              TerAuth is engineered as an academic software engineering capstone system demonstrating secure credential issuance, anti-tamper QR generation, and real-time database validation.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} TerAuth Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <FileCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Cryptographic Identity Protocol</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
