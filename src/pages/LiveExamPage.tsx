import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Send,
  HelpCircle,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { examService } from '../services/exam.service';
import { ExamQuestion } from '../types';
import { useAuth } from '../context/AuthContext';
import { ExamTimer } from '../components/exam/ExamTimer';
import { QuestionPalette } from '../components/exam/QuestionPalette';

export const LiveExamPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [subjectInfo, setSubjectInfo] = useState<any>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | null>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [startTime, setStartTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);

  const answersRef = useRef<Record<string, string | null>>(answers);
  answersRef.current = answers;

  const storageKey = code ? `live_exam_${code.toUpperCase()}` : '';

  // 1. Fetch questions on mount
  useEffect(() => {
    const initExam = async () => {
      if (!code) return;
      try {
        setLoading(true);
        setError(null);
        const res = await examService.getExamQuestions(code);
        if (res.success && res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
          setSubjectInfo(res.subject);

          // Check if session exists in localStorage
          const savedData = localStorage.getItem(storageKey);
          if (savedData) {
            try {
              const parsed = JSON.parse(savedData);
              setAnswers(parsed.answers || {});
              setFlagged(parsed.flagged || {});
              setStartTime(parsed.startTime || new Date().toISOString());
            } catch {
              setStartTime(new Date().toISOString());
            }
          } else {
            const now = new Date().toISOString();
            setStartTime(now);
            localStorage.setItem(storageKey, JSON.stringify({ answers: {}, flagged: {}, startTime: now }));
          }
        } else {
          setError('No examination questions found for this subject.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load examination questions.');
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [code, storageKey]);

  // Sync answers with localStorage
  const updateAnswer = (questionId: number, optionLetter: string) => {
    const updated = {
      ...answers,
      [String(questionId)]: optionLetter,
    };
    setAnswers(updated);
    if (storageKey) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers: updated, flagged, startTime: startTime || new Date().toISOString() })
      );
    }
  };

  const clearCurrentAnswer = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const updated = { ...answers };
    delete updated[String(currentQ.id)];
    setAnswers(updated);
    if (storageKey) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers: updated, flagged, startTime })
      );
    }
  };

  const toggleFlagCurrent = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    const qId = String(currentQ.id);
    const updatedFlagged = {
      ...flagged,
      [qId]: !flagged[qId],
    };
    setFlagged(updatedFlagged);
    if (storageKey) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ answers, flagged: updatedFlagged, startTime })
      );
    }
  };

  // Perform Final Submission to Backend
  const executeSubmission = useCallback(
    async (isAuto = false) => {
      if (!code || isSubmitting) return;
      try {
        setIsSubmitting(true);
        if (isAuto) {
          setSubmitNotice('Time expired! Submitting your answers to the evaluation server...');
        } else {
          setSubmitNotice('Submitting and evaluating your examination responses...');
        }

        const submissionPayload = {
          subjectCode: code.toUpperCase(),
          startTime: startTime || new Date().toISOString(),
          answers: answersRef.current,
          isAutoSubmitted: isAuto,
        };

        const resultResponse = await examService.submitExam(submissionPayload);

        // Clear local storage for this session
        if (storageKey) {
          localStorage.removeItem(storageKey);
        }

        if (resultResponse.success && resultResponse.attemptId) {
          navigate(`/exam/result/${resultResponse.attemptId}`);
        } else {
          setError('Backend failed to return a valid attempt record.');
          setIsSubmitting(false);
        }
      } catch (err: any) {
        setIsSubmitting(false);
        setError(err.response?.data?.message || 'Server error occurred during examination evaluation.');
      }
    },
    [code, isSubmitting, navigate, startTime, storageKey]
  );

  const handleTimeExpire = useCallback(() => {
    executeSubmission(true);
  }, [executeSubmission]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Connecting to secure question bank...</p>
        <p className="text-xs text-slate-400">Verifying session token and loading assessment...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Exam Session Error</h2>
        <p className="text-sm text-slate-600">{error || 'Questions could not be loaded.'}</p>
        <Link
          to="/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
        >
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const currentAnswer = answers[String(currentQ.id)] || null;
  const isCurrentFlagged = Boolean(flagged[String(currentQ.id)]);
  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 px-4 sm:px-6 space-y-4">
      {/* Top Banner & Timer Bar */}
      <header className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-mono font-bold text-sm">
            {subjectInfo?.code || code}
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Candidate: {user?.name} ({user?.roll_number})</div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">{subjectInfo?.name}</h1>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {subjectInfo?.durationMinutes && (
            <ExamTimer
              durationMinutes={subjectInfo.durationMinutes}
              onTimeExpire={handleTimeExpire}
              isSubmitting={isSubmitting}
            />
          )}

          <button
            id="header-submit-btn"
            onClick={() => setShowSubmitModal(true)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Submit</span>
          </button>
        </div>
      </header>

      {/* Notice Banner (for automated submission or status) */}
      {submitNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-3 animate-pulse">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{submitNotice}</span>
        </div>
      )}

      {/* Main Examination Grid: Question Area (left) + Question Palette (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Question Workspace */}
        <main className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            {/* Question Header & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono font-black">
                  Q{currentIndex + 1} of {questions.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Marks: <strong className="text-slate-800">{currentQ.marks}</strong>
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold uppercase">
                  {currentQ.difficulty}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="flag-question-btn"
                  onClick={toggleFlagCurrent}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    isCurrentFlagged
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-amber-600 text-amber-600' : ''}`} />
                  <span>{isCurrentFlagged ? 'Flagged' : 'Mark for Review'}</span>
                </button>

                {currentAnswer && (
                  <button
                    id="clear-answer-btn"
                    onClick={clearCurrentAnswer}
                    className="px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex items-center gap-1"
                    title="Clear selected option"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Question Prompt Stem */}
            <div className="space-y-2">
              <p className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                {currentQ.questionText}
              </p>
            </div>

            {/* MCQ 4 Options */}
            <div className="space-y-3 pt-2">
              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const optText = currentQ.options[optKey];
                const isSelected = currentAnswer === optKey;

                return (
                  <button
                    key={optKey}
                    id={`option-${optKey.toLowerCase()}-btn`}
                    onClick={() => updateAnswer(currentQ.id, optKey)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-extrabold shrink-0 transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-700 border border-slate-300 group-hover:border-slate-400'
                      }`}
                    >
                      {optKey}
                    </div>
                    <div className={`text-xs sm:text-sm pt-0.5 leading-relaxed ${isSelected ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                      {optText}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Previous / Next Navigation Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                id="prev-question-btn"
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  currentIndex === 0
                    ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="text-xs text-slate-400 font-mono">
                {currentIndex + 1} / {questions.length}
              </div>

              {currentIndex < questions.length - 1 ? (
                <button
                  id="next-question-btn"
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  id="review-and-submit-btn"
                  onClick={() => setShowSubmitModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <span>Review & Finish</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </main>

        {/* Right Column: Question Palette & Submission Summary */}
        <aside className="lg:col-span-4">
          <QuestionPalette
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            flaggedQuestions={flagged}
            onSelectQuestion={(idx) => setCurrentIndex(idx)}
            onSubmitClick={() => setShowSubmitModal(true)}
            isSubmitting={isSubmitting}
          />
        </aside>
      </div>

      {/* Confirmation Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Confirm Examination Submission</h3>
              <p className="text-xs text-slate-500">
                Once submitted, your responses will be evaluated by the server and permanently recorded in MySQL.
              </p>
            </div>

            {/* Tally Breakdown */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1">
                <div className="text-slate-500">Total Questions:</div>
                <div className="font-extrabold text-slate-900 text-sm">{questions.length}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500">Answered:</div>
                <div className="font-extrabold text-emerald-600 text-sm">{answeredCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500">Unanswered / Skipped:</div>
                <div className="font-extrabold text-rose-600 text-sm">{unansweredCount}</div>
              </div>
              <div className="space-y-1">
                <div className="text-slate-500">Marked for Review:</div>
                <div className="font-extrabold text-amber-600 text-sm">
                  {Object.values(flagged).filter(Boolean).length}
                </div>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  You still have <strong>{unansweredCount} unanswered questions</strong>. You may return to complete them before submitting.
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
              >
                Return to Exam
              </button>
              <button
                type="button"
                id="modal-confirm-submit-btn"
                onClick={() => executeSubmission(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Grading...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Submit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
