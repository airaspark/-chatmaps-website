import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldAlert,
  Mail,
  Lock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { userProfile, role, loginWithEmail, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already authenticated with active admin role, redirect to admin dashboard
  useEffect(() => {
    if (userProfile && (userProfile.role === 'admin' || role === 'admin') && userProfile.status !== 'suspended') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [userProfile, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginWithEmail(email.trim(), password, 'admin');
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Administrator authentication failed. Verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isNonAdminLoggedIn = userProfile && userProfile.role !== 'admin';

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-stone-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-orange-600 selection:text-white">
      {/* Background glow and subtle grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:28px_28px] opacity-10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-600/25 ring-4 ring-orange-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white pt-2">
            ChatMaps Admin Portal
          </h1>
          <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed">
            Restricted access for platform governance, vendor verification, and stall moderation.
          </p>
        </div>

        {/* Warning if logged in as customer or vendor */}
        {isNonAdminLoggedIn && (
          <div className="p-4 bg-amber-950/40 border border-amber-600/40 rounded-2xl text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-300 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Non-Admin Account Detected</span>
            </div>
            <p className="text-stone-300 leading-relaxed">
              You are currently signed in as a <strong className="text-amber-200 capitalize">{userProfile.role}</strong> ({userProfile.email}). Administrative access requires authorized admin credentials.
            </p>
            <button
              onClick={() => logout()}
              className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out to Sign in as Admin</span>
            </button>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 bg-rose-950/60 border border-rose-800/80 text-rose-200 rounded-2xl text-xs font-semibold flex items-start gap-2.5 shadow-lg animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-[#141414] rounded-3xl p-6 sm:p-8 border border-stone-800/90 shadow-2xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-stone-800 text-xs font-bold uppercase tracking-wider text-stone-400">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>Secure Administrator Login</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chatmaps.in"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs sm:text-sm font-semibold text-white outline-none focus:border-orange-500 focus:bg-stone-900 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-stone-900/90 border border-stone-800 text-xs sm:text-sm font-semibold text-white outline-none focus:border-orange-500 focus:bg-stone-900 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-black text-sm shadow-lg shadow-orange-600/30 transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Verifying Admin Access...' : 'Authenticate & Enter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-[11px] text-stone-500">
            <span>Unauthorized access attempts are logged and monitored.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
