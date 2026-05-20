// src/components/ui/EmptyState.tsx
import React from 'react';

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-10 px-4 text-center ${className}`}>
    <Icon className="w-10 h-10 text-slate-300 mb-3" />
    <p className="font-medium text-slate-600 text-sm">{title}</p>
    {description && <p className="text-xs text-slate-400 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
