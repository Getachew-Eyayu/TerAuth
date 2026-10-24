import React, { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
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
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-screen flex flex-col border-b md:border-b-0 md:border-r border-slate-800 flex-shrink-0">
      {/* Brand / Role header with mobile toggle */}
      <div className="p-4 md:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
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

        {/* Mobile toggle button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation menu (collapsible on mobile, always visible on desktop) */}
      <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block flex-1 p-3 space-y-1`}>
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.endsWith('dashboard')}
              onClick={() => setMobileMenuOpen(false)}
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
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block p-4 border-t border-slate-800 bg-slate-950/40 space-y-3`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase flex-shrink-0">
            {user?.username?.charAt(0) || 'U'}
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.username}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Sign out of administrative session"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-600/90 rounded-lg border border-rose-900/50 transition-colors shadow-xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
