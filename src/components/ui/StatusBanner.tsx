// src/components/ui/StatusBanner.tsx
import React from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type StatusType = 'success' | 'error' | 'warning' | 'info';

interface StatusBannerProps {
  type: StatusType;
  msg: string;
  onDismiss?: () => void;
  className?: string;
}

const CONFIG: Record<StatusType, { icon: React.ElementType; classes: string }> = {
  success: { icon: CheckCircle,   classes: 'bg-green-50 border-green-200 text-green-800' },
  error:   { icon: AlertCircle,   classes: 'bg-red-50 border-red-200 text-red-700' },
  warning: { icon: AlertTriangle, classes: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
  info:    { icon: Info,          classes: 'bg-blue-50 border-blue-200 text-blue-800' },
};

const StatusBanner: React.FC<StatusBannerProps> = ({ type, msg, onDismiss, className = '' }) => {
  const { icon: Icon, classes } = CONFIG[type];
  return (
    <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm ${classes} ${className}`}>
      <Icon className="w-4 h-4 shrink-0" />
      <span className="flex-1">{msg}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default StatusBanner;
