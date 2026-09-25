import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Server,
  Database,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Terminal,
  FileCode2,
  Clock,
  Layers,
  Sparkles,
  LogIn,
  UserPlus,
  KeyRound,
} from 'lucide-react';
import { getHealthStatus, getSystemInfo } from '../services/api';
import { HealthStatus, SystemInfo } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';

export const HomePage: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [info, setInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [pingDuration, setPingDuration] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');

  const fetchHealthData = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const [hRes, iRes] = await Promise.all([getHealthStatus(), getSystemInfo()]);
      const end = performance.now();
      setHealth(hRes);
      setInfo(iRes);
      setPingDuration(Math.round(end - start));
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to fetch health status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero / Introduction Banner */}
      <section id="hero-section" className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>STEP 3: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) COMPLETED</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Smart Examination Portal
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
            A comprehensive, role-based online examination web platform supporting separate examination tracks in{' '}
            <strong className="text-slate-900 font-semibold">Core Java</strong> and{' '}
            <strong className="text-slate-900 font-semibold">SQL Databases</strong> with 3NF relational database schema, salted bcrypt authentication, stateless JWT verification, and server-authoritative scoring.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              id="hero-login-btn"
              to="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Login (Student or Admin)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              id="hero-register-btn"
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register Student</span>
            </Link>
            <Link
              id="hero-auth-verify-btn"
              to="/auth-verify"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-sm font-medium transition"
            >
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span>Test JWT & RBAC APIs</span>
            </Link>
            <Link
              id="hero-database-btn"
              to="/database"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-medium transition"
            >
              <Database className="w-4 h-4 text-blue-600" />
              <span>MySQL Database</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Health Check Diagnostic Panel */}
      <section id="health-diagnostic-card" className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <Server className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Backend Server & Database Status</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live telemetry communicated via Axios from Express.js endpoint <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">/api/health</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {lastChecked && (
              <span className="text-xs text-slate-400">
                Checked at: {lastChecked} {pingDuration !== null && `(${pingDuration}ms)`}
              </span>
            )}
            <button
              id="refresh-health-btn"
              onClick={fetchHealthData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping Server</span>
            </button>
          </div>
        </div>

        {loading && !health ? (
          <div className="py-8 text-center text-sm text-slate-500 animate-pulse">
            Connecting to Express.js REST API on port 3000...
          </div>
        ) : health ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            {/* Server Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Express Server</span>
                <StatusBadge status="online" label="ONLINE" />
              </div>
              <div className="text-lg font-bold text-slate-900">Express v4.21</div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Uptime: {health.server.uptimeSeconds}s</span>
              </div>
            </div>

            {/* Node Runtime */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Node Runtime</span>
                <span className="text-xs font-semibold text-slate-600 bg-slate-200/60 px-2 py-0.5 rounded">
                  {health.server.environment}
                </span>
              </div>
              <div className="text-lg font-bold text-slate-900">{health.server.nodeVersion}</div>
              <div className="text-xs text-slate-500 mt-1">Host: 0.0.0.0:3000</div>
            </div>

            {/* Database Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">MySQL Database</span>
                {health.database.status === 'connected' ? (
                  <StatusBadge status="connected" label="CONNECTED" />
                ) : (
                  <StatusBadge status="warning" label="CONFIGURED" />
                )}
              </div>
              <div className="text-sm font-bold text-slate-900 truncate" title={health.database.target}>
                {health.database.target}
              </div>
              <div className="text-xs text-slate-500 mt-1 truncate" title={health.database.details}>
                {health.database.details}
              </div>
            </div>

            {/* API Status */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Active Stage</span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  v{health.api.version}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-900">Step 1 Ready</div>
              <div className="text-xs text-slate-500 mt-1">Ready for JWT & Schemas</div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-rose-600">
            Could not reach backend health endpoint. Ensure Express server is running.
          </div>
        )}
      </section>

      {/* Dual Persona Role Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Portal Card */}
        <div id="student-overview-card" className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                ROLE: STUDENT
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Student Examination Portal</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Designed for final-year candidates to register with Roll Number, select subjects (Core Java or SQL), take timed examinations with question palettes, and receive server-validated scores.
            </p>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Student Registration (Name, Roll Number, Email, Password)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Subject Selection: Java & SQL with dedicated question sets</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Timed exam with Next/Prev navigation & automatic scoring</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Instant scorecard with percentage & historical attempt logs</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <Link
              to="/student"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition"
            >
              <span>View Student Specifications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Admin Portal Card */}
        <div id="admin-overview-card" className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                ROLE: ADMIN
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Administrator Control Center</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Equips academic examiners and administrators with comprehensive CRUD capabilities over questions, student rosters, attempt history inspection, and statistical metrics.
            </p>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Admin Login & Protected Dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Question Bank CRUD (Categorize Java / SQL, set correct option)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Set question difficulty (Easy, Medium, Hard) & marks</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>View registered students, scores, and overall exam analytics</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <Link
              to="/admin"
              className="inline-flex items-center justify-between w-full px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
            >
              <span>View Admin Specifications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Development Roadmap Progress */}
      <section id="roadmap-status-section" className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-lg bg-slate-900 text-white">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Project Development Status</h2>
            <p className="text-xs text-slate-500">Step-by-step implementation plan for the final-year project</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800">STEP 1</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white">
                DONE
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Scaffolding & Layout</div>
            <p className="text-xs text-slate-600 mt-1">
              React + Express server, React Router, Tailwind layout, MySQL pool setup & /api/health.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800">STEP 2</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white">
                DONE
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">MySQL Database & 3NF Schema</div>
            <p className="text-xs text-slate-600 mt-1">
              Normalized schema, bcrypt passwords, question bank tables, exam attempts, seeds, and Express test endpoints.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800">STEP 3</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white">
                DONE
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Authentication & RBAC</div>
            <p className="text-xs text-slate-600 mt-1">
              Candidate registration, bcrypt hashing, login, JWT generation, RBAC middleware, and ProtectedRoute.
            </p>
          </div>

          <div className="p-4 rounded-xl border-2 border-emerald-600 bg-emerald-50/70 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-900">STEP 4</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white">
                DONE
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Student Dashboard & Profile</div>
            <p className="text-xs text-slate-600 mt-1">
              Welcome banner, student metadata, Java & SQL exam cards, latest scores, and MySQL attempt history logs.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-900">STEP 5</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-blue-600 text-white">
                NEXT
              </span>
            </div>
            <div className="font-bold text-slate-900 text-sm">Exam Engine & Question Runner</div>
            <p className="text-xs text-slate-600 mt-1">
              Active test runner, countdown timer, question palette, auto-submission, and server-side score calculation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
