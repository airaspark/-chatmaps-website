import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Mail, Lock, AlertCircle, ArrowRight, Check } from 'lucide-react';

export const CustomerLogin: React.FC = () => {
  const { loginWithEmail, loginWithGoogle, resetPassword, googleAuthError, clearGoogleAuthError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (googleAuthError) {
      setError(googleAuthError);
      clearGoogleAuthError();
    }
  }, [googleAuthError, clearGoogleAuthError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await loginWithEmail(email, password, 'customer');
      navigate('/customer/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const profile = await loginWithGoogle('customer');
      if (!profile) return;
      navigate(profile.role === 'vendor' ? '/vendor/dashboard' : profile.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    try {
      await resetPassword(resetEmail);
      setResetSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Could not send reset link.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-stone-50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200/90 p-8 sm:p-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-2xl text-stone-900">
              Chat<span className="text-orange-600">Maps</span>
            </span>
          </Link>
          <h2 className="text-xl font-extrabold text-stone-900">
            Customer Login
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Discover and review street food gems near you
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs transition active:scale-95 shadow-2xs"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-stone-200" />
          <span className="bg-white px-3 text-[11px] font-bold uppercase text-stone-400 absolute">
            Or with email
          </span>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-stone-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setShowForgotModal(true);
                }}
                className="text-[11px] font-semibold text-orange-600 hover:text-orange-700"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In as Customer'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 text-center space-y-2 border-t border-stone-100">
          <p className="text-xs text-stone-500">
            Don't have an account?{' '}
            <Link to="/customer/register" className="text-orange-600 font-bold hover:underline">
              Register as Customer
            </Link>
          </p>
          <p className="text-xs text-stone-400">
            Are you a food vendor?{' '}
            <Link to="/vendor/login" className="text-stone-700 font-bold hover:text-orange-600">
              Vendor Portal
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1">Reset Password</h3>
            <p className="text-xs text-stone-500 mb-4">
              Enter your email and we'll send you instructions to reset your password.
            </p>

            {resetSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold mb-4 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Password reset link sent! Check your inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-medium outline-none focus:border-orange-500"
                />
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 bg-orange-600 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <button
              onClick={() => {
                setShowForgotModal(false);
                setResetSuccess(false);
              }}
              className="mt-3 w-full py-2 bg-stone-100 text-stone-700 text-xs font-semibold rounded-xl hover:bg-stone-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
