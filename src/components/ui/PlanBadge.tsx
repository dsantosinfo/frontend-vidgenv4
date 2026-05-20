// src/components/ui/PlanBadge.tsx
import React from 'react';

interface PlanBadgeProps {
  plan: string;
  status: string;
  className?: string;
}

const PLAN_COLOR: Record<string, string> = {
  free:       'bg-slate-100 text-slate-600',
  starter:    'bg-blue-100 text-blue-700',
  pro:        'bg-purple-100 text-purple-700',
  enterprise: 'bg-amber-100 text-amber-700',
};

const STATUS_COLOR: Record<string, string> = {
  trial:    'bg-yellow-100 text-yellow-700',
  active:   'bg-green-100 text-green-700',
  past_due: 'bg-orange-100 text-orange-700',
  canceled: 'bg-red-100 text-red-600',
  expired:  'bg-red-100 text-red-600',
};

const STATUS_LABEL: Record<string, string> = {
  trial:    'Trial',
  active:   'Ativo',
  past_due: 'Pagamento pendente',
  canceled: 'Cancelado',
  expired:  'Expirado',
};

const PlanBadge: React.FC<PlanBadgeProps> = ({ plan, status, className = '' }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PLAN_COLOR[plan] ?? PLAN_COLOR.free}`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[status] ?? 'bg-slate-100 text-slate-500'}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  </div>
);

export default PlanBadge;
