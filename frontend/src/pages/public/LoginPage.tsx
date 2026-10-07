import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, User, ArrowRight, AlertCircle, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide both username and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { username, password });
      if (res.data.success) {
        const { accessToken, refreshToken, user } = res.data.data;
        login(accessToken, refreshToken, user);

        // Redirect based on role
        if (user.role === 'SUPER_ADMIN') {
          navigate('/admin/dashboard');
        } else if (user.role === 'INSTITUTION_ADMIN') {
          navigate('/institution/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white shadow-md shadow-navy-900/20">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900">
            TER<span className="text-blue-600">AUTH</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-slate-900">Sign in to National Portal</h2>
        <p className="mt-1 text-xs text-slate-500">
          Authorized access for Administrators, Academic Registrars, and Verifiers
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username or Official Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. superadmin or registrar@aait.edu.et"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          {/* Quick Demo Credentials Card */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Academic Demonstration Accounts:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setDemoCredentials('superadmin', 'Admin@12345')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-800 group-hover:text-blue-700">Super Admin</div>
                <div className="text-slate-500 font-mono text-[10px]">superadmin</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('aait_admin', 'Institution@12345')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-800 group-hover:text-blue-700">AAIT University</div>
                <div className="text-slate-500 font-mono text-[10px]">aait_admin</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('nstu_admin', 'Institution@12345')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-800 group-hover:text-blue-700">NSTU University</div>
                <div className="text-slate-500 font-mono text-[10px]">nstu_admin</div>
              </button>

              <button
                type="button"
                onClick={() => setDemoCredentials('hr_director', 'OrgAdmin@12345')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-800 group-hover:text-blue-700">Organization Verifier</div>
                <div className="text-slate-500 font-mono text-[10px]">hr_director</div>
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-500 pt-1">
            New educational institution?{' '}
            <Link to="/register-institution" className="text-blue-600 font-semibold hover:underline">
              Apply for Registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
