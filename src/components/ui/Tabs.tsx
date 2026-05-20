// src/components/ui/Tabs.tsx
import React from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ElementType;
  badge?: string | number;
}

interface TabsProps<T extends string = string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  /** 'underline' (default) | 'pill' */
  variant?: 'underline' | 'pill';
  className?: string;
}

function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  variant = 'underline',
  className = '',
}: TabsProps<T>) {
  if (variant === 'pill') {
    return (
      <div className={`flex gap-1 flex-wrap ${className}`}>
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              active === id
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
            {badge !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                active === id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // underline (default)
  return (
    <div className={`flex border-b border-slate-200 overflow-x-auto scrollbar-none ${className}`}>
      {tabs.map(({ id, label, icon: Icon, badge }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1 px-2.5 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors shrink-0 sm:px-3 sm:py-2.5 sm:text-sm sm:gap-1.5 ${
            active === id
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          <span>{label}</span>
          {badge !== undefined && (
            <span className={`px-1 py-0.5 rounded-full text-[9px] font-bold sm:text-[10px] sm:px-1.5 ${
              active === id ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default Tabs;
