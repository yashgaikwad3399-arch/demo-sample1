import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowUpDown,
  ChevronRight,
  Eye,
  BookOpen,
  Database,
  Search,
  ArrowLeft,
  GraduationCap,
  Play,
  TrendingUp,
  Clock,
  Layers,
  FileCheck,
} from 'lucide-react';
import { studentService, ExamHistoryQueryParams } from '../services/student.service';
import { ExamHistoryItem } from '../types';
import { useAuth } from '../context/AuthContext';

export const ExamHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // History state
  const [history, setHistory] = useState<ExamHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and Sorting state
  const [selectedSubject, setSelectedSubject] = useState<'ALL' | 'JAVA' | 'SQL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [sortOption, setSortOption] = useState<string>('date_desc');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch student history from authenticated API
  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: ExamHistoryQueryParams = {
        subject: selectedSubject !== 'ALL' ? selectedSubject : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        sort: sortOption,
      };

      const res = await studentService.getExamHistory(params);
      if (res.success && Array.isArray(res.history)) {
        setHistory(res.history);
      } else {
        setError('Failed to load examination history records.');
      }
    } catch (err: any) {
      console.error('Fetch history failed:', err);
      setError(err.response?.data?.message || err.message || 'Unable to retrieve your examination records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedSubject, selectedStatus, sortOption]);

  // Client-side text search filter
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter((item) => {
      const subject = (item.subject || item.subjectName || '').toLowerCase();
      const code = (item.subjectCode || '').toLowerCase();
      const date = (item.date || '').toLowerCase();
      const status = (item.resultStatus || item.status || '').toLowerCase();
      const attemptId = String(item.id);
      return (
        subject.includes(q) ||
        code.includes(q) ||
        date.includes(q) ||
        status.includes(q) ||
        attemptId.includes(q)
      );
    });
  }, [history, searchQuery]);

  // Summary statistics calculated strictly for this student
  const stats = useMemo(() => {
    const total = history.length;
    const passedCount = history.filter((h) => h.passed).length;
    const failedCount = total - passedCount;
    const avgPercentage =
      total > 0
        ? Math.round(history.reduce((acc, h) => acc + Number(h.percentage), 0) / total)
        : 0;
    const javaCount = history.filter((h) => h.subjectCode === 'JAVA').length;
    const sqlCount = history.filter((h) => h.subjectCode === 'SQL').length;

    return { total, passedCount, failedCount, avgPercentage, javaCount, sqlCount };
  }, [history]);

  return (
    <div id="exam-history-page" className="space-y-6 pb-12">
      {/* 1. BREADCRUMBS & TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link to="/student" className="hover:text-slate-900 transition flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student Portal</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-900">Examination History</span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
            <span>Candidate: {user?.name || 'Student'}</span>
          </span>
          <button
            id="refresh-history-btn"
            onClick={fetchHistory}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition shadow-sm disabled:opacity-60"
            title="Refresh database records"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. HEADER BANNER */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide uppercase">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Step 7: Examination History System</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              My Examination History & Performance Logs
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl">
              Chronological log of all completed assessments evaluated server-side against MySQL answer keys.
              Only records for candidate <span className="font-semibold text-slate-900">{user?.name}</span> ({user?.roll_number || user?.email}) are accessible.
            </p>
          </div>

          {/* Quick exam launchers */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/exam/instructions/JAVA"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Take Java Exam</span>
            </Link>
            <Link
              to="/exam/instructions/SQL"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Take SQL Exam</span>
            </Link>
          </div>
        </div>

        {/* 3. PERFORMANCE SUMMARY METRIC CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">Total Attempts</span>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-black text-slate-900">{stats.total}</div>
            <span className="text-[11px] text-slate-500">{stats.javaCount} Java / {stats.sqlCount} SQL</span>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center justify-between text-emerald-800 mb-1">
              <span className="text-xs font-medium">Passed Exams</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl font-black text-emerald-900">{stats.passedCount}</div>
            <span className="text-[11px] text-emerald-700">Satisfied passing cut-off</span>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200">
            <div className="flex items-center justify-between text-rose-800 mb-1">
              <span className="text-xs font-medium">Failed / Below Threshold</span>
              <XCircle className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xl font-black text-rose-900">{stats.failedCount}</div>
            <span className="text-[11px] text-rose-700">Can re-attempt anytime</span>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200">
            <div className="flex items-center justify-between text-blue-800 mb-1">
              <span className="text-xs font-medium">Average Performance</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-xl font-black text-blue-900">{stats.avgPercentage}%</div>
            <span className="text-[11px] text-blue-700">Aggregate score across tests</span>
          </div>
        </div>
      </div>

      {/* 4. FILTERING & SORTING CONTROL BAR */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Subject Filter Pills (Java / SQL / All) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Subject:</span>
          </span>
          <button
            id="filter-all-btn"
            onClick={() => setSelectedSubject('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedSubject === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Subjects
          </button>
          <button
            id="filter-java-btn"
            onClick={() => setSelectedSubject('JAVA')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedSubject === 'JAVA'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <span>Java</span>
            {stats.javaCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedSubject === 'JAVA' ? 'bg-amber-700 text-white' : 'bg-amber-200 text-amber-900'}`}>
                {stats.javaCount}
              </span>
            )}
          </button>
          <button
            id="filter-sql-btn"
            onClick={() => setSelectedSubject('SQL')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              selectedSubject === 'SQL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
            }`}
          >
            <span>SQL</span>
            {stats.sqlCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedSubject === 'SQL' ? 'bg-indigo-700 text-white' : 'bg-indigo-200 text-indigo-900'}`}>
                {stats.sqlCount}
              </span>
            )}
          </button>
        </div>

        {/* Right Controls: Status filter, Sort dropdown, and Quick Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <select
              id="status-filter-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASSED">Passed Only</option>
              <option value="FAILED">Failed Only</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              id="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="date_desc">Date: Newest First</option>
              <option value="date_asc">Date: Oldest First</option>
              <option value="percentage_desc">Percentage: High to Low</option>
              <option value="percentage_asc">Percentage: Low to High</option>
              <option value="score_desc">Score: High to Low</option>
              <option value="subject_asc">Subject: A to Z</option>
              <option value="subject_desc">Subject: Z to A</option>
            </select>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>
      </div>

      {/* 5. ERROR STATE */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchHistory} className="underline font-bold hover:text-rose-900">
            Try Again
          </button>
        </div>
      )}

      {/* 6. HISTORY TABLE (DESKTOP & TABLET VIEW) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto" />
            <p className="text-xs font-medium text-slate-500">Querying authenticated candidate history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Examination Attempts Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery || selectedSubject !== 'ALL' || selectedStatus !== 'ALL'
                ? 'No examination records matched your active filter or search terms. Try clearing your filters.'
                : "You haven't attempted any assessments yet. Choose an examination track below to begin."}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              {(searchQuery || selectedSubject !== 'ALL' || selectedStatus !== 'ALL') ? (
                <button
                  onClick={() => {
                    setSelectedSubject('ALL');
                    setSelectedStatus('ALL');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                >
                  Clear All Filters
                </button>
              ) : (
                <>
                  <Link
                    to="/exam/instructions/JAVA"
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition"
                  >
                    Start Java Exam
                  </Link>
                  <Link
                    to="/exam/instructions/SQL"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition"
                  >
                    Start SQL Exam
                  </Link>
                </>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="overflow-x-auto hidden md:block">
              <table id="exam-history-table" className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Exam Subject</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5 text-center">Total Questions</th>
                    <th className="px-5 py-3.5 text-center">Correct Answers</th>
                    <th className="px-5 py-3.5 text-center">Incorrect Answers</th>
                    <th className="px-5 py-3.5 text-center">Score</th>
                    <th className="px-5 py-3.5 text-center">Percentage</th>
                    <th className="px-5 py-3.5 text-center">Result Status</th>
                    <th className="px-5 py-3.5 text-right">View Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.map((att) => {
                    const isJava = att.subjectCode === 'JAVA';
                    const displaySubject = att.subject || (isJava ? 'Java' : 'SQL');
                    const displayDate = att.date || (att.startTime ? new Date(att.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A');
                    const incorrectCount = att.incorrectAnswers ?? Math.max(0, att.totalQuestions - att.correctAnswers);
                    const scoreDisplay = att.scoreDisplay || `${att.score}/${att.totalMarks}`;
                    const percentageDisplay = att.percentageDisplay || `${att.percentage}%`;
                    const resultStatus = att.resultStatus || (att.passed ? 'Passed' : 'Failed');

                    return (
                      <tr
                        key={att.id}
                        id={`history-row-${att.id}`}
                        className="hover:bg-slate-50/75 transition-colors group"
                      >
                        {/* 1. Exam Subject */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-[11px] ${
                                isJava
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {isJava ? 'JV' : 'SQ'}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                <span>{displaySubject}</span>
                                <span className="text-[10px] text-slate-400 font-mono">#{att.id}</span>
                              </div>
                              <div className="text-[11px] text-slate-500">{att.subjectName}</div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Date */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{displayDate}</span>
                          </div>
                        </td>

                        {/* 3. Total Questions */}
                        <td className="px-5 py-4 text-center">
                          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                            {att.totalQuestions}
                          </span>
                        </td>

                        {/* 4. Correct Answers */}
                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                            {att.correctAnswers}
                          </span>
                        </td>

                        {/* 5. Incorrect Answers */}
                        <td className="px-5 py-4 text-center">
                          <span className="font-bold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                            {incorrectCount}
                          </span>
                        </td>

                        {/* 6. Score */}
                        <td className="px-5 py-4 text-center">
                          <span className="font-mono font-bold text-slate-900 text-xs">
                            {scoreDisplay}
                          </span>
                        </td>

                        {/* 7. Percentage */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`font-black text-xs ${
                              att.passed ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {percentageDisplay}
                          </span>
                        </td>

                        {/* 8. Result Status */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              att.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5" />
                            )}
                            <span>{resultStatus}</span>
                          </span>
                        </td>

                        {/* 9. Action: View Result */}
                        <td className="px-5 py-4 text-right">
                          <Link
                            id={`view-result-btn-${att.id}`}
                            to={`/student/history/${att.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
                            title="Inspect detailed question-by-question review"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Result</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredHistory.map((att) => {
                const isJava = att.subjectCode === 'JAVA';
                const displaySubject = att.subject || (isJava ? 'Java' : 'SQL');
                const displayDate = att.date || (att.startTime ? new Date(att.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A');
                const incorrectCount = att.incorrectAnswers ?? Math.max(0, att.totalQuestions - att.correctAnswers);
                const scoreDisplay = att.scoreDisplay || `${att.score}/${att.totalMarks}`;
                const percentageDisplay = att.percentageDisplay || `${att.percentage}%`;
                const resultStatus = att.resultStatus || (att.passed ? 'Passed' : 'Failed');

                return (
                  <div key={att.id} className="p-4 space-y-3">
                    {/* Header: Subject, Date, Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isJava ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {isJava ? 'JV' : 'SQ'}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {displaySubject}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{displayDate}</span>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          att.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{resultStatus}</span>
                      </span>
                    </div>

                    {/* Example row presentation: Java | 10 Sept 2026 | 20 | 16 | 4 | 16/20 | 80% | Passed */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono flex items-center justify-between text-slate-700">
                      <span>{displaySubject}</span>
                      <span className="text-slate-300">|</span>
                      <span>{displayDate}</span>
                      <span className="text-slate-300">|</span>
                      <span title="Total Questions">{att.totalQuestions} Q</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-emerald-700" title="Correct">{att.correctAnswers}✓</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-rose-700" title="Incorrect">{incorrectCount}✗</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-slate-900">{scoreDisplay}</span>
                      <span className="text-slate-300">|</span>
                      <span className="font-bold text-emerald-700">{percentageDisplay}</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-500 font-medium">Total Qs</div>
                        <div className="font-bold text-slate-900">{att.totalQuestions}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900">
                        <div className="text-[10px] text-emerald-700 font-medium">Correct</div>
                        <div className="font-bold">{att.correctAnswers}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-rose-900">
                        <div className="text-[10px] text-rose-700 font-medium">Incorrect</div>
                        <div className="font-bold">{incorrectCount}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-900">
                        <div className="text-[10px] text-blue-700 font-medium">Percentage</div>
                        <div className="font-bold">{percentageDisplay}</div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="pt-1">
                      <Link
                        to={`/student/history/${att.id}`}
                        className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Result Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* 7. BOTTOM BANNER ON AUDIT TRAIL & PRIVACY */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-xs">
          <GraduationCap className="w-4 h-4 text-slate-700" />
        </div>
        <p>
          <span className="font-bold text-slate-900">Data Isolation Guarantee:</span> All examination attempts and scores displayed above are filtered strictly by your authenticated student token (JWT ID #{user?.id}). Cross-student records are restricted by row-level database authorization.
        </p>
      </div>
    </div>
  );
};
