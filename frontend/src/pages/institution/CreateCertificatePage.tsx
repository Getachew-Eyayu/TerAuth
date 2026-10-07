import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Award,
  Calendar,
  Building2,
  User,
  GraduationCap,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  QrCode,
} from 'lucide-react';

export const CreateCertificatePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: '',
    degree: '',
    department: '',
    issueDate: new Date().toISOString().split('T')[0],
    studentIdNumber: '',
    gradeOrDistinction: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.studentName.trim() || !formData.degree.trim() || !formData.department.trim()) {
      setError('Please fill out all required academic credential fields.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        studentName: formData.studentName.trim(),
        degree: formData.degree.trim(),
        department: formData.department.trim(),
        issueDate: formData.issueDate,
        metadata: {
          studentId: formData.studentIdNumber.trim() || undefined,
          distinction: formData.gradeOrDistinction.trim() || undefined,
        },
      };

      const res = await api.post('/certificates', payload);
      if (res.data.success && res.data.data) {
        // Navigate to the newly created certificate details
        navigate(`/institution/certificates/${res.data.data.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to issue certificate. Please check input.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/institution/certificates" className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Certificates</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Issue New Credential</span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Issue Academic Certificate</h1>
          <p className="text-xs text-slate-500 mt-1">
            Confer an official degree or qualification record. TerAuth will generate a cryptographically unique Certificate ID and anti-tamper QR code.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Issuing Institution (Fixed) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-navy-900 text-white flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Conferring Institution
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {user?.institution?.name || 'Authorized Institution'}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded">
              {user?.institution?.institutionId || 'INST-ID'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Student Full Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Name (as printed on credential) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="studentName"
                  required
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="e.g. Bethlehem Tesfaye Haile"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Degree / Qualification */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree / Qualification Title *
              </label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="degree"
                  required
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. Bachelor of Science in Software Engineering"
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>
            </div>

            {/* Department / Field of Study */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department / Faculty / Field of Study *
              </label>
              <input
                type="text"
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. School of Electrical & Computer Engineering"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date of Issue */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Conferral / Issue Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  name="issueDate"
                  required
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            {/* Student ID / Institutional Matriculation Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Matriculation No (Optional)
              </label>
              <input
                type="text"
                name="studentIdNumber"
                value={formData.studentIdNumber}
                onChange={handleChange}
                placeholder="e.g. AAU/ET/2022/491"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>

            {/* Academic Distinction / Honors */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Honors / Distinction Level (Optional)
              </label>
              <input
                type="text"
                name="gradeOrDistinction"
                value={formData.gradeOrDistinction}
                onChange={handleChange}
                placeholder="e.g. Very Great Distinction / CGPA 3.85"
                className="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 text-xs text-blue-900">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Cryptographic Security Protocol</span>
              <p className="text-[11px] text-blue-800 leading-relaxed mt-0.5">
                Upon submission, a unique non-sequential Certificate ID (e.g., <code>TER-2026-XXXXXXXX</code>) and anti-tamper QR code pointing to the live server record will be generated. The credential will be immediately verifiable worldwide.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/institution/certificates"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
              <span>Issue & Register Certificate</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
