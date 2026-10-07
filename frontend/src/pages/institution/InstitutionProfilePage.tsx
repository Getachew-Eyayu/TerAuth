import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  Award,
  User,
  Key,
} from 'lucide-react';

export const InstitutionProfilePage: React.FC = () => {
  const { user } = useAuth();
  const inst = user?.institution;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institution Profile & Accreditation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Registered organizational credentials, official contact details, and platform authorization status.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-navy-900 text-white flex items-center justify-center shadow-sm">
              <Building2 className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{inst?.name || 'Institution Name'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  {inst?.institutionId || 'INST-CODE'}
                </span>
                <span className="text-xs text-slate-500">• {inst?.type || 'Accredited Institution'}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={inst?.status || 'APPROVED'} size="lg" />
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Official Institutional Email</span>
            </span>
            <p className="font-semibold text-slate-800 text-sm">{inst?.officialEmail || user?.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Institutional Phone Contact</span>
            </span>
            <p className="font-semibold text-slate-800 text-sm">{inst?.contactNumber || '+251 11 123 2411'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              <span>Campus Physical Address</span>
            </span>
            <p className="font-semibold text-slate-800 text-sm">{inst?.address || 'Addis Ababa, Ethiopia'}</p>
          </div>
        </div>

        {/* Administrator Credentials Section */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>Designated Administrator Account</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Username</span>
              <span className="font-mono font-bold text-slate-800">{user?.username}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Role</span>
              <span className="font-semibold text-slate-800 uppercase">{user?.role?.replace('_', ' ')}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px]">Account Status</span>
              <span className="font-semibold text-emerald-600">ACTIVE & AUTHORIZED</span>
            </div>
          </div>
        </div>

        {/* Security & Issuance Privilege Notice */}
        <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Accredited Issuance Authority</span>
            <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
              Your institution is officially verified on TerAuth. Credentials issued under your account are digitally signed, registered in the national directory, and immediately accessible via QR code verification globally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
