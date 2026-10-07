import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  Award,
  FileCheck2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/dashboard/admin');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleApproveInstitution = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to approve '${name}'?`)) return;
    try {
      await api.patch(`/institutions/${id}/approve`);
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve institution');
    }
  };

  const handleRejectInstitution = async (id: string, name: string) => {
    const reason = window.prompt(`Reason for rejecting '${name}':`, 'Incomplete accreditation credentials');
    if (reason === null) return;
    try {
      await api.patch(`/institutions/${id}/reject`, { reason });
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject institution');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading administrative telemetry...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
        <p className="font-bold">Error loading dashboard</p>
        <p className="mt-1">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, recentInstitutions, recentCertificates, recentLogs } = data || {};
  const pendingList = (recentInstitutions || []).filter((i: any) => i.status === 'PENDING');

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">National Registry Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            System-wide overview of accredited institutions, issued credentials, and verification queries.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Institutions"
          value={metrics?.totalInstitutions || 0}
          subtitle={`${metrics?.approvedInstitutions || 0} Approved`}
          icon={Building2}
          color="blue"
        />
        <StatsCard
          title="Pending Review"
          value={metrics?.pendingInstitutions || 0}
          subtitle="Awaiting Accreditation Review"
          icon={Clock}
          color={metrics?.pendingInstitutions > 0 ? 'amber' : 'slate'}
        />
        <StatsCard
          title="Total Certificates"
          value={metrics?.totalCertificates || 0}
          subtitle={`${metrics?.activeCertificates || 0} Active / ${metrics?.revokedCertificates || 0} Revoked`}
          icon={Award}
          color="emerald"
        />
        <StatsCard
          title="Verifications"
          value={metrics?.totalVerifications || 0}
          subtitle={`${metrics?.validVerifications || 0} Valid Queries`}
          icon={FileCheck2}
          color="slate"
        />
      </div>

      {/* Pending Approvals Review Queue */}
      {pendingList.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <h2 className="font-bold text-sm text-amber-900">Institutions Pending Approval ({pendingList.length})</h2>
                <p className="text-xs text-amber-700">Review and authorize institutions before they can issue credentials.</p>
              </div>
            </div>
            <Link
              to="/admin/institutions"
              className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pendingList.map((inst: any) => (
              <div key={inst.id} className="bg-white p-4 rounded-xl border border-amber-200/70 flex flex-col justify-between shadow-xs">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800 text-sm">{inst.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {inst.institutionId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{inst.officialEmail} • {inst.type}</p>
                </div>
                <div className="flex items-center gap-2 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleApproveInstitution(inst.id, inst.name)}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleRejectInstitution(inst.id, inst.name)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two columns: Recent Certificates & Live Verification Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Certificates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900">Recently Issued Certificates</h2>
            </div>
            <Link to="/admin/certificates" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {(!recentCertificates || recentCertificates.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No certificates registered yet.</p>
            ) : (
              recentCertificates.map((cert: any) => (
                <div
                  key={cert.id}
                  className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <p className="font-bold text-slate-800 truncate">{cert.studentName}</p>
                    <p className="text-slate-500 truncate text-[11px]">{cert.degree}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cert.certificateId}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={cert.status} size="sm" />
                    <p className="text-[10px] text-slate-400 mt-1">{cert.institution?.name}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Verification Audit Stream */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">Recent Verification Queries</h2>
            </div>
            <Link to="/admin/verifications" className="text-xs font-semibold text-blue-600 hover:underline">
              View Audit Logs
            </Link>
          </div>

          <div className="space-y-2">
            {(!recentLogs || recentLogs.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No verification logs recorded.</p>
            ) : (
              recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-mono font-bold text-slate-800">{log.queriedId}</span>
                    {log.certificate && (
                      <span className="text-[11px] text-slate-500 block truncate">
                        {log.certificate.studentName}
                      </span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={log.result} size="sm" />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
