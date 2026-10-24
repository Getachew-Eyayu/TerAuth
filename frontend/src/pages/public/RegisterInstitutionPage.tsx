import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Shield, User, Lock, Mail, Phone, MapPin, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export const RegisterInstitutionPage: React.FC = () => {
  const [formData, setFormData] = useState({
    institutionName: '',
    officialEmail: '',
    contactNumber: '',
    address: '',
    institutionType: 'University Institute',
    adminFullName: '',
    adminUsername: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredData, setRegisteredData] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post('/institutions/register', {
        institutionName: formData.institutionName,
        officialEmail: formData.officialEmail,
        contactNumber: formData.contactNumber,
        address: formData.address,
        institutionType: formData.institutionType,
        adminFullName: formData.adminFullName,
        adminUsername: formData.adminUsername,
        adminEmail: formData.adminEmail,
        password: formData.password,
      });

      if (res.data.success) {
        setIsSuccess(true);
        setRegisteredData(res.data.data);
      }
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorList = err.response.data.errors.map((e: any) => e.message).join('. ');
        setError(errorList || err.response?.data?.message || 'Registration failed.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check your inputs.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Institution Onboarding</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Institutional Registration</h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            Register your university, college, or academic organization on TerAuth to issue tamper-proof digital certificates.
          </p>
        </div>

        {/* Success View */}
        {isSuccess ? (
          <div className="bg-white rounded-2xl p-8 border-2 border-emerald-500 shadow-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Registration Submitted</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your institution registration has been submitted and is awaiting administrator approval.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left max-w-md mx-auto text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Institution Code:</span>
                <span className="font-mono font-bold text-slate-900">{registeredData?.institutionId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Institution Name:</span>
                <span className="font-semibold text-slate-900">{registeredData?.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Admin Account:</span>
                <span className="font-mono text-slate-900">{registeredData?.adminUsername}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Current Status:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                  PENDING APPROVAL
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              A Super Administrator will review your accreditation details. Once approved, you can log in to issue certificates.
            </p>

            <div className="flex justify-center gap-3 pt-2">
              <Link
                to="/login"
                className="px-6 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-xl hover:bg-navy-800 transition-colors"
              >
                Go to Login Portal
              </Link>
              <Link
                to="/"
                className="px-6 py-2.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Return to Home
              </Link>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institution Information Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Institutional Details</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Institution Name *
                    </label>
                    <input
                      type="text"
                      name="institutionName"
                      required
                      value={formData.institutionName}
                      onChange={handleChange}
                      placeholder="e.g. Hawassa Institute of Technology"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Institution Email *
                    </label>
                    <input
                      type="email"
                      name="officialEmail"
                      required
                      value={formData.officialEmail}
                      onChange={handleChange}
                      placeholder="registrar@institution.edu.et"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Institution Type *
                    </label>
                    <select
                      name="institutionType"
                      value={formData.institutionType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="National University">National University</option>
                      <option value="University Institute">University Institute</option>
                      <option value="Collegiate Institute">Collegiate Institute</option>
                      <option value="Vocational College">Vocational College</option>
                      <option value="Professional Licensing Board">Professional Licensing Board</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Official Contact Phone
                    </label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="+251 11 ..."
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campus Physical Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="City, Region, Campus Address"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Administrator Account Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-100 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>2. Designate Primary Administrator Account</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Administrator Full Name *
                    </label>
                    <input
                      type="text"
                      name="adminFullName"
                      required
                      value={formData.adminFullName}
                      onChange={handleChange}
                      placeholder="e.g. Dr. Solomon Tesfaye"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Desired Admin Username *
                    </label>
                    <input
                      type="text"
                      name="adminUsername"
                      required
                      value={formData.adminUsername}
                      onChange={handleChange}
                      placeholder="e.g. hit_admin"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Admin Contact Email *
                    </label>
                    <input
                      type="email"
                      name="adminEmail"
                      required
                      value={formData.adminEmail}
                      onChange={handleChange}
                      placeholder="solomon@institution.edu.et"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Account Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 characters"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                By submitting this form, you affirm that you represent an accredited educational or licensing institution authorized to issue credentials. All applications undergo verification before certificate issuing permissions are granted.
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                <span>Submit Institutional Application</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
