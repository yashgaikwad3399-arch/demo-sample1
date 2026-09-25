import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Printer,
  HelpCircle,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { examService } from '../services/exam.service';
import { ExamResultReviewResponse } from '../types';

export const ExamResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();

  const [data, setData] = useState<ExamResultReviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await examService.getExamResult(Number(attemptId));
        if (res.success && res.attempt) {
          setData(res);
        } else {
          setError('Failed to retrieve examination scorecard.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch examination results.');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-700">Loading server-evaluated scorecard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Scorecard Not Accessible</h2>
        <p className="text-sm text-slate-600">{error || 'Record could not be found or access is restricted.'}</p>
        <Link
          to="/student"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const { attempt, itemizedReview } = data;
  const isPassed = attempt.passed;
  const incorrectCount = attempt.totalQuestions - attempt.correctAnswers;
  const displaySubject =
    attempt.subjectCode === 'JAVA' ? 'Java' : attempt.subjectCode === 'SQL' ? 'SQL' : attempt.subjectName;
  const formattedDate = attempt.startTime
    ? new Date(attempt.startTime).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 print:py-0 print:px-0">
      {/* Navigation and Print Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-2">
          <Link
            to="/student/history"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Exam History</span>
          </Link>
          <Link
            to="/student"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            <span>Dashboard</span>
          </Link>
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Print Official Scorecard</span>
        </button>
      </div>

      {/* Hero Scorecard Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border shadow-sm text-white transition-all ${
          isPassed
            ? 'bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 border-emerald-700/50'
            : 'bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 border-rose-700/50'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-white text-xs font-extrabold uppercase font-mono tracking-wider">
                ATTEMPT #{attempt.id} • {attempt.subjectCode}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-xs font-black uppercase tracking-wider ${
                  isPassed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                }`}
              >
                {isPassed ? 'PASSED' : 'DID NOT PASS'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isPassed ? 'Congratulations! Examination Passed' : 'Assessment Completed'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Candidate: <strong className="text-white">{attempt.studentName}</strong> (Roll: {attempt.rollNumber})
            </p>
          </div>

          {/* Large Circular Percentage Visual */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/10 shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center font-black">
              <span className="text-xl leading-none">{attempt.percentage}%</span>
              <span className="text-[9px] text-slate-500 uppercase tracking-tight mt-0.5">Final Score</span>
            </div>
            <div className="space-y-0.5 text-xs text-slate-200">
              <div>Marks: <strong className="text-white">{attempt.score} / {attempt.totalMarks}</strong></div>
              <div>Passing Threshold: <strong className="text-white">{attempt.passingPercentage}%</strong></div>
              <div className="text-[11px] text-slate-400">Server Evaluated in MySQL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Official Audit Record Summary String (Matches: Java | 10 Sept 2026 | 20 | 16 | 4 | 16/20 | 80% | Passed) */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 font-mono font-bold text-slate-800">
          <span className="text-slate-400 uppercase text-[10px] tracking-wider font-sans">Official Record:</span>
          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-900">{displaySubject}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700">{formattedDate}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-700">{attempt.totalQuestions} Qs</span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-700">{attempt.correctAnswers} Correct</span>
          <span className="text-slate-300">|</span>
          <span className="text-rose-700">{incorrectCount} Incorrect</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-900">{attempt.score}/{attempt.totalMarks}</span>
          <span className="text-slate-300">|</span>
          <span className={isPassed ? 'text-emerald-700' : 'text-rose-700'}>{attempt.percentage}%</span>
          <span className="text-slate-300">|</span>
          <span
            className={`px-2 py-0.5 rounded text-[11px] ${
              isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isPassed ? 'Passed' : 'Failed'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Total Questions</div>
            <div className="text-base font-black text-slate-900">{attempt.totalQuestions}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Correct Answers</div>
            <div className="text-base font-black text-emerald-600">{attempt.correctAnswers}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Incorrect / Skipped</div>
            <div className="text-base font-black text-rose-600">{incorrectCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Grade / Percentage</div>
            <div className="text-base font-black text-slate-900">{attempt.percentage}%</div>
          </div>
        </div>
      </div>

      {/* Itemized Question-by-Question Review with Explanations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Itemized Examination Review</h2>
            <p className="text-xs text-slate-500">
              Detailed breakdown of your submitted answers, official correct keys, and explanations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" /> Correct: {attempt.correctAnswers}
            </span>
            <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
              <XCircle className="w-3.5 h-3.5" /> Wrong: {incorrectCount}
            </span>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {itemizedReview.map((item, idx) => {
            const isCorrect = item.isCorrect;
            const chosen = item.selectedOption;
            const correct = item.correctOption;

            return (
              <div
                key={item.questionId}
                className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/30 border-rose-200'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-900 text-white text-xs font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isCorrect ? 'CORRECT (+1 Mark)' : chosen ? 'INCORRECT (0 Marks)' : 'SKIPPED (0 Marks)'}
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-500">
                    Awarded: {item.marksAwarded} / {item.maxMarks}
                  </span>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-slate-900 mb-4">{item.questionText}</p>

                {/* 4 Choices */}
                <div className="space-y-2 mb-4">
                  {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                    const optText = item.options[optKey];
                    const isStudentChoice = chosen === optKey;
                    const isRightAnswer = correct === optKey;

                    let cardStyle = 'bg-white border-slate-200 text-slate-700';
                    let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-300';

                    if (isRightAnswer) {
                      cardStyle = 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-semibold';
                      badgeStyle = 'bg-emerald-600 text-white';
                    } else if (isStudentChoice && !isRightAnswer) {
                      cardStyle = 'bg-rose-100/70 border-rose-400 text-rose-950 font-semibold';
                      badgeStyle = 'bg-rose-600 text-white';
                    }

                    return (
                      <div
                        key={optKey}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${cardStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 ${badgeStyle}`}
                          >
                            {optKey}
                          </span>
                          <span className="leading-snug">{optText}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {isRightAnswer && (
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-600 text-white">
                              Correct Key
                            </span>
                          )}
                          {isStudentChoice && (
                            <span
                              className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                isRightAnswer ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white'
                              }`}
                            >
                              Your Choice
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {item.explanation && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Explanation:</span>
                    </div>
                    <p className="leading-relaxed pl-5 text-slate-700">{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <Link
          to="/student"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition text-center shadow-sm flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Student Dashboard</span>
        </Link>

        <Link
          to={attempt.subjectCode === 'JAVA' ? '/exam/instructions/SQL' : '/exam/instructions/JAVA'}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition text-center shadow-sm flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>
            {attempt.subjectCode === 'JAVA' ? 'Attempt SQL Assessment' : 'Attempt Java Assessment'}
          </span>
        </Link>
      </div>
    </div>
  );
};
