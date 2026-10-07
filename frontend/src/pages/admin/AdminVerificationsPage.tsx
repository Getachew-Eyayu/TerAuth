import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { VerificationLog } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  FileCheck2,
  Search,
  RefreshCw,
  Globe,
  Clock,
  Shield,
  Filter,
} from 'lucide-react';

export const AdminVerificationsPage: React.FC = () => {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [resultFilter, setResultFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/verifications', {
        params: {
          result: resultFilter,
          search: searchTerm,
        },
      });
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to load verification logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [resultFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verification Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable telemetry logging every public scan and verification query against the TerAuth ledger.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1">
          {['ALL', 'VALID', 'REVOKED', 'INVALID'].map((res) => (
            <button
              key={res}
              onClick={() => setResultFilter(res)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                resultFilter === res
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {res === 'ALL' ? 'All Outcomes' : res}
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
              placeholder="Search queried ID..."
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
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Queried Certificate</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Issuing Institution</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4">Client Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading audit trail...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No verification records matching query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {log.queriedId}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.certificate?.studentName || '— (Unknown)'}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {log.certificate?.institution?.name || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={log.result} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {log.ipAddress || 'unknown'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[200px]" title={log.userAgent || ''}>
                      {log.userAgent || 'unknown'}
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
