import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Certificate } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Award,
  Search,
  ExternalLink,
  AlertTriangle,
  RefreshCw,
  QrCode,
  Building2,
  Calendar,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);

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
      console.error('Error fetching certificates:', err);
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

  const handleRevoke = async (certId: string, currentStudent: string) => {
    const reason = window.prompt(
      `Specify official reason to REVOKE certificate for '${currentStudent}':`,
      'Administrative revocation'
    );
    if (!reason) return;

    try {
      await api.patch(`/certificates/${certId}/revoke`, { reason });
      fetchCertificates();
      if (selectedCert?.certificateId === certId) {
        setSelectedCert(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Revocation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">National Certificate Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Master register of all issued credentials across all accredited universities and technical institutes.
          </p>
        </div>
        <button
          onClick={fetchCertificates}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
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
              {st === 'ALL' ? 'All Statuses' : st}
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
            Search
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
                <th className="py-3 px-4">Degree / Field</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Conferral Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading certificate records...</span>
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
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{cert.degree}</p>
                      <p className="text-slate-400 text-[11px]">{cert.department}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {cert.institution?.name}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={cert.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/verify/${cert.certificateId}`}
                          target="_blank"
                          title="Open Public Verification"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setSelectedCert(cert)}
                          title="Quick View Record"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {cert.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleRevoke(cert.certificateId, cert.studentName)}
                            title="Revoke Certificate"
                            className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-semibold text-[11px] flex items-center gap-1"
                          >
                            <AlertTriangle className="w-3 h-3" />
                            <span>Revoke</span>
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

      {/* Modal Quick View */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Certificate Record</span>
                <h3 className="text-base font-bold text-slate-900 font-mono">{selectedCert.certificateId}</h3>
              </div>
              <StatusBadge status={selectedCert.status} size="sm" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                <span className="text-base font-bold text-slate-900">{selectedCert.studentName}</span>
                <span className="text-slate-600 block mt-1 font-medium">{selectedCert.degree}</span>
                <span className="text-slate-400 block text-[11px]">{selectedCert.department}</span>
              </div>

              <div className="flex items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-100">
                <img src={selectedCert.qrCodeUrl} alt="QR Code" className="w-32 h-32 object-contain" />
              </div>

              {selectedCert.status === 'REVOKED' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                  <span className="font-bold">Revocation Justification: </span>
                  <span>{selectedCert.revocationReason}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Link
                to={`/verify/${selectedCert.certificateId}`}
                target="_blank"
                className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Verify Page</span>
              </Link>
              <button
                onClick={() => setSelectedCert(null)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
