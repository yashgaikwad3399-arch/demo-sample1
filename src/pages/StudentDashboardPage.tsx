import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  BookOpen,
  Clock,
  Award,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  LogOut,
  ChevronRight,
  Database,
  Coffee,
  Hash,
  Mail,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Loader2,
  Code2,
  Play,
  FileText,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/student.service';
import { AvailableExam, ExamHistoryItem } from '../types';

export const StudentDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [exams, setExams] = useState<AvailableExam[]>([]);
  const [history, setHistory] = useState<ExamHistoryItem[]>([]);
  const [latestResult, setLatestResult] = useState<ExamHistoryItem | null>(null);
  const [hasAttempted, setHasAttempted] = useState<boolean>(false);

  // Loading & error states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeExamModal, setActiveExamModal] = useState<AvailableExam | null>(null);

  // Load all student dashboard data concurrently via Axios
  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [examsRes, historyRes, latestRes] = await Promise.all([
        studentService.getAvailableExams(),
        studentService.getExamHistory(),
        studentService.getLatestResult(),
      ]);

      if (examsRes.success) setExams(examsRes.exams);
      if (historyRes.success) setHistory(historyRes.history);
      if (latestRes.success) {
        setHasAttempted(latestRes.hasAttempted);
        setLatestResult(latestRes.latestResult);
      }
    } catch (err: any) {
      console.error('Failed to load student dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch student data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div id="student-dashboard" className="space-y-8 pb-12">
      {/* 1. TOP WELCOME & STUDENT IDENTITY BANNER */}
      <section id="student-welcome-banner" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none opacity-60" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>AUTHENTICATED STUDENT WORKSTATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {getGreeting()}, <span className="text-emerald-700">{user?.name}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Welcome to your examination dashboard. Review your enrolled subjects, inspect previous scorecard telemetry,
              and prepare for upcoming timed tests with instant server evaluation.
            </p>
          </div>

          {/* Student Identity Badges & Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <button
              id="refresh-dashboard-btn"
              onClick={fetchDashboardData}
              disabled={isLoading}
              title="Refresh exam data from MySQL"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="student-logout-btn"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Identity Details Strip */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              {user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Candidate Name</div>
              <div className="text-xs font-bold text-slate-900 truncate">{user?.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Hash className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Roll Number</div>
              <div className="text-xs font-bold text-slate-900 font-mono truncate">
                {user?.roll_number || 'Not Assigned'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] text-slate-500 font-medium">Registered Email</div>
              <div className="text-xs font-bold text-slate-900 font-mono truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Error Alert if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div>
            <strong>Error connecting to Student API:</strong> {error}
          </div>
        </div>
      )}

      {/* 2. LATEST EXAMINATION SCORECARD */}
      <section id="latest-score-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Latest Examination Score</h2>
          </div>
          {latestResult && (
            <span className="text-xs text-slate-500 font-medium">
              Attempted on {new Date(latestResult.startTime).toLocaleDateString()}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Loading latest scorecard from MySQL...</span>
          </div>
        ) : hasAttempted && latestResult ? (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Left Score Breakdown */}
              <div className="flex items-center gap-5">
                <div
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 border ${
                    latestResult.passed
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  <span className="text-2xl font-black leading-none">{latestResult.percentage}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1">
                    {latestResult.passed ? 'PASSED' : 'RETEST'}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        latestResult.subjectCode === 'JAVA'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {latestResult.subjectCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{latestResult.subjectName}</h3>
                  </div>
                  <p className="text-xs text-slate-500">
                    Status: <strong className="text-slate-800 font-semibold">{latestResult.status}</strong> • Benchmark pass threshold: {latestResult.passingPercentage}%
                  </p>
                </div>
              </div>

              {/* Metric Badges */}
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="grid grid-cols-3 gap-3 text-center text-xs w-full sm:w-auto">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-[90px]">
                    <div className="text-[11px] text-slate-500 font-medium">Marks Scored</div>
                    <div className="text-base font-extrabold text-slate-900 mt-0.5">
                      {latestResult.score} / {latestResult.totalMarks}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-[90px]">
                    <div className="text-[11px] text-slate-500 font-medium">Correct MCQs</div>
                    <div className="text-base font-extrabold text-emerald-700 mt-0.5">
                      {latestResult.correctAnswers} / {latestResult.totalQuestions}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 min-w-[90px]">
                    <div className="text-[11px] text-slate-500 font-medium">Evaluation</div>
                    <div className="text-base font-extrabold text-blue-700 mt-0.5 flex items-center justify-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Server</span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/exam/result/${latestResult.id}`}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                >
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>View Full Scorecard</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <div className="text-sm font-bold text-slate-900">No Previous Examination Attempts Found</div>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              You haven't attempted any tests yet. Choose either the Core Java or Database Management track below to test your technical aptitude.
            </p>
          </div>
        )}
      </section>

      {/* 3. AVAILABLE EXAMINATIONS (JAVA & SQL CARDS) */}
      <section id="available-exams-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Available Examination Tracks</h2>
              <p className="text-xs text-slate-500">Select an assessment to begin your timed test</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            {exams.length} Tracks Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.map((exam) => {
            const isJava = exam.code === 'JAVA';
            return (
              <div
                key={exam.id}
                id={`exam-card-${exam.code.toLowerCase()}`}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition"
              >
                {/* Visual Accent */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -mr-8 -mt-8 opacity-40 pointer-events-none transition group-hover:opacity-60 ${
                    isJava ? 'bg-amber-100' : 'bg-indigo-100'
                  }`}
                />

                <div>
                  {/* Subject Tag & Duration */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        isJava
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {isJava ? <Coffee className="w-3.5 h-3.5" /> : <Database className="w-3.5 h-3.5" />}
                      <span>{exam.code} TRACK</span>
                    </span>

                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{exam.durationMinutes} Minutes</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">{exam.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{exam.description}</p>

                  {/* Syllabus / Topic Chips */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {exam.syllabus?.map((topic, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>

                  {/* Spec Grid */}
                  <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Questions</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">{exam.totalQuestions} MCQs</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Total Marks</div>
                      <div className="font-extrabold text-slate-900 mt-0.5">{exam.totalMarks} Pts</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[11px] text-slate-500 font-medium">Pass Threshold</div>
                      <div className="font-extrabold text-emerald-700 mt-0.5">{exam.passingPercentage}%</div>
                    </div>
                  </div>
                </div>

                {/* Start Examination Action Button */}
                <div className="flex items-center gap-2 mt-6">
                  <button
                    id={`info-exam-btn-${exam.code.toLowerCase()}`}
                    onClick={() => setActiveExamModal(exam)}
                    className="px-3.5 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    title="View Exam Specs"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  <Link
                    id={`start-exam-btn-${exam.code.toLowerCase()}`}
                    to={`/exam/instructions/${exam.code}`}
                    className={`flex-1 py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm ${
                      isJava
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Launch {exam.code} Exam</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. PREVIOUS EXAM ATTEMPTS & EXAMINATION HISTORY */}
      <section id="exam-history-section">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Examination History & Performance Logs</h2>
              <p className="text-xs text-slate-500">Record of all completed assessments synchronized with MySQL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              id="view-full-history-btn"
              to="/student/history"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Full History & Filters</span>
            </Link>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {history.length} Records
            </span>
          </div>
        </div>

        {history.length > 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <tr>
                    <th className="px-5 py-3">Exam Subject</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3 text-center">Total Questions</th>
                    <th className="px-5 py-3 text-center">Correct Answers</th>
                    <th className="px-5 py-3 text-center">Incorrect Answers</th>
                    <th className="px-5 py-3 text-center">Score</th>
                    <th className="px-5 py-3 text-center">Percentage</th>
                    <th className="px-5 py-3 text-center">Result Status</th>
                    <th className="px-5 py-3 text-right">View Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((att) => {
                    const isJava = att.subjectCode === 'JAVA';
                    const displaySubject = att.subject || (isJava ? 'Java' : 'SQL');
                    const displayDate = att.date || (att.startTime ? new Date(att.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A');
                    const incorrectCount = att.incorrectAnswers ?? Math.max(0, att.totalQuestions - att.correctAnswers);
                    const scoreDisplay = att.scoreDisplay || `${att.score}/${att.totalMarks}`;
                    const percentageDisplay = att.percentageDisplay || `${att.percentage}%`;
                    const resultStatus = att.resultStatus || (att.passed ? 'Passed' : 'Failed');

                    return (
                      <tr key={att.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                isJava
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-indigo-100 text-indigo-800'
                              }`}
                            >
                              {att.subjectCode}
                            </span>
                            <span className="font-semibold text-slate-900">{displaySubject}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                          {displayDate}
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-800">
                          {att.totalQuestions}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-emerald-700">
                          {att.correctAnswers}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-rose-700">
                          {incorrectCount}
                        </td>
                        <td className="px-5 py-4 text-center font-mono font-bold text-slate-900">
                          {scoreDisplay}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`font-black text-xs ${
                              att.passed ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {percentageDisplay}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              att.passed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.passed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            )}
                            <span>{resultStatus}</span>
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Link
                            to={`/student/history/${att.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold transition shadow-xs"
                          >
                            <span>View Result</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No previous exam attempts recorded for your account.
          </div>
        )}
      </section>

      {/* 5. DATA FLOW & ARCHITECTURAL VERIFICATION PANEL */}
      <section className="bg-slate-900 rounded-2xl p-6 sm:p-8 text-white">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Code2 className="w-4 h-4" />
          <span>Full-Stack Data Flow Architecture (Step 4)</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">
          How Frontend, Express Backend & MySQL Relational Store Communicate
        </h3>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed mb-6">
          This dashboard executes live authenticated requests across four endpoints using Axios with bearer tokens,
          processed by role-authorization middleware, and resolved through normalized relational database queries.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-emerald-400 font-bold mb-1">1. Client / Axios</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              Fetches profile, exams, history, and latest result with <code>Authorization: Bearer &lt;JWT&gt;</code>.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-blue-400 font-bold mb-1">2. Auth & RBAC</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              <code>authenticateToken</code> checks JWT; <code>requireRole('STUDENT')</code> guarantees student isolation.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-amber-400 font-bold mb-1">3. Student Controller</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              <code>student.controller.ts</code> coordinates SQL statements and calculates scores securely.
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
            <div className="text-purple-400 font-bold mb-1">4. MySQL Database</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              Executes JOINs across <code>users</code>, <code>subjects</code>, and <code>exam_attempts</code>.
            </div>
          </div>
        </div>
      </section>

      {/* MODAL: Exam Launch Confirmation (Step 5 Preview) */}
      {activeExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    activeExamModal.code === 'JAVA'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {activeExamModal.code}
                </div>
                <h3 className="text-base font-bold text-slate-900">{activeExamModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveExamModal(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Official Examination Instructions</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 text-[11px]">
                  <li>Total duration: <strong>{activeExamModal.durationMinutes} minutes</strong> with synchronized server countdown.</li>
                  <li>Total questions: <strong>{activeExamModal.totalQuestions} multiple choice questions</strong> (4 options each).</li>
                  <li>Auto-submission will trigger if the timer expires before manual completion.</li>
                  <li>Evaluation is conducted server-side with zero option-leak to prevent cheating.</li>
                </ul>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px] leading-relaxed">
                <strong>Readiness Confirmation:</strong> When you proceed to the instructions page, you will review technical guidelines, system requirements, and scoring policies before commencing the assessment.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setActiveExamModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <Link
                id={`modal-proceed-btn-${activeExamModal.code.toLowerCase()}`}
                to={`/exam/instructions/${activeExamModal.code}`}
                onClick={() => setActiveExamModal(null)}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
              >
                <span>Proceed to Instructions & Exam</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
