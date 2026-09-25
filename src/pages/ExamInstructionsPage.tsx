import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Award,
  HelpCircle,
} from 'lucide-react';
import { examService } from '../services/exam.service';
import { ExamInstructionDetails } from '../types';
import { useAuth } from '../context/AuthContext';

export const ExamInstructionsPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState<ExamInstructionDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [agreedToRules, setAgreedToRules] = useState<boolean>(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!code) return;
      try {
        setLoading(true);
        setError(null);
        const res = await examService.getExamDetails(code);
        if (res.success && res.exam) {
          setExam(res.exam);
        } else {
          setError('Failed to load examination details.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to connect to examination server.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [code]);

  const handleStartExam = () => {
    if (!agreedToRules || !code) return;
    navigate(`/exam/live/${code.toUpperCase()}`);
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-600">Loading examination specifications...</p>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Examination Not Available</h2>
        <p className="text-sm text-slate-600">{error || 'The requested examination track is inactive or unavailable.'}</p>
        <Link
          to="/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Student Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Back Link */}
      <Link
        to="/student"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Student Dashboard</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-extrabold uppercase font-mono tracking-wider">
                {exam.code} TRACK
              </span>
              <span className="text-xs text-slate-400 font-medium">Official Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{exam.title}</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{exam.description}</p>
          </div>

          <div className="bg-slate-800/80 backdrop-blur rounded-2xl p-4 border border-slate-700/60 text-right shrink-0">
            <div className="text-xs text-slate-400 font-medium">Candidate Roll No.</div>
            <div className="text-base font-black text-emerald-400 font-mono">{user?.roll_number || 'STU-LOGGED-IN'}</div>
            <div className="text-[11px] text-slate-300 mt-1">{user?.name}</div>
          </div>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Duration</div>
            <div className="text-base font-black text-slate-900">{exam.durationMinutes} Minutes</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Questions</div>
            <div className="text-base font-black text-slate-900">{exam.totalQuestions} MCQs</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Marks</div>
            <div className="text-base font-black text-slate-900">{exam.totalMarks} Marks</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Pass Threshold</div>
            <div className="text-base font-black text-slate-900">{exam.passingPercentage}%</div>
          </div>
        </div>
      </div>

      {/* Rules & Guidelines Container */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Official Examination Rules & Instructions</h2>
        </div>

        <div className="space-y-3">
          {exam.rules.map((rule, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="leading-relaxed">{rule}</p>
            </div>
          ))}
        </div>

        {/* Anti-Cheating & System Guidelines */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Important System Notice:</span>
          </div>
          <p className="text-amber-800 leading-relaxed pl-5">
            Your responses are autosaved locally and submitted to the backend upon completion. Do not close or refresh your browser tab unnecessarily during the live session. In the event the countdown timer reaches zero, the system will automatically submit your saved responses.
          </p>
        </div>

        {/* Candidate Declaration Checkbox */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              id="confirm-rules-checkbox"
              checked={agreedToRules}
              onChange={(e) => setAgreedToRules(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 transition"
            />
            <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900">
              I have verified my identity, read all examination guidelines, and confirm I am prepared to begin the timed test.
            </span>
          </label>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <Link
            to="/student"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition text-center"
          >
            Cancel & Return
          </Link>

          <button
            id="start-exam-button"
            onClick={handleStartExam}
            disabled={!agreedToRules}
            className={`w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 ${
              agreedToRules
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-emerald-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>Start {exam.code} Examination Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
