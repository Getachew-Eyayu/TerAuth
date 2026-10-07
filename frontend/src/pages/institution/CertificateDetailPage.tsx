import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Certificate } from '../../types';
import { PrintableCertificate } from '../../components/certificate/PrintableCertificate';
import { ArrowLeft, RefreshCw, AlertTriangle, FileCheck2, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';

export const CertificateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [revokeReason, setRevokeReason] = useState<string>('');
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState<boolean>(false);

  const fetchCertificate = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/certificates/${id}`);
      if (res.data.success) {
        setCertificate(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Certificate not found or unauthorized.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, [id]);

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificate || !revokeReason.trim()) return;

    setIsRevoking(true);
    try {
      const res = await api.patch(`/certificates/${certificate.certificateId}/revoke`, {
        reason: revokeReason.trim(),
      });
      if (res.data.success) {
        setIsRevokeModalOpen(false);
        setRevokeReason('');
        fetchCertificate();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Revocation failed');
    } finally {
      setIsRevoking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Retrieving authenticated credential...</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-4">
        <p className="text-sm font-bold text-slate-900">{error || 'Certificate not found'}</p>
        <Link
          to="/institution/certificates"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Certificates</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/institution/certificates" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Certificates</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-mono font-bold">{certificate.certificateId}</span>
        </div>
      </div>

      {/* Main Printable Certificate Preview */}
      <PrintableCertificate
        certificate={certificate}
        canRevoke={true}
        onRevokeClick={() => setIsRevokeModalOpen(true)}
      />

      {/* Revocation Modal */}
      {isRevokeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center gap-2.5 text-rose-700">
              <div className="w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center border border-rose-200">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Revoke Credential</h3>
                <p className="text-xs text-slate-500">This action will be permanently recorded</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Revoking credential <strong className="font-mono">{certificate.certificateId}</strong> for <strong>{certificate.studentName}</strong> will immediately cause all public QR code scans and inquiries to return <span className="font-bold text-rose-700">REVOKED</span>.
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Revocation Reason *
                </label>
                <textarea
                  rows={3}
                  required
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  placeholder="e.g. Academic integrity committee ruling #2026/04 or administrative duplicate correction"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevokeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRevoking || !revokeReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  {isRevoking ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  <span>Confirm Revocation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
