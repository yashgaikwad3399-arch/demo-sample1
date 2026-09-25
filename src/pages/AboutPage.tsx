import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Database, ShieldCheck, ArrowLeft, CheckCircle2, Lock, Cpu, Network } from 'lucide-react';

export const AboutPage: React.FC = () => {
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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">System Architecture & Technical Specifications</h1>
        <p className="text-sm text-slate-600 mt-1">
          Complete engineering reference designed for Final-Year Information Technology viva and project defense.
        </p>
      </div>

      {/* High-level Architecture Breakdown */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Three-Tier Architectural Model</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full uppercase">
              Presentation Tier
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-3">React.js Single Page App</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Provides client-side routing via React Router, responsive design via Tailwind CSS, and Axios interceptor for JWT authorization.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full uppercase">
              Application Tier
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-3">Express.js REST API</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Enforces role-based access control (Student vs. Admin), executes secure server-side answer scoring, and eliminates answer leaks.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full uppercase">
              Data Tier
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-3">MySQL Relational Engine</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Structured 3NF schema utilizing foreign keys, connection pooling via mysql2, and parameterized queries to prevent SQL injection.
            </p>
          </div>
        </div>
      </div>

      {/* Database Schema Summary */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-600" />
          <span>Relational Schema (MySQL)</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-semibold">
                <th className="py-2.5 px-3">Table Name</th>
                <th className="py-2.5 px-3">Primary Key</th>
                <th className="py-2.5 px-3">Foreign Keys</th>
                <th className="py-2.5 px-3">Key Attributes</th>
                <th className="py-2.5 px-3">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">users</td>
                <td className="py-2.5 px-3 font-mono text-indigo-600">id</td>
                <td className="py-2.5 px-3 text-slate-400">-</td>
                <td className="py-2.5 px-3">name, roll_number (UK), email (UK), password_hash, role</td>
                <td className="py-2.5 px-3">Stores student and admin credentials</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">subjects</td>
                <td className="py-2.5 px-3 font-mono text-indigo-600">id</td>
                <td className="py-2.5 px-3 text-slate-400">-</td>
                <td className="py-2.5 px-3">code (UK), name, duration_minutes, passing_percentage</td>
                <td className="py-2.5 px-3">Java & SQL exam configuration</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">questions</td>
                <td className="py-2.5 px-3 font-mono text-indigo-600">id</td>
                <td className="py-2.5 px-3 font-mono text-slate-700">subject_id → subjects(id)</td>
                <td className="py-2.5 px-3">question_text, option_a..d, correct_option, difficulty, marks</td>
                <td className="py-2.5 px-3">Question bank with server answer keys</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">exam_attempts</td>
                <td className="py-2.5 px-3 font-mono text-indigo-600">id</td>
                <td className="py-2.5 px-3 font-mono text-slate-700">user_id, subject_id</td>
                <td className="py-2.5 px-3">score, total_marks, percentage, status, start_time, end_time</td>
                <td className="py-2.5 px-3">Student test session records</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-slate-900">exam_answers</td>
                <td className="py-2.5 px-3 font-mono text-indigo-600">id</td>
                <td className="py-2.5 px-3 font-mono text-slate-700">attempt_id, question_id</td>
                <td className="py-2.5 px-3">selected_option, is_correct, marks_awarded</td>
                <td className="py-2.5 px-3">Per-question answer evaluation audit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Principles */}
      <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-rose-600" />
          <span>Security & Integrity Model</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-900 font-bold block text-sm mb-1">Zero-Leak Answer Integrity</strong>
            When exams start, the backend deliberately excludes the <code className="font-semibold text-slate-900">correct_option</code> column from the response payload. The browser never receives answer keys, making client-side inspection in DevTools impossible.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-900 font-bold block text-sm mb-1">Server-Authoritative Evaluation</strong>
            Students submit their selected choices. The Express backend queries the true answers from MySQL, calculates scores and percentages in memory, and writes immutable records to <code className="font-semibold text-slate-900">exam_attempts</code> and <code className="font-semibold text-slate-900">exam_answers</code>.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-900 font-bold block text-sm mb-1">Password Hashing with bcrypt</strong>
            Passwords are never stored in plaintext. They are salted and hashed using 10 rounds of bcrypt prior to insertion into MySQL.
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <strong className="text-slate-900 font-bold block text-sm mb-1">Role-Based Route Protection (RBAC)</strong>
            JSON Web Tokens contain user ID and role claims. Protected admin routes check the token signature and enforce <code className="font-semibold text-slate-900">role === 'ADMIN'</code> before allowing access.
          </div>
        </div>
      </div>
    </div>
  );
};
