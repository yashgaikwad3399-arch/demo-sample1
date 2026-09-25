import React from 'react';
import { CheckCircle2, Bookmark, HelpCircle, Send } from 'lucide-react';
import { ExamQuestion } from '../../types';

interface QuestionPaletteProps {
  questions: ExamQuestion[];
  currentIndex: number;
  answers: Record<string, string | null>;
  flaggedQuestions: Record<string, boolean>;
  onSelectQuestion: (index: number) => void;
  onSubmitClick: () => void;
  isSubmitting?: boolean;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectQuestion,
  onSubmitClick,
  isSubmitting = false,
}) => {
  const answeredCount = Object.values(answers).filter((v) => v !== null && v !== undefined).length;
  const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <aside id="question-palette-panel" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <span>Question Palette</span>
          <span className="text-[10px] font-normal text-slate-500 font-mono">({questions.length} Total)</span>
        </h3>
      </div>

      {/* Legend & Summary Statistics */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="text-emerald-700 font-extrabold text-sm">{answeredCount}</div>
          <div className="text-[10px] font-medium text-emerald-800 uppercase tracking-tight">Answered</div>
        </div>
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
          <div className="text-amber-700 font-extrabold text-sm">{flaggedCount}</div>
          <div className="text-[10px] font-medium text-amber-800 uppercase tracking-tight">Flagged</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
          <div className="text-slate-700 font-extrabold text-sm">{unansweredCount}</div>
          <div className="text-[10px] font-medium text-slate-600 uppercase tracking-tight">Pending</div>
        </div>
      </div>

      {/* Quick Jump Buttons Grid */}
      <div className="space-y-2">
        <div className="text-[11px] font-semibold text-slate-500">Jump to Question:</div>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = answers[String(q.id)] !== undefined && answers[String(q.id)] !== null;
            const isFlagged = Boolean(flaggedQuestions[String(q.id)]);
            const isCurrent = currentIndex === idx;

            return (
              <button
                key={q.id}
                id={`palette-btn-q${idx + 1}`}
                onClick={() => onSelectQuestion(idx)}
                title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}${isFlagged ? ' (Marked for review)' : ''}`}
                className={`relative h-10 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                  isCurrent
                    ? 'ring-2 ring-blue-600 ring-offset-2 z-10'
                    : ''
                } ${
                  isFlagged
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-black'
                    : isAnswered
                    ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{idx + 1}</span>
                {isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
                {isAnswered && !isFlagged && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Indicators Guide */}
      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-emerald-600 shrink-0" />
          <span>Answered question</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 shrink-0" />
          <span>Marked for review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 shrink-0" />
          <span>Unanswered / Skipped</span>
        </div>
      </div>

      {/* Submit Exam Button */}
      <div className="pt-2">
        <button
          id="palette-submit-exam-btn"
          onClick={onSubmitClick}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-2"
        >
          <Send className="w-3.5 h-3.5 text-emerald-400" />
          <span>Submit Examination</span>
        </button>
      </div>
    </aside>
  );
};
