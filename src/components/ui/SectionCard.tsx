// src/components/ui/SectionCard.tsx
import React from 'react';

interface SectionCardProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Padding interno. Default: 'p-4' */
  padding?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  description,
  action,
  children,
  className = '',
  padding = 'p-4',
}) => (
  <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>
    {(title || action) && (
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        <div className="min-w-0">
          {title && <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>}
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    <div className={padding}>{children}</div>
  </div>
);

export default SectionCard;
