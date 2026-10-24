import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, CheckCircle, Building2, UserCircle, LogOut, LayoutDashboard, QrCode, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'SUPER_ADMIN') return '/admin/dashboard';
    if (user.role === 'INSTITUTION_ADMIN') return '/institution/dashboard';
    return '/';
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & National Brand */}
          <Link to="/" onClick={closeMobile} className="flex items-center gap-3 group">
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

          {/* Desktop Navigation Links */}
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

          {/* Desktop & Mobile Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="hidden sm:flex items-center gap-3">
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
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/verify"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
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

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <Link
              to="/"
              onClick={closeMobile}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === '/' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              Overview
            </Link>
            <Link
              to="/verify"
              onClick={closeMobile}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname.startsWith('/verify') ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span>Verify Certificate</span>
            </Link>
            <Link
              to="/register-institution"
              onClick={closeMobile}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                location.pathname === '/register-institution' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>Register Institution</span>
            </Link>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              {isAuthenticated && user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    onClick={closeMobile}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold bg-navy-900 text-white"
                  >
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard ({user.username})</span>
                    </span>
                    <span className="text-[10px] uppercase font-mono bg-blue-500/30 px-2 py-0.5 rounded">
                      {user.role}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/verify"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Verify</span>
                  </Link>
                  <Link
                    to="/login"
                    onClick={closeMobile}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span>Login</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
