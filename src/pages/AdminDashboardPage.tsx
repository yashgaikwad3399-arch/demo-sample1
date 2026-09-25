import React, { useState, useEffect, useMemo } from 'react';
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
  Trash2,
  Edit3,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  Calendar,
  XCircle,
  Eye,
  X,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminService,
  AdminOverviewStats,
  AdminQuestionItem,
  AdminStudentItem,
  AdminAttemptItem,
} from '../services/admin.service';
import { SeedQuestion } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Active Tab: 'OVERVIEW' | 'QUESTIONS' | 'STUDENTS' | 'ATTEMPTS'
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'QUESTIONS' | 'STUDENTS' | 'ATTEMPTS'>('OVERVIEW');

  // Overview Data
  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [loadingOverview, setLoadingOverview] = useState<boolean>(true);

  // Questions Data
  const [questions, setQuestions] = useState<AdminQuestionItem[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState<boolean>(false);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<'ALL' | 'JAVA' | 'SQL'>('ALL');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('ALL');
  const [questionSearch, setQuestionSearch] = useState<string>('');

  // Question Modal (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestionItem | null>(null);
  const [formData, setFormData] = useState<{
    subject_id: number;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_option: 'A' | 'B' | 'C' | 'D';
    marks: number;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    explanation: string;
  }>({
    subject_id: 1,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A',
    marks: 1,
    difficulty: 'MEDIUM',
    explanation: '',
  });
  const [formSaving, setFormSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Students Data
  const [students, setStudents] = useState<AdminStudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Attempts Data
  const [attempts, setAttempts] = useState<AdminAttemptItem[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState<boolean>(false);
  const [attemptSubjectFilter, setAttemptSubjectFilter] = useState<'ALL' | 'JAVA' | 'SQL'>('ALL');
  const [attemptStatusFilter, setAttemptStatusFilter] = useState<'ALL' | 'PASSED' | 'FAILED'>('ALL');
  const [attemptSearch, setAttemptSearch] = useState<string>('');

  // Notification Banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch Overview Stats
  const fetchOverview = async () => {
    try {
      setLoadingOverview(true);
      const res = await adminService.getOverview();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error('Fetch admin overview error:', err);
    } finally {
      setLoadingOverview(false);
    }
  };

  // Fetch Questions
  const fetchQuestions = async () => {
    try {
      setLoadingQuestions(true);
      const res = await adminService.getQuestions({
        subject: selectedSubjectFilter !== 'ALL' ? selectedSubjectFilter : undefined,
        difficulty: selectedDifficultyFilter !== 'ALL' ? selectedDifficultyFilter : undefined,
      });
      if (res.success) {
        setQuestions(res.questions);
      }
    } catch (err: any) {
      console.error('Fetch questions error:', err);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Fetch Students
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await adminService.getStudents();
      if (res.success) {
        setStudents(res.students);
      }
    } catch (err: any) {
      console.error('Fetch students error:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Fetch Attempts
  const fetchAttempts = async () => {
    try {
      setLoadingAttempts(true);
      const res = await adminService.getAttempts({
        subject: attemptSubjectFilter !== 'ALL' ? attemptSubjectFilter : undefined,
        status: attemptStatusFilter !== 'ALL' ? attemptStatusFilter : undefined,
      });
      if (res.success) {
        setAttempts(res.attempts);
      }
    } catch (err: any) {
      console.error('Fetch attempts error:', err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'QUESTIONS') {
      fetchQuestions();
    } else if (activeTab === 'STUDENTS') {
      fetchStudents();
    } else if (activeTab === 'ATTEMPTS') {
      fetchAttempts();
    }
  }, [activeTab, selectedSubjectFilter, selectedDifficultyFilter, attemptSubjectFilter, attemptStatusFilter]);

  // Open Modal to Add
  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormData({
      subject_id: selectedSubjectFilter === 'SQL' ? 2 : 1,
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_option: 'A',
      marks: 1,
      difficulty: 'MEDIUM',
      explanation: '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEdit = (q: AdminQuestionItem) => {
    setEditingQuestion(q);
    setFormData({
      subject_id: q.subject_id,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option as any,
      marks: q.marks,
      difficulty: q.difficulty as any,
      explanation: q.explanation || '',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Question (Create or Update)
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_text.trim() || !formData.option_a.trim() || !formData.option_b.trim()) {
      setFormError('Please fill out the question text and options.');
      return;
    }

    try {
      setFormSaving(true);
      setFormError(null);

      if (editingQuestion) {
        // Update
        const res = await adminService.updateQuestion(editingQuestion.id, formData);
        if (res.success) {
          showNotification('success', 'Question updated successfully in database.');
          setIsModalOpen(false);
          fetchQuestions();
          fetchOverview();
        }
      } else {
        // Create
        const res = await adminService.createQuestion(formData);
        if (res.success) {
          showNotification('success', 'New question added to Question Bank.');
          setIsModalOpen(false);
          fetchQuestions();
          fetchOverview();
        }
      }
    } catch (err: any) {
      console.error('Save question error:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to save question.');
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Question
  const handleDeleteQuestion = async (id: number, text: string) => {
    if (!window.confirm(`Are you sure you want to delete question #${id}?\n\n"${text.substring(0, 60)}..."`)) {
      return;
    }

    try {
      const res = await adminService.deleteQuestion(id);
      if (res.success) {
        showNotification('success', `Question #${id} deleted from question bank.`);
        fetchQuestions();
        fetchOverview();
      }
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to delete question.');
    }
  };

  // Delete Attempt
  const handleDeleteAttempt = async (id: number, studentName: string) => {
    if (!window.confirm(`Delete exam attempt #${id} for student ${studentName}?`)) {
      return;
    }

    try {
      const res = await adminService.deleteAttempt(id);
      if (res.success) {
        showNotification('success', `Exam attempt #${id} purged.`);
        fetchAttempts();
        fetchOverview();
      }
    } catch (err: any) {
      showNotification('error', err.response?.data?.message || 'Failed to delete attempt.');
    }
  };

  // Filtered Questions by search query
  const filteredQuestions = useMemo(() => {
    if (!questionSearch.trim()) return questions;
    const q = questionSearch.toLowerCase();
    return questions.filter(
      (item) =>
        item.question_text.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.explanation?.toLowerCase().includes(q) ||
        String(item.id).includes(q)
    );
  }, [questions, questionSearch]);

  // Filtered Students by search query
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );
  }, [students, studentSearch]);

  // Filtered Attempts by search query
  const filteredAttempts = useMemo(() => {
    if (!attemptSearch.trim()) return attempts;
    const q = attemptSearch.toLowerCase();
    return attempts.filter(
      (a) =>
        a.studentName.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.rollNumber.toLowerCase().includes(q) ||
        a.subjectCode.toLowerCase().includes(q) ||
        String(a.id).includes(q)
    );
  }, [attempts, attemptSearch]);

  return (
    <div id="admin-dashboard-page" className="space-y-6 pb-12">
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/" className="hover:text-slate-900 transition flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Portal Home</span>
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-900">Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-indigo-600" />
            <span>Smart Examination Administration</span>
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-bold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin: {user?.name || 'Administrator'}</span>
          </span>
          <button
            onClick={() => {
              fetchOverview();
              if (activeTab === 'QUESTIONS') fetchQuestions();
              if (activeTab === 'STUDENTS') fetchStudents();
              if (activeTab === 'ATTEMPTS') fetchAttempts();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* NOTIFICATION BANNER */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 2. ADMIN NAVIGATION TABS */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200 shadow-xs flex flex-wrap gap-1">
        <button
          id="admin-tab-overview"
          onClick={() => setActiveTab('OVERVIEW')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'OVERVIEW'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </button>

        <button
          id="admin-tab-questions"
          onClick={() => setActiveTab('QUESTIONS')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'QUESTIONS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Question Bank (CRUD)</span>
          {stats && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'QUESTIONS' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {stats.totalQuestions}
            </span>
          )}
        </button>

        <button
          id="admin-tab-students"
          onClick={() => setActiveTab('STUDENTS')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'STUDENTS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Directory</span>
          {stats && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'STUDENTS' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {stats.totalStudents}
            </span>
          )}
        </button>

        <button
          id="admin-tab-attempts"
          onClick={() => setActiveTab('ATTEMPTS')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'ATTEMPTS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Exam Attempts Audit</span>
          {stats && (
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'ATTEMPTS' ? 'bg-indigo-700 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {stats.totalAttempts}
            </span>
          )}
        </button>
      </div>

      {/* 3. TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Registered Students</span>
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loadingOverview ? '...' : stats?.totalStudents ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">Active examinee accounts</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Question Bank</span>
                <HelpCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loadingOverview ? '...' : stats?.totalQuestions ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">
                {stats?.javaQuestions ?? 0} Java / {stats?.sqlQuestions ?? 0} SQL
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Total Exam Attempts</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loadingOverview ? '...' : stats?.totalAttempts ?? 0}
              </div>
              <span className="text-[11px] text-slate-500">
                {stats?.passedAttempts ?? 0} Passed / {stats?.failedAttempts ?? 0} Failed
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Overall Pass Rate</span>
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {loadingOverview ? '...' : `${stats?.overallPassRate ?? 0}%`}
              </div>
              <span className="text-[11px] text-slate-500">Avg score: {stats?.avgScorePercentage ?? 0}%</span>
            </div>
          </div>

          {/* Quick Action & Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Author Examination Questions</h3>
                  <p className="text-xs text-slate-500">Add MCQs to Java or SQL exam tracks</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add questions with options A–D, configure the correct answer key, marks, difficulty level, and post-exam explanation.
              </p>
              <button
                onClick={() => {
                  setActiveTab('QUESTIONS');
                  setTimeout(() => handleOpenAdd(), 100);
                }}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question Now</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Manage Registered Candidates</h3>
                  <p className="text-xs text-slate-500">Audit student logs & performance</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect registered students, their departmental affiliations, roll numbers, aggregate test metrics, and pass records.
              </p>
              <button
                onClick={() => setActiveTab('STUDENTS')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>View Student Roster</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Audit Exam Attempts</h3>
                  <p className="text-xs text-slate-500">Review evaluation records</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Inspect candidate scorecards, timestamps, and answer sheets computed server-side to guarantee examination integrity.
              </p>
              <button
                onClick={() => setActiveTab('ATTEMPTS')}
                className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Audit Assessment Logs</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: QUESTION BANK (CRUD) */}
      {activeTab === 'QUESTIONS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Subject Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Track:</span>
              </span>
              <button
                onClick={() => setSelectedSubjectFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedSubjectFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All Subjects
              </button>
              <button
                onClick={() => setSelectedSubjectFilter('JAVA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedSubjectFilter === 'JAVA'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Java
              </button>
              <button
                onClick={() => setSelectedSubjectFilter('SQL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedSubjectFilter === 'SQL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                SQL
              </button>
            </div>

            {/* Right: Difficulty, Search & Add Question Button */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedDifficultyFilter}
                  onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="ALL">All Difficulties</option>
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={questionSearch}
                  onChange={(e) => setQuestionSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <button
                id="add-question-btn"
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Question Bank Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingQuestions ? (
              <div className="py-16 text-center text-xs text-slate-500 font-medium">
                <div className="w-7 h-7 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                Loading question bank...
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="py-12 px-6 text-center space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">No Questions Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No questions match your current filter. Add a new question or adjust your search.
                </p>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Create First Question
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    <tr>
                      <th className="px-5 py-3.5">ID & Track</th>
                      <th className="px-5 py-3.5">Question & Options</th>
                      <th className="px-5 py-3.5 text-center">Correct Key</th>
                      <th className="px-5 py-3.5 text-center">Difficulty</th>
                      <th className="px-5 py-3.5 text-center">Marks</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQuestions.map((q) => {
                      const isJava = q.subjectCode === 'JAVA';
                      return (
                        <tr key={q.id} className="hover:bg-slate-50/75 transition-colors">
                          <td className="px-5 py-4 align-top">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] ${
                                  isJava ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                                }`}
                              >
                                {isJava ? 'JV' : 'SQ'}
                              </span>
                              <div>
                                <span className="font-mono font-bold text-slate-900 text-xs">#{q.id}</span>
                                <div className="text-[10px] text-slate-400 font-semibold">{q.subjectCode}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 max-w-md">
                            <div className="font-semibold text-slate-900 text-xs mb-1.5 leading-snug">
                              {q.question_text}
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <div className={q.correct_option === 'A' ? 'font-bold text-emerald-700' : ''}>
                                A: {q.option_a}
                              </div>
                              <div className={q.correct_option === 'B' ? 'font-bold text-emerald-700' : ''}>
                                B: {q.option_b}
                              </div>
                              <div className={q.correct_option === 'C' ? 'font-bold text-emerald-700' : ''}>
                                C: {q.option_c}
                              </div>
                              <div className={q.correct_option === 'D' ? 'font-bold text-emerald-700' : ''}>
                                D: {q.option_d}
                              </div>
                            </div>
                            {q.explanation && (
                              <div className="mt-1 text-[10px] text-slate-400 italic">
                                Note: {q.explanation}
                              </div>
                            )}
                          </td>

                          <td className="px-5 py-4 text-center align-top">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 font-mono font-black text-xs">
                              {q.correct_option}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center align-top">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                q.difficulty === 'EASY'
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : q.difficulty === 'HARD'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {q.difficulty}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center align-top font-bold text-slate-900 text-xs">
                            {q.marks} pt
                          </td>

                          <td className="px-5 py-4 text-right align-top">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(q)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                                title="Edit question"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id, q.question_text)}
                                className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                title="Delete question"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 3: STUDENT MANAGEMENT */}
      {activeTab === 'STUDENTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Enrolled Student Roster</h2>
              <p className="text-xs text-slate-500">Student accounts with performance aggregates</p>
            </div>
            <div className="relative min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, roll, or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingStudents ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <div className="w-7 h-7 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                Loading students roster...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No student accounts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    <tr>
                      <th className="px-5 py-3.5">Candidate Name</th>
                      <th className="px-5 py-3.5">Roll Number</th>
                      <th className="px-5 py-3.5">Department & Semester</th>
                      <th className="px-5 py-3.5 text-center">Attempts</th>
                      <th className="px-5 py-3.5 text-center">Passed</th>
                      <th className="px-5 py-3.5 text-center">Avg Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                              {s.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs">{s.name}</div>
                              <div className="text-[11px] text-slate-500 font-mono">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono font-semibold text-slate-900">{s.rollNumber}</td>
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-800">{s.department}</div>
                          <div className="text-[11px] text-slate-400">{s.semester}</div>
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-slate-900">
                          {s.stats.totalAttempts}
                        </td>
                        <td className="px-5 py-4 text-center font-bold text-emerald-700">
                          {s.stats.passedAttempts}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-black text-xs text-indigo-700">
                            {s.stats.avgPercentage}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: EXAM ATTEMPTS MANAGEMENT */}
      {activeTab === 'ATTEMPTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 mr-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Subject:</span>
              </span>
              <button
                onClick={() => setAttemptSubjectFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  attemptSubjectFilter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setAttemptSubjectFilter('JAVA')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  attemptSubjectFilter === 'JAVA'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Java
              </button>
              <button
                onClick={() => setAttemptSubjectFilter('SQL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  attemptSubjectFilter === 'SQL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-900 border border-indigo-200 hover:bg-indigo-100'
                }`}
              >
                SQL
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={attemptStatusFilter}
                onChange={(e) => setAttemptStatusFilter(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Outcomes</option>
                <option value="PASSED">Passed Only</option>
                <option value="FAILED">Failed Only</option>
              </select>

              <div className="relative min-w-[220px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search candidate name, roll..."
                  value={attemptSearch}
                  onChange={(e) => setAttemptSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingAttempts ? (
              <div className="py-16 text-center text-xs text-slate-500">
                <div className="w-7 h-7 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-2" />
                Loading candidate attempts...
              </div>
            ) : filteredAttempts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No examination attempts found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    <tr>
                      <th className="px-5 py-3.5">Attempt & Candidate</th>
                      <th className="px-5 py-3.5">Track</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5 text-center">Score</th>
                      <th className="px-5 py-3.5 text-center">Percentage</th>
                      <th className="px-5 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAttempts.map((att) => (
                      <tr key={att.id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-900 text-xs">{att.studentName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Roll: {att.rollNumber} • Attempt #{att.id}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              att.subjectCode === 'JAVA'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            {att.subjectCode}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-[11px] text-slate-600">{att.date}</td>
                        <td className="px-5 py-4 text-center font-mono font-bold text-slate-900">
                          {att.score}/{att.totalMarks}
                        </td>
                        <td className="px-5 py-4 text-center font-black text-xs">
                          <span className={att.passed ? 'text-emerald-700' : 'text-rose-700'}>
                            {att.percentage}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                              att.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {att.passed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleDeleteAttempt(att.id, att.studentName)}
                              className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                              title="Delete attempt record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. QUESTION AUTHORING / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">
                  {editingQuestion ? `Edit Question #${editingQuestion.id}` : 'Author New MCQ Question'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Examination Track</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value={1}>Java (Core Java Programming)</option>
                    <option value={2}>SQL (Relational Database Management)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Marks Weight</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Question Statement</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Which of the following is NOT a Java primitive data type?"
                  value={formData.question_text}
                  onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option A</label>
                  <input
                    type="text"
                    required
                    value={formData.option_a}
                    onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option B</label>
                  <input
                    type="text"
                    required
                    value={formData.option_b}
                    onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option C</label>
                  <input
                    type="text"
                    required
                    value={formData.option_c}
                    onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Option D</label>
                  <input
                    type="text"
                    required
                    value={formData.option_d}
                    onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-emerald-800 mb-1">Official Correct Option</label>
                  <select
                    value={formData.correct_option}
                    onChange={(e) => setFormData({ ...formData, correct_option: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-lg border-2 border-emerald-500 bg-emerald-50 font-black text-emerald-900 focus:outline-none"
                  >
                    <option value="A">Option A</option>
                    <option value="B">Option B</option>
                    <option value="C">Option C</option>
                    <option value="D">Option D</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Post-Exam Explanation / Rationale</label>
                  <input
                    type="text"
                    placeholder="Brief explanation shown after submission..."
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-xs disabled:opacity-60"
                >
                  {formSaving ? 'Saving Question...' : editingQuestion ? 'Update Question' : 'Author Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
