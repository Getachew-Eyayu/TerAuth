import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { StatsCard } from '../../components/common/StatsCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Award,
  PlusCircle,
  FileCheck2,
  AlertTriangle,
  RefreshCw,
  QrCode,
  ArrowRight,
  ExternalLink,
  School,
} from 'lucide-react';

export const InstitutionDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/dashboard/institution');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load institution stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading institutional dashboard...</p>
      </div>
    );
  }

  const { institution, metrics, recentCertificates, recentLogs } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {institution?.institutionId || 'INST-PORTAL'}
            </span>
            <StatusBadge status={institution?.status || 'APPROVED'} size="sm" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{institution?.name || 'Institution Hub'}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Issuance Registry & Integrity Verification Management
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/institution/certificates/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue New Certificate</span>
          </Link>
          <button
            onClick={fetchStats}
            className="p-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Issued"
          value={metrics?.totalCertificates || 0}
          subtitle="Conferred Credentials"
          icon={Award}
          color="blue"
        />
        <StatsCard
          title="Active Valid"
          value={metrics?.activeCertificates || 0}
          subtitle="Currently Active in Registry"
          icon={Award}
          color="emerald"
        />
        <StatsCard
          title="Revoked"
          value={metrics?.revokedCertificates || 0}
          subtitle="Invalidated Credentials"
          icon={AlertTriangle}
          color={metrics?.revokedCertificates > 0 ? 'rose' : 'slate'}
        />
        <StatsCard
          title="Verifications"
          value={metrics?.totalVerifications || 0}
          subtitle="Public Verification Inquiries"
          icon={FileCheck2}
          color="slate"
        />
      </div>

      {/* Two columns: Recent Certificates & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Certificates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              <h2 className="font-bold text-sm text-slate-900">Recently Conferred Certificates</h2>
            </div>
            <Link to="/institution/certificates" className="text-xs font-semibold text-blue-600 hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {(!recentCertificates || recentCertificates.length === 0) ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-slate-400">No certificates issued yet.</p>
                <Link
                  to="/institution/certificates/create"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                >
                  <span>Issue your first certificate</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              recentCertificates.map((cert: any) => (
                <Link
                  key={cert.id}
                  to={`/institution/certificates/${cert.id}`}
                  className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-3 text-xs transition-colors block"
                >
                  <div className="truncate">
                    <p className="font-bold text-slate-900 truncate">{cert.studentName}</p>
                    <p className="text-slate-500 truncate text-[11px]">{cert.degree}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{cert.certificateId}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={cert.status} size="sm" />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Verification Activity on our certificates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-sm text-slate-900">Verification Inquiries</h2>
            </div>
            <Link to="/institution/verifications" className="text-xs font-semibold text-blue-600 hover:underline">
              View Activity
            </Link>
          </div>

          <div className="space-y-2">
            {(!recentLogs || recentLogs.length === 0) ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No verification inquiries recorded yet for your credentials.
              </p>
            ) : (
              recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-mono font-bold text-slate-800">{log.certificate?.certificateId || log.queriedId}</span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {log.certificate?.studentName}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <StatusBadge status={log.result} size="sm" />
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {new Date(log.timestamp).toLocaleDateString()}
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
