import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, CheckCircle, Building2, UserCircle, LogOut, LayoutDashboard, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'SUPER_ADMIN') return '/admin/dashboard';
    if (user.role === 'INSTITUTION_ADMIN') return '/institution/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & National Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-md shadow-navy-900/20 group-hover:bg-blue-700 transition-colors">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">TER<span className="text-blue-600">AUTH</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Official</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">National Digital Certificate Registry</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-blue-600 bg-blue-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/verify"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                location.pathname.startsWith('/verify') ? 'text-blue-600 bg-blue-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Verify Certificate</span>
            </Link>
            <Link
              to="/register-institution"
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                location.pathname === '/register-institution' ? 'text-blue-600 bg-blue-50/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Register Institution</span>
            </Link>
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition-colors shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">{user.username}</span>
                  <span className="text-[10px] text-slate-500 font-medium uppercase">{user.role.replace('_', ' ')}</span>
                </div>

                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/verify"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Quick Verify</span>
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>Portal Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
