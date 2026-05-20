// src/components/ui/PageHeader.tsx
import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action, className = '' }) => (
  <div className={`flex items-start justify-between gap-4 ${className}`}>
    <div className="min-w-0">
      <h2 className="text-base font-bold text-slate-900 sm:text-lg truncate">{title}</h2>
      {description && <p className="text-xs text-slate-500 mt-0.5 sm:text-sm">{description}</p>}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export default PageHeader;
