import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Users,
  Award,
  FileCheck2,
  PlusCircle,
  School,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const superAdminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/institutions', label: 'Institutions', icon: Building2 },
    { to: '/admin/certificates', label: 'Certificates', icon: Award },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/verifications', label: 'Audit Logs', icon: FileCheck2 },
  ];

  const institutionLinks = [
    { to: '/institution/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/institution/certificates', label: 'My Certificates', icon: Award },
    { to: '/institution/certificates/create', label: 'Issue Certificate', icon: PlusCircle },
    { to: '/institution/verifications', label: 'Verification Logs', icon: FileCheck2 },
    { to: '/institution/profile', label: 'Institution Profile', icon: School },
  ];

  const links = isSuperAdmin ? superAdminLinks : institutionLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800">
      {/* Brand / Role header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white tracking-wide">
              {isSuperAdmin ? 'TERAUTH ADMIN' : 'INSTITUTION PORTAL'}
            </h2>
            <p className="text-[11px] text-slate-400 truncate max-w-[170px]">
              {isSuperAdmin ? 'National Control Center' : user?.institution?.name || 'Institution Hub'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 p-3 space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('dashboard')}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800">
          <a
            href="/verify"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2 text-xs text-slate-400 hover:text-blue-400 hover:bg-slate-800/40 rounded-lg transition-colors"
          >
            <span>Public Verify Tool</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </nav>

      {/* User info & Logout */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
