import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Institution, InstitutionStatus } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import {
  Building2,
  Search,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  PlusCircle,
} from 'lucide-react';

export const AdminInstitutionsPage: React.FC = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedInst, setSelectedInst] = useState<Institution | null>(null);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/institutions', {
        params: {
          status: statusFilter,
          search: searchTerm,
        },
      });
      if (res.data.success) {
        setInstitutions(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching institutions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, [statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInstitutions();
  };

  const handleApprove = async (id: string, name: string) => {
    if (!window.confirm(`Approve accreditation for '${name}'?`)) return;
    try {
      await api.patch(`/institutions/${id}/approve`);
      fetchInstitutions();
      if (selectedInst?.id === id) setSelectedInst(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id: string, name: string) => {
    const reason = window.prompt(`Specify rejection reason for '${name}':`, 'Documentation requirements not satisfied');
    if (reason === null) return;
    try {
      await api.patch(`/institutions/${id}/reject`, { reason });
      fetchInstitutions();
      if (selectedInst?.id === id) setSelectedInst(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleToggleSuspend = async (inst: Institution) => {
    const newStatus = inst.status === 'SUSPENDED' ? 'APPROVED' : 'SUSPENDED';
    const actionLabel = newStatus === 'SUSPENDED' ? 'suspend' : 'reinstate';
    if (!window.confirm(`Are you sure you want to ${actionLabel} '${inst.name}'?`)) return;

    try {
      await api.patch(`/institutions/${inst.id}/status`, { status: newStatus });
      fetchInstitutions();
      if (selectedInst?.id === inst.id) setSelectedInst(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Accredited Institutions</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review institution registration applications and manage institutional authority to issue credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/register-institution"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Register New Institution</span>
          </Link>
          <button
            onClick={fetchInstitutions}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Institutions' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or code..."
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
                <th className="py-3 px-4">Code / ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Certificates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    <span>Loading institutions list...</span>
                  </td>
                </tr>
              ) : institutions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No institutions match the current query.
                  </td>
                </tr>
              ) : (
                institutions.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-700">{inst.institutionId}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{inst.name}</p>
                      <p className="text-slate-400 text-[11px]">{inst.officialEmail}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{inst.type}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {inst.contactNumber || 'Not provided'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {inst._count?.certificates || 0}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={inst.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedInst(inst)}
                          title="View Details"
                          className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {inst.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(inst.id, inst.name)}
                              title="Approve Institution"
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(inst.id, inst.name)}
                              title="Reject Application"
                              className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded font-semibold text-[11px] flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {inst.status === 'APPROVED' && (
                          <button
                            onClick={() => handleToggleSuspend(inst)}
                            title="Suspend Access"
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                          >
                            <ShieldAlert className="w-4 h-4" />
                          </button>
                        )}

                        {inst.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleToggleSuspend(inst)}
                            title="Reinstate Access"
                            className="px-2 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded font-semibold text-[10px]"
                          >
                            Reinstate
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

      {/* Institution Detail Modal */}
      {selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedInst.name}</h3>
                <span className="font-mono text-xs text-slate-500 font-bold">{selectedInst.institutionId}</span>
              </div>
              <StatusBadge status={selectedInst.status} size="sm" />
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{selectedInst.officialEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{selectedInst.contactNumber || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{selectedInst.address || 'No campus address provided'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Registered: {new Date(selectedInst.createdAt).toLocaleDateString()}</span>
              </div>

              {selectedInst.rejectionReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
                  <span className="font-bold">Rejection Note: </span>
                  <span>{selectedInst.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              {selectedInst.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedInst.id, selectedInst.name)}
                    className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                  >
                    Approve Accreditation
                  </button>
                  <button
                    onClick={() => handleReject(selectedInst.id, selectedInst.name)}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100"
                  >
                    Reject Application
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedInst(null)}
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
