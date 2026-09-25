import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  User,
  Hash,
  Mail,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

export const StudentDashboardPreview: React.FC = () => {
  const { user, isAuthenticated, token } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [isFetchingProfile, setIsFetchingProfile] = useState<boolean>(false);

  const handleFetchProfile = async () => {
    setIsFetchingProfile(true);
    try {
      const res = await authService.getProfile();
      setProfileData(res);
    } catch (err: any) {
      setProfileData({ error: err.message });
    } finally {
      setIsFetchingProfile(false);
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
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Student Examination Portal</h1>
            <p className="text-sm text-slate-600 mt-1">
              Candidate test workstation for Core Java and SQL examinations with server-authenticated scoring.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>Role: STUDENT</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              <KeyRound className="w-3.5 h-3.5" />
              <span>JWT Verified</span>
            </span>
          </div>
        </div>
      </div>

      {/* Candidate Session Card */}
      {isAuthenticated && user && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span>Verified Candidate</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="font-mono text-emerald-700 font-semibold">{user.role}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleFetchProfile}
                disabled={isFetchingProfile}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                {isFetchingProfile ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <User className="w-3.5 h-3.5" />}
                <span>Fetch /api/auth/profile</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Hash className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-[11px] text-slate-500">Hall Ticket / Roll No</div>
                <div className="font-bold text-slate-900 font-mono">{user.roll_number || 'Not Registered'}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <div className="text-[11px] text-slate-500">Registered Email</div>
                <div className="font-bold text-slate-900 truncate max-w-[180px]">{user.email}</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[11px] text-slate-500">Security Clearance</div>
                <div className="font-bold text-emerald-700">JWT Bearer Active</div>
              </div>
            </div>
          </div>

          {profileData && (
            <div className="mt-4 p-3 bg-slate-900 rounded-xl text-emerald-400 font-mono text-xs overflow-x-auto">
              <div className="text-[10px] text-slate-400 mb-1">Live Server Response (/api/auth/profile):</div>
              <pre>{JSON.stringify(profileData, null, 2)}</pre>
            </div>
          )}
        </div>
      )}

      {/* Notice Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-900 leading-relaxed">
          <strong>Step 3 Complete:</strong> Authentication & RBAC are active. Your JWT token securely isolates your session.
          In <strong>Step 4</strong>, the exam question palette, countdown timer, auto-submission on timeout, and scorecard generation will be wired.
        </div>
      </div>

      {/* Available Subjects Preview */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Available Examination Tracks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Java Track */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100/70 px-2.5 py-0.5 rounded-full">
                SUBJECT: JAVA
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>30 Minutes</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Core Java Examination</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Covers OOP principles, class inheritance, interfaces, Exception Handling, Collections Framework, and JVM runtime fundamentals.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900">MCQ</div>
                <div className="text-[11px] text-slate-500">Format</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900">4 Options</div>
                <div className="text-[11px] text-slate-500">Per Question</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900">Server Evaluated</div>
                <div className="text-[11px] text-slate-500">Zero Leak</div>
              </div>
            </div>

            <button
              disabled
              className="mt-5 w-full py-2.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              Start Java Exam (Unlocks in Step 4)
            </button>
          </div>

          {/* SQL Track */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 opacity-50 pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/70 px-2.5 py-0.5 rounded-full">
                SUBJECT: SQL
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>30 Minutes</span>
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Database Management & SQL</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Covers DDL, DML, DQL, Relational Algebra, JOINs (INNER, LEFT, RIGHT), Aggregate functions, GROUP BY, and Subqueries.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900">MCQ</div>
                <div className="text-[11px] text-slate-500">Format</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900">4 Options</div>
                <div className="text-[11px] text-slate-500">Per Question</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-50">
                <div className="font-bold text-slate-900">Server Evaluated</div>
                <div className="text-[11px] text-slate-500">Zero Leak</div>
              </div>
            </div>

            <button
              disabled
              className="mt-5 w-full py-2.5 rounded-lg bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed"
            >
              Start SQL Exam (Unlocks in Step 4)
            </button>
          </div>
        </div>
      </div>

      {/* Feature Checklist for Student Portal */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span>Student Module Capabilities to be Implemented</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Student Registration & Auth</strong>
              Captures Full Name, Roll Number, Email, and bcrypt-hashed password.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Examination Instructions & Timer</strong>
              Pre-exam rules followed by a countdown timer with auto-submit on timeout.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Question Palette Navigation</strong>
              Visual numbered grid indicating answered, visited, and unvisited questions.
            </div>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block font-semibold">Scorecard & History Logs</strong>
              Displays score, percentage, correct/incorrect review, and stores attempt in MySQL.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
