import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Certificate } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Award,
  Search,
  PlusCircle,
  Eye,
  AlertTriangle,
  Download,
  ExternalLink,
  RefreshCw,
  Printer,
} from 'lucide-react';

export const InstitutionCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/certificates', {
        params: {
          status: statusFilter,
          search: searchTerm,
        },
      });
      if (res.data.success) {
        setCertificates(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load certificates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCertificates();
  };

  const handleRevoke = async (cert: Certificate) => {
    const reason = window.prompt(
      `Specify official reason to REVOKE certificate for '${cert.studentName}':`,
      'Administrative error or academic review determination'
    );
    if (!reason) return;

    try {
      await api.patch(`/certificates/${cert.certificateId}/revoke`, { reason });
      fetchCertificates();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Revocation failed');
    }
  };

  const handleDownloadQR = (cert: Certificate) => {
    const link = document.createElement('a');
    link.href = cert.qrCodeUrl;
    link.download = `QR_${cert.certificateId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Certificate Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered qualifications, degrees, and academic credentials issued by your institution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/institution/certificates/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue Certificate</span>
          </Link>
          <button
            onClick={fetchCertificates}
            className="p-2 text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {['ALL', 'ACTIVE', 'REVOKED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Credentials' : st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student, ID, or degree..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Certificate ID</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Degree / Qualification</th>
                <th className="py-3 px-4">Department / Field</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading certificates...</span>
                  </td>
                </tr>
              ) : certificates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No certificates found.
                  </td>
                </tr>
              ) : (
                certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{cert.certificateId}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{cert.studentName}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{cert.degree}</td>
                    <td className="py-3.5 px-4 text-slate-500">{cert.department}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cert.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/institution/certificates/${cert.id}`}
                          title="View Certificate Sheet & Print"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDownloadQR(cert)}
                          title="Download QR Code PNG"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/verify/${cert.certificateId}`}
                          target="_blank"
                          title="Public Verification View"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {cert.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevoke(cert)}
                            title="Revoke Certificate"
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
