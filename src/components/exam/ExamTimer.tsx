import React, { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface ExamTimerProps {
  durationMinutes: number;
  onTimeExpire: () => void;
  isSubmitting?: boolean;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  durationMinutes,
  onTimeExpire,
  isSubmitting = false,
}) => {
  const totalSeconds = durationMinutes * 60;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(totalSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expiredHandledRef = useRef<boolean>(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!expiredHandledRef.current) {
            expiredHandledRef.current = true;
            onTimeExpire();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [onTimeExpire]);

  // Format MM:SS
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = secondsRemaining <= 60; // < 1 min
  const isWarning = secondsRemaining <= 300 && !isCritical; // < 5 mins

  return (
    <div
      id="exam-countdown-timer"
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
        isCritical
          ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse ring-2 ring-rose-300'
          : isWarning
          ? 'bg-amber-50 border-amber-300 text-amber-800'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {isCritical || isWarning ? (
        <AlertTriangle className={`w-4 h-4 ${isCritical ? 'text-rose-600' : 'text-amber-600'}`} />
      ) : (
        <Clock className="w-4 h-4 text-emerald-400" />
      )}
      <div className="flex items-center gap-1">
        <span className="text-[10px] font-sans font-medium uppercase tracking-wider text-slate-400">
          {isCritical ? 'TIME CRITICAL:' : 'REMAINING:'}
        </span>
        <span className="text-sm font-black tracking-widest">{formattedTime}</span>
      </div>
    </div>
  );
};
