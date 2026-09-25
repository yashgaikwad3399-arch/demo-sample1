import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  PlusCircle,
  Users,
  BarChart3,
  HelpCircle,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Lock,
  Loader2,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

export const AdminDashboardPreview: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [adminCheckResult, setAdminCheckResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const handleVerifyAdminAccess = async () => {
    setIsChecking(true);
    try {
      const res = await authService.checkAdminAccess();
      setAdminCheckResult(res);
    } catch (err: any) {
      setAdminCheckResult({ error: err.response?.data || err.message });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Back button and title */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portal Overview</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Control Center</h1>
            <p className="text-sm text-slate-600 mt-1">
              Examination authoring, candidate management, and system administration.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Role: ADMIN</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>RBAC Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Administrator Session Card */}
      {isAuthenticated && user && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Authorized Administrator</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="font-mono text-indigo-700 font-semibold">{user.email}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyAdminAccess}
                disabled={isChecking}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold transition"
              >
                {isChecking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Terminal className="w-3.5 h-3.5" />}
                <span>Test /api/auth/admin-only</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500">Security Clearance</div>
              <div className="font-bold text-slate-900">ROLE: ADMIN</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500">Authentication Protocol</div>
              <div className="font-bold text-indigo-700">HMAC-SHA256 JWT</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500">RBAC Clearance</div>
              <div className="font-bold text-emerald-700">Unrestricted Question Bank</div>
            </div>
          </div>

          {adminCheckResult && (
            <div className="mt-4 p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto">
              <div className="text-[10px] text-slate-400 mb-1">Live Server Response (/api/auth/admin-only):</div>
              <pre>{JSON.stringify(adminCheckResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Notice Banner */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-900 leading-relaxed">
          <strong>Step 3 Complete:</strong> Admin authentication and RBAC middleware are active.
          In <strong>Step 4</strong>, Question Bank CRUD operations (Add MCQ, Edit Options, Set Correct Answer, Difficulty Filtering) will be operational.
        </div>
      </div>

      {/* Admin Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Question Bank */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Question Management</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Maintain the examination question bank. Add new MCQs, edit options A–D, set correct answers, assign difficulties (Easy, Medium, Hard), and allocate marks.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Subject: Java & SQL</span>
            <span className="font-semibold text-indigo-600">CRUD Ready</span>
          </div>
        </div>

        {/* Student Records */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Student Directory</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              View all registered students along with their roll numbers, email addresses, registration dates, total examinations attempted, and average score percentages.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Roster Tracking</span>
            <span className="font-semibold text-indigo-600">Filters & Search</span>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Examination Analytics</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              View comprehensive statistics: pass rates, average marks in Java vs. SQL, highest scores, attempt completion logs, and distribution curves.
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Live Aggregations</span>
            <span className="font-semibold text-indigo-600">Metrics Engine</span>
          </div>
        </div>
      </div>

      {/* Feature Checklist for Admin Portal */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600" />
          <span>Admin Module Capabilities to be Implemented</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Protected Admin Routes</strong>
              Requires role-based authorization: only users with <code className="text-indigo-600 font-semibold">role = 'ADMIN'</code> can access.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Separate Java & SQL Banks</strong>
              Questions are partitioned by normalized subject foreign keys with distinct duration and passing thresholds.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Full Attempt Auditing</strong>
              Admins can inspect individual student answers, start/end timestamps, and score breakdowns.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Real-Time Performance KPIs</strong>
              Aggregations computed via MySQL queries for instantaneous academic oversight.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
