import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Loader2,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Determine redirect destination from router state or role
  const from = (location.state as any)?.from?.pathname;

  React.useEffect(() => {
    if (isAuthenticated && user) {
      const destination = from || (user.role === 'ADMIN' ? '/admin' : '/student');
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login({ email: email.trim(), password });
      if (res.success && res.user) {
        setSuccessMessage(`Welcome back, ${res.user.name}! Authenticating session...`);
        const destination = from || (res.user.role === 'ADMIN' ? '/admin' : '/student');
        setTimeout(() => {
          navigate(destination, { replace: true });
        }, 800);
      } else {
        setErrorMessage(res.message || 'Invalid email or password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for review & demonstration
  const handleQuickFill = (role: 'STUDENT' | 'ADMIN') => {
    if (role === 'STUDENT') {
      setEmail('rahul.sharma@college.edu');
      setPassword('Student@123');
    } else {
      setEmail('admin@examportal.com');
      setPassword('Admin@123');
    }
    setErrorMessage(null);
  };

  return (
    <div id="login-page" className="max-w-xl mx-auto py-8 sm:py-12">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900 text-white mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Portal Authentication
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your verified credentials to access role-specific exam services.
          </p>
        </div>

        {/* Quick Fill Test Accounts Banner */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Quick Fill Demo Credentials
            </span>
            <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
              MySQL Seed Users
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="quick-fill-student-btn"
              onClick={() => handleQuickFill('STUDENT')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <span>Student Account</span>
            </button>
            <button
              type="button"
              id="quick-fill-admin-btn"
              onClick={() => handleQuickFill('ADMIN')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-700" />
              <span>Admin Account</span>
            </button>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 text-center">
            Student: <code className="font-mono text-slate-700">rahul.sharma@college.edu</code> | Admin: <code className="font-mono text-slate-700">admin@examportal.com</code>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            id="login-error-alert"
            className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 text-sm animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMessage}</div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div
            id="login-success-alert"
            className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 text-sm animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-medium">{successMessage}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="user@examportal.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="submit-login-btn"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-500 text-white font-semibold text-sm shadow-sm transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying with bcrypt & issuing JWT...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600">
          <span>New student candidate?</span>
          <Link id="link-to-register" to="/register" className="text-blue-600 font-semibold hover:underline">
            Register as a Student Candidate
          </Link>
        </div>
      </div>
    </div>
  );
};
