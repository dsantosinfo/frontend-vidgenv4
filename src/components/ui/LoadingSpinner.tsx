// src/components/ui/LoadingSpinner.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface LoadingSpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
  /** Se true, centraliza na área disponível */
  fullArea?: boolean;
}

const SIZE: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  label,
  className = '',
  fullArea = false,
}) => {
  const spinner = (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <Loader2 className={`${SIZE[size]} animate-spin text-blue-500`} />
      {label && <p className="text-sm text-slate-500">{label}</p>}
    </div>
  );

  if (fullArea) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[120px]">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
