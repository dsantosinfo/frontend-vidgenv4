// src/components/ui/UsageBar.tsx
import React from 'react';

interface UsageBarProps {
  label: string;
  current: number;
  limit: number;       // -1 = ilimitado
  unit?: string;
  className?: string;
}

const UsageBar: React.FC<UsageBarProps> = ({ label, current, limit, unit = '', className = '' }) => {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min((current / limit) * 100, 100);
  const color = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium text-slate-700">{label}</span>
        <span className="text-xs text-slate-500">
          {current}{unit} / {unlimited ? '∞' : `${limit}${unit}`}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        {unlimited ? (
          <div className="h-full bg-green-400 w-full opacity-30" />
        ) : (
          <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        )}
      </div>
    </div>
  );
};

export default UsageBar;
