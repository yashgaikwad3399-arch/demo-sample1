import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Key,
  Layers,
  Code2,
  Table as TableIcon,
  ShieldCheck,
  Server,
  FileText,
  Copy,
  Check,
  Play,
  Terminal,
  Cpu,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import {
  getDatabaseStatus,
  getDatabaseSchema,
  getDatabaseSampleData,
  testDatabaseConnection,
  initializeDatabase,
} from '../services/api';

export const DatabasePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'sample' | 'sql' | 'verify'>('tables');
  const [sampleSubTab, setSampleSubTab] = useState<'users' | 'java' | 'sql' | 'attempts'>('users');
  const [statusLoading, setStatusLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [sampleData, setSampleData] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);
  const [initResult, setInitResult] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setStatusLoading(true);
    try {
      const [statusRes, schemaRes, sampleRes] = await Promise.all([
        getDatabaseStatus(),
        getDatabaseSchema(),
        getDatabaseSampleData(),
      ]);
      setDbStatus(statusRes);
      setSchemaData(schemaRes);
      setSampleData(sampleRes?.data);
    } catch (err: any) {
      console.error('Failed to fetch db data:', err);
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleTestConnection() {
    setStatusLoading(true);
    try {
      const res = await testDatabaseConnection();
      setTestResult(res);
      await loadAllData();
    } catch (err: any) {
      setTestResult({
        connected: false,
        message: err?.response?.data?.message || err.message,
      });
    } finally {
      setStatusLoading(false);
    }
  }

  async function handleInitialize() {
    setIsInitializing(true);
    try {
      const res = await initializeDatabase();
      setInitResult(res);
      await loadAllData();
    } catch (err: any) {
      setInitResult({
        success: false,
        message: err?.response?.data?.message || err.message,
      });
    } finally {
      setIsInitializing(false);
    }
  }

  function copyToClipboard(text: string, section: string) {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  }

  return (
    <div id="database-page" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
              <Database className="w-3.5 h-3.5" />
              <span>Step 2 - Relational Database Implementation (MySQL)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              MySQL Normalized Database & Data Layer
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Fully normalized Third Normal Form (3NF) relational database schema for the Smart Examination Portal.
              Features salted bcrypt password hashing, question bank partitioning (Java & SQL), session tracking, and constraint enforcement.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="test-conn-btn"
              onClick={handleTestConnection}
              disabled={statusLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${statusLoading ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
            <button
              id="init-db-btn"
              onClick={handleInitialize}
              disabled={isInitializing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow transition disabled:opacity-50"
            >
              <Play className={`w-4 h-4 text-emerald-400 ${isInitializing ? 'animate-spin' : ''}`} />
              <span>Run DB Migration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Diagnostics & Config Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Status Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className={`p-3 rounded-lg ${dbStatus?.connection?.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
            <Server className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">Active Engine</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-900">
                {dbStatus?.databaseStats?.backendEngine || 'MySQL Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {dbStatus?.connection?.connected ? 'Connected to live MySQL daemon' : 'Pool initialized (dual-mode service ready)'}
            </p>
          </div>
        </div>

        {/* Database Config */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">Target DB Config</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {dbStatus?.poolStatus?.config?.database || 'smart_exam_portal'}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {dbStatus?.poolStatus?.config?.host || 'localhost'}:{dbStatus?.poolStatus?.config?.port || 3306}
            </span>
          </div>
        </div>

        {/* Tables & Relations */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">Schema Complexity</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">5 Relational Tables</span>
            <span className="text-xs text-slate-500">Normalized to 3NF standard</span>
          </div>
        </div>

        {/* Security / Passwords */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-500 block uppercase tracking-wider">Password Security</span>
            <span className="text-sm font-bold text-emerald-700 mt-1 block">bcrypt (10 Salt Rounds)</span>
            <span className="text-xs text-slate-500">Zero plaintext storage policy</span>
          </div>
        </div>
      </div>

      {/* Test or Migration Notification if triggered */}
      {testResult && (
        <div className={`p-4 rounded-xl border ${testResult.connected ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
          <div className="flex items-center gap-2 font-semibold text-sm">
            {testResult.connected ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
            <span>Express Database Test Result:</span>
          </div>
          <p className="text-xs mt-1">{testResult.message}</p>
        </div>
      )}

      {initResult && (
        <div className={`p-4 rounded-xl border ${initResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-100 border-slate-300 text-slate-800'}`}>
          <div className="flex items-center gap-2 font-semibold text-sm">
            {initResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <InfoIcon className="w-5 h-5 text-slate-600" />}
            <span>Database Initialization Output:</span>
          </div>
          <p className="text-xs mt-1">{initResult.message}</p>
          {initResult.logs && (
            <ul className="text-xs font-mono mt-2 space-y-1 bg-white/60 p-2.5 rounded border border-slate-200">
              {initResult.logs.map((log: string, idx: number) => (
                <li key={idx}>• {log}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            id="tab-tables-btn"
            onClick={() => setActiveTab('tables')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'tables'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            <span>1. Table Structure & 3NF Schema</span>
          </button>

          <button
            id="tab-sample-btn"
            onClick={() => setActiveTab('sample')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'sample'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>2. Realistic Sample Data</span>
          </button>

          <button
            id="tab-sql-btn"
            onClick={() => setActiveTab('sql')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'sql'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>3. SQL Scripts (DDL & DML)</span>
          </button>

          <button
            id="tab-verify-btn"
            onClick={() => setActiveTab('verify')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
              activeTab === 'verify'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>4. Verification & Express Endpoints</span>
          </button>
        </nav>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: TABLE STRUCTURE & 3NF SCHEMA                     */}
      {/* ======================================================== */}
      {activeTab === 'tables' && (
        <div className="space-y-8">
          {/* ERD Diagram Summary */}
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Entity-Relationship (ER) Architecture</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">users ──(1:N)──&gt; exam_attempts</span>
                <p className="text-slate-500 leading-relaxed">
                  One student can take multiple exam attempts over time.
                  <br />
                  <span className="font-mono text-indigo-600">ON DELETE CASCADE</span> (removing a candidate removes their history).
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">subjects ──(1:N)──&gt; questions</span>
                <p className="text-slate-500 leading-relaxed">
                  Each subject (Java, SQL) contains a dedicated bank of MCQs.
                  <br />
                  <span className="font-mono text-indigo-600">ON DELETE RESTRICT</span> (protects live exams from syllabus deletion).
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">exam_attempts ──(1:N)──&gt; exam_answers</span>
                <p className="text-slate-500 leading-relaxed">
                  An attempt session links to individual question choices.
                  <br />
                  <span className="font-mono text-indigo-600">UNIQUE(attempt_id, question_id)</span> prevents double answering.
                </p>
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="space-y-6">
            {schemaData?.tables?.map((table: any) => (
              <div key={table.name} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-slate-900 text-base">{table.name}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-700">
                        PK: {table.primaryKey}
                      </span>
                      {table.foreignKeys.length > 0 && (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-100 text-indigo-700">
                          FKs: {table.foreignKeys.join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{table.purpose}</p>
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Relationships: </span>
                    {table.relationships.join(' | ')}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead className="bg-slate-50/40 text-slate-500 text-left font-medium">
                      <tr>
                        <th className="px-6 py-3">Column Name</th>
                        <th className="px-6 py-3">Data Type</th>
                        <th className="px-6 py-3">Constraint / Key</th>
                        <th className="px-6 py-3">Nullable</th>
                        <th className="px-6 py-3">Default</th>
                        <th className="px-6 py-3">Architectural Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
                      {table.columns.map((col: any) => (
                        <tr key={col.name} className="hover:bg-slate-50/60 transition">
                          <td className="px-6 py-2.5 font-mono font-medium text-slate-900 flex items-center gap-1.5">
                            {col.isPrimary && <Key className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                            {col.isForeign && <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />}
                            <span>{col.name}</span>
                          </td>
                          <td className="px-6 py-2.5 font-mono text-blue-600">{col.type}</td>
                          <td className="px-6 py-2.5">
                            {col.isPrimary && <span className="text-amber-700 font-semibold">PRIMARY KEY</span>}
                            {col.isForeign && <span className="text-indigo-700 font-semibold">{col.foreignReference}</span>}
                            {col.isUnique && <span className="text-emerald-700 font-semibold">UNIQUE</span>}
                            {!col.isPrimary && !col.isForeign && !col.isUnique && <span className="text-slate-400">-</span>}
                          </td>
                          <td className="px-6 py-2.5">
                            {col.isNullable ? (
                              <span className="text-slate-500">NULL</span>
                            ) : (
                              <span className="text-rose-600 font-medium">NOT NULL</span>
                            )}
                          </td>
                          <td className="px-6 py-2.5 font-mono text-slate-500">{col.defaultValue || 'None'}</td>
                          <td className="px-6 py-2.5 text-slate-600">{col.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: REALISTIC SAMPLE DATA                            */}
      {/* ======================================================== */}
      {activeTab === 'sample' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setSampleSubTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                sampleSubTab === 'users' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Users &amp; Admin (Bcrypt Encrypted)
            </button>
            <button
              onClick={() => setSampleSubTab('java')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                sampleSubTab === 'java' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Java Question Bank (5 MCQs)
            </button>
            <button
              onClick={() => setSampleSubTab('sql')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                sampleSubTab === 'sql' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              SQL Question Bank (5 MCQs)
            </button>
            <button
              onClick={() => setSampleSubTab('attempts')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                sampleSubTab === 'attempts' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Exam Attempts &amp; Results
            </button>
          </div>

          {/* Subtab: Users */}
          {sampleSubTab === 'users' && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="text-sm font-bold text-slate-900">Registered Users (Admin + Students)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Notice that the <code className="text-rose-600">password_hash</code> column stores 60-character bcrypt hashes (starting with $2b$10$). Plaintext passwords like "Admin@123" are NEVER stored.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-left font-medium">
                    <tr>
                      <th className="px-4 py-3">ID</th>
                      <th className="px-4 py-3">Full Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Password Hash (bcrypt)</th>
                      <th className="px-4 py-3">Default Password</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sampleData?.users?.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono text-slate-500">{u.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600">{u.roll_number || 'N/A (Admin)'}</td>
                        <td className="px-4 py-3 text-slate-700">{u.email}</td>
                        <td className="px-4 py-3 font-mono text-[11px] text-emerald-700 bg-emerald-50/50 max-w-xs truncate">
                          {u.password_hash}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">
                          {u.role === 'ADMIN' ? 'Admin@123' : 'Student@123'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab: Java Questions */}
          {sampleSubTab === 'java' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900 text-sm block">Subject 1: Core Java Programming (5 Questions)</span>
                <span className="text-xs text-blue-700">Allocated Duration: 30 minutes | Pass mark: 50%</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {sampleData?.questions
                  ?.filter((q: any) => q.subject_id === 1)
                  .map((q: any, idx: number) => (
                    <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-slate-900 text-sm">{q.question_text}</h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {q.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                            {q.marks} Mark
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className={`p-2.5 rounded-lg border ${q.correct_option === 'A' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                          A) {q.option_a}
                        </div>
                        <div className={`p-2.5 rounded-lg border ${q.correct_option === 'B' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                          B) {q.option_b}
                        </div>
                        <div className={`p-2.5 rounded-lg border ${q.correct_option === 'C' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                          C) {q.option_c}
                        </div>
                        <div className={`p-2.5 rounded-lg border ${q.correct_option === 'D' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                          D) {q.option_d}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100 flex items-start gap-2">
                        <span className="font-bold text-slate-700 shrink-0">Correct Key: Option {q.correct_option}</span>
                        <span className="text-slate-500">— {q.explanation}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Subtab: SQL Questions */}
          {sampleSubTab === 'sql' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="font-bold text-indigo-900 text-sm block">Subject 2: Database Management Systems (SQL) (5 Questions)</span>
                <span className="text-xs text-indigo-700">Allocated Duration: 30 minutes | Pass mark: 50%</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {sampleData?.questions
                  ?.filter((q: any) => q.subject_id === 2)
                  .map((q: any, idx: number) => (
                    <div key={q.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <h4 className="font-semibold text-slate-900 text-sm">{q.question_text}</h4>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {q.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                            {q.marks} Mark
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className={`p-2.5 rounded-lg border ${q.correct_option === 'A' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                          A) {q.option_a}
                        </div>
                        <div className={`p-2.5 rounded-lg border ${q.correct_option === 'B' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                          B) {q.option_b}
                        </div>
                        <div className={`p-2.5 rounded-lg border ${q.correct_option === 'C' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                          C) {q.option_c}
                        </div>
                        <div className={`p-2.5 rounded-lg border ${q.correct_option === 'D' ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900' : 'bg-slate-50 border-slate-200'}`}>
                          D) {q.option_d}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-lg text-xs border border-slate-100 flex items-start gap-2">
                        <span className="font-bold text-slate-700 shrink-0">Correct Key: Option {q.correct_option}</span>
                        <span className="text-slate-500">— {q.explanation}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Subtab: Attempts */}
          {sampleSubTab === 'attempts' && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Sample Candidate Exam Attempts</h3>
                  <p className="text-xs text-slate-500">Demonstrating 1:N relational links between users, subjects, attempts, and answers.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-left font-medium">
                    <tr>
                      <th className="px-4 py-3">Attempt ID</th>
                      <th className="px-4 py-3">Student Name</th>
                      <th className="px-4 py-3">Roll Number</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Total Qs</th>
                      <th className="px-4 py-3">Correct</th>
                      <th className="px-4 py-3">Score / Max</th>
                      <th className="px-4 py-3">Percentage</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sampleData?.attempts?.map((att: any) => (
                      <tr key={att.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-blue-600">#{att.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{att.student_name}</td>
                        <td className="px-4 py-3 font-mono text-slate-600">{att.roll_number}</td>
                        <td className="px-4 py-3">{att.subject_name}</td>
                        <td className="px-4 py-3">{att.total_questions}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">{att.correct_answers}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{att.score} / {att.total_marks}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            {att.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                            {att.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SQL SCRIPTS (DDL & DML)                          */}
      {/* ======================================================== */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-blue-400 font-bold block">FILE: /database/schema.sql</span>
                <span className="text-xs text-slate-300">Data Definition Language (DDL) for 5 normalized tables</span>
              </div>
              <button
                onClick={() => copyToClipboard(SQL_SCHEMA_SCRIPT, 'schema')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
              >
                {copiedSection === 'schema' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'schema' ? 'Copied' : 'Copy DDL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-96">
              {SQL_SCHEMA_SCRIPT}
            </pre>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="font-mono text-xs text-emerald-400 font-bold block">FILE: /database/seeds.sql</span>
                <span className="text-xs text-slate-300">Data Manipulation Language (DML) for Admin, Students, Java & SQL MCQs</span>
              </div>
              <button
                onClick={() => copyToClipboard(SQL_SEEDS_SCRIPT, 'seeds')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
              >
                {copiedSection === 'seeds' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'seeds' ? 'Copied' : 'Copy Seeds'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto max-h-96">
              {SQL_SEEDS_SCRIPT}
            </pre>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: VERIFICATION & EXPRESS ENDPOINTS                 */}
      {/* ======================================================== */}
      {activeTab === 'verify' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>How to Verify the MySQL Database &amp; Express Connection</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Smart Examination Portal integrates an Express REST API backend using <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">mysql2/promise</code> connection pools and environment variables. You can verify the database in multiple ways:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Method 1: Live Express REST API Endpoints</span>
                <ul className="space-y-1.5 text-slate-600">
                  <li>
                    <a href="/api/database/status" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono">
                      GET /api/database/status
                    </a>
                    <span className="block text-slate-500">Pings MySQL connection pool and returns pool metrics</span>
                  </li>
                  <li>
                    <a href="/api/database/schema" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono">
                      GET /api/database/schema
                    </a>
                    <span className="block text-slate-500">Returns JSON schema metadata for all 5 normalized tables</span>
                  </li>
                  <li>
                    <a href="/api/database/sample-data" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono">
                      GET /api/database/sample-data
                    </a>
                    <span className="block text-slate-500">Retrieves users, questions, and attempt relations</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Method 2: MySQL CLI / Workbench Verification</span>
                <p className="text-slate-600">Log in with standard MySQL client using the configured credentials:</p>
                <div className="p-2.5 bg-slate-900 text-slate-200 rounded font-mono text-[11px] space-y-1">
                  <div>mysql -h localhost -P 3306 -u root -p</div>
                  <div className="text-slate-400"># Verify database creation:</div>
                  <div>SHOW DATABASES LIKE 'smart_exam_portal';</div>
                  <div>USE smart_exam_portal;</div>
                  <div>SHOW TABLES;</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <span className="font-bold text-slate-900 text-xs block">Method 3: Node.js Express Database Connection Code (backend/config/db.ts)</span>
              <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-xs rounded overflow-x-auto">
{`import mysql from 'mysql2/promise';
import { ENV } from './env';

export const pool = mysql.createPool({
  host: ENV.DB.HOST,         // process.env.DB_HOST || 'localhost'
  port: ENV.DB.PORT,         // Number(process.env.DB_PORT) || 3306
  user: ENV.DB.USER,         // process.env.DB_USER || 'root'
  password: ENV.DB.PASSWORD, // process.env.DB_PASSWORD || ''
  database: ENV.DB.NAME,     // process.env.DB_NAME || 'smart_exam_portal'
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function InfoIcon(props: any) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

const SQL_SCHEMA_SCRIPT = `-- ==============================================================================
-- SMART EXAMINATION PORTAL - SCHEMA (MySQL 8.0+)
-- ==============================================================================
CREATE DATABASE IF NOT EXISTS smart_exam_portal;
USE smart_exam_portal;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('STUDENT', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    duration_minutes INT UNSIGNED NOT NULL DEFAULT 30,
    passing_percentage DECIMAL(5,2) NOT NULL DEFAULT 50.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS questions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    subject_id INT UNSIGNED NOT NULL,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
    difficulty ENUM('EASY', 'MEDIUM', 'HARD') NOT NULL DEFAULT 'MEDIUM',
    marks INT UNSIGNED NOT NULL DEFAULT 1,
    explanation TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exam_attempts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    subject_id INT UNSIGNED NOT NULL,
    total_questions INT UNSIGNED NOT NULL DEFAULT 0,
    correct_answers INT UNSIGNED NOT NULL DEFAULT 0,
    score DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    total_marks DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    status ENUM('IN_PROGRESS', 'COMPLETED', 'TIMED_OUT') NOT NULL DEFAULT 'IN_PROGRESS',
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    CONSTRAINT fk_attempts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_attempts_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS exam_answers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    selected_option ENUM('A', 'B', 'C', 'D') NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    marks_awarded DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_answers_attempt FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id),
    UNIQUE KEY uq_attempt_question (attempt_id, question_id)
) ENGINE=InnoDB;`;

const SQL_SEEDS_SCRIPT = `-- ==============================================================================
-- SMART EXAMINATION PORTAL - SAMPLE SEED DATA
-- Passwords hashed using bcrypt (10 rounds):
-- Admin@123   -> $2b$10$y7XEAvQl4B6yjqmqJCkXJuPmxRVIkElivD8XALpgUhDTZKN6YZqge
-- Student@123 -> $2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi
-- ==============================================================================
USE smart_exam_portal;

INSERT INTO subjects (id, code, name, description, duration_minutes, passing_percentage) VALUES
(1, 'JAVA', 'Core Java Programming', 'OOP, Exception Handling, Collections, JVM & Multithreading', 30, 50.00),
(2, 'SQL', 'Database Management Systems (SQL)', 'Relational Algebra, DDL/DML, JOINs, Normalization', 30, 50.00);

INSERT INTO users (id, name, roll_number, email, password_hash, role) VALUES
(1, 'System Administrator', NULL, 'admin@examportal.com', '$2b$10$y7XEAvQl4B6yjqmqJCkXJuPmxRVIkElivD8XALpgUhDTZKN6YZqge', 'ADMIN'),
(2, 'Rahul Sharma', 'IT2026-001', 'rahul.sharma@college.edu', '$2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi', 'STUDENT'),
(3, 'Priya Patel', 'IT2026-002', 'priya.patel@college.edu', '$2b$10$LabnvxR.OL9aaMpXOAHWd.Roi6eoxPW99kvhis1UzAU3cER8.MZbi', 'STUDENT');

-- Java Questions (Sample 1 of 5)
INSERT INTO questions (id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks, explanation) VALUES
(1, 1, 'Which of the following is NOT an Object-Oriented Programming (OOP) principle in Java?', 'Polymorphism', 'Encapsulation', 'Compilation', 'Inheritance', 'C', 'EASY', 1, 'Compilation translates code to bytecode.'),
(2, 1, 'Why are Java Strings immutable in memory?', 'Prevent GC', 'Security, thread-safety, String Pool', 'Static char array', 'No dynamic allocation', 'B', 'MEDIUM', 1, 'Security and String Pool optimization.');

-- SQL Questions (Sample 1 of 5)
INSERT INTO questions (id, subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, marks, explanation) VALUES
(6, 2, 'Which SQL clause is used to filter group-level records after aggregate functions are applied?', 'WHERE', 'HAVING', 'ORDER BY', 'GROUP BY', 'B', 'EASY', 1, 'HAVING filters aggregate groups.'),
(7, 2, 'What is the difference between DELETE and TRUNCATE?', 'DELETE is DDL', 'DELETE is row-by-row DML; TRUNCATE deallocates pages as DDL', 'TRUNCATE only for temp tables', 'DELETE cannot use WHERE', 'B', 'MEDIUM', 1, 'TRUNCATE is DDL page deallocation.');`;
