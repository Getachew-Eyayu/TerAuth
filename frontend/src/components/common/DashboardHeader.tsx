import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ExternalLink } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-6 py-3 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Quick Portal Status */}
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 tracking-wide">
            {isSuperAdmin ? 'National Super Admin Workspace' : `${user?.institution?.name || 'Institution Admin'} Portal`}
          </span>
        </div>

        {/* Right: User Status & Prominent Logout Button */}
        <div className="flex items-center gap-3">
          <Link
            to="/verify"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Public Verify</span>
          </Link>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
              {user?.username ? user.username.charAt(0) : 'U'}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-800 leading-tight">{user?.username}</span>
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Prominent High-Contrast Dashboard Logout Button */}
          <button
            onClick={handleLogout}
            title="Sign out of administrative session"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 hover:text-rose-800 rounded-lg transition-colors shadow-xs active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
