import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'connected' | 'disconnected' | 'pending' | 'warning';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const isGreen = status === 'online' || status === 'connected';
  const isYellow = status === 'pending' || status === 'warning';

  const badgeStyles = isGreen
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isYellow
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-rose-50 text-rose-700 border-rose-200';

  const dotStyles = isGreen
    ? 'bg-emerald-500'
    : isYellow
    ? 'bg-amber-500'
    : 'bg-rose-500';

  const textSize = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      id={`status-badge-${status}`}
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${badgeStyles} ${textSize}`}
    >
      <span className={`w-2 h-2 rounded-full ${dotStyles} animate-pulse`} />
      <span>{label || status.toUpperCase()}</span>
    </span>
  );
};
