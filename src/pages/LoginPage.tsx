import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AttractiveBackground } from '../components/AttractiveBackground.tsx';
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, KeyRound, Check } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      // Determine destination by email or fetch
      if (email.includes('admin')) {
        onNavigate('admin-dashboard');
      } else if (email.includes('student')) {
        onNavigate('student-dashboard');
      } else {
        onNavigate('faculty-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSelect = async (role: 'FACULTY' | 'ADMIN' | 'STUDENT') => {
    try {
      setLoading(true);
      setError(null);
      await quickDemoLogin(role);
      if (role === 'ADMIN') onNavigate('admin-dashboard');
      else if (role === 'STUDENT') onNavigate('student-dashboard');
      else onNavigate('faculty-dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden bg-slate-950">
      <AttractiveBackground variant="library-hall" />
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-indigo-600/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
          Sign In to Academic Portal
        </h2>
        <p className="mt-1.5 text-xs text-slate-300">
          AI-Powered Early Detection of Student Academic Disengagement
        </p>
      </div>

      <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/30">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Institutional Email
              </label>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. faculty@example.com"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative rounded-md shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Quick Logins */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-3">
              One-Click Demo Credentials
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoSelect('FACULTY')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all text-xs group"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-indigo-600">Faculty / Mentor</div>
                  <div className="text-[10px] text-slate-500 font-mono">faculty@example.com</div>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Quick Log in →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('ADMIN')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-left transition-all text-xs group"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-purple-600">Administrator</div>
                  <div className="text-[10px] text-slate-500 font-mono">admin@example.com</div>
                </div>
                <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                  Quick Log in →
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleDemoSelect('STUDENT')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 text-left transition-all text-xs group"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-emerald-600">Student (Priya Patel, S023)</div>
                  <div className="text-[10px] text-slate-500 font-mono">student@example.com</div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  Quick Log in →
                </span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted JWT & Salting Authentication</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 p-6 text-xs">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <KeyRound className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-sm">Reset Password</h3>
            </div>
            {!resetSent ? (
              <>
                <p className="text-slate-600 mb-4 leading-relaxed">
                  Enter your university email to receive temporary security credentials for your department portal.
                </p>
                <input
                  type="email"
                  defaultValue="faculty@example.com"
                  placeholder="you@edu.example.org"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setForgotModalOpen(false)}
                    className="px-3 py-1.5 border border-slate-300 rounded-md font-semibold text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setResetSent(true)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-md font-semibold"
                  >
                    Send Instructions
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-slate-700 font-semibold">
                  Password reset link dispatched to registered institution mailbox.
                </p>
                <button
                  onClick={() => {
                    setForgotModalOpen(false);
                    setResetSent(false);
                  }}
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-md font-semibold"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
