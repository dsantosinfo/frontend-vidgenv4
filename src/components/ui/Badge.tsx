// src/components/ui/Badge.tsx
import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'indigo' | 'slate';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const VARIANT: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600',
  blue:    'bg-blue-100 text-blue-700',
  green:   'bg-green-100 text-green-700',
  red:     'bg-red-100 text-red-700',
  yellow:  'bg-yellow-100 text-yellow-700',
  purple:  'bg-purple-100 text-purple-700',
  indigo:  'bg-indigo-100 text-indigo-700',
  slate:   'bg-slate-100 text-slate-600',
};

// Mapeamentos prontos para uso
export const ROLE_BADGE: Record<string, BadgeVariant> = {
  owner:      'purple',
  superadmin: 'blue',
  admin:      'blue',
  user:       'default',
  member:     'default',
};

export const ROLE_LABEL: Record<string, string> = {
  owner:      'Owner',
  superadmin: 'Super Admin',
  admin:      'Admin',
  user:       'Usuário',
  member:     'Membro',
};

export const STATUS_BADGE: Record<string, BadgeVariant> = {
  active:     'green',
  inactive:   'red',
  processing: 'blue',
  queued:     'blue',
  completed:  'green',
  failed:     'red',
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT[variant]} ${className}`}>
    {children}
  </span>
);

export default Badge;
