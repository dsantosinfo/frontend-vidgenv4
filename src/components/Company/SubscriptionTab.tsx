// src/components/Company/SubscriptionTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Check } from 'lucide-react';
import {
  getCompanySubscription, getPlans, subscribeCompany,
  SubscriptionWithUsage, PlanResponse,
} from '../../config/api';
import { SectionCard, LoadingSpinner, StatusBanner } from '../ui';
import UsageBar from '../ui/UsageBar';
import PlanBadge from '../ui/PlanBadge';

interface Props { companyId: string; }

const fmt = (cents: number) =>
  cents === 0 ? 'Grátis' : `R$ ${(cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}/mês`;

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';

const SubscriptionTab: React.FC<Props> = ({ companyId }) => {
  const [data, setData] = useState<SubscriptionWithUsage | null>(null);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sub, pl] = await Promise.all([
        getCompanySubscription(companyId),
        getPlans(),
      ]);
      setData(sub);
      setPlans(pl);
    } catch { /* silencia */ }
    finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleSubscribe = async (planId: string, cycle: string) => {
    setSubscribing(planId);
    try {
      await subscribeCompany(companyId, { plan_id: planId, billing_cycle: cycle });
      flash('success', 'Plano atualizado com sucesso!');
      await load();
    } catch (e: any) {
      flash('error', e.message || 'Erro ao atualizar plano.');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) return <LoadingSpinner fullArea />;
  if (!data) return null;

  const { subscription: sub, usage, plan } = data;
  const isTrial = sub.status === 'trial';

  return (
    <div className="space-y-4">

      {/* Plano atual */}
      <SectionCard title="Plano Atual">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <PlanBadge plan={plan.name} status={sub.status} className="mb-2" />
            <p className="text-xs text-slate-500">
              {isTrial
                ? `Trial expira em ${fmtDate(sub.trial_ends_at)}`
                : `Período: ${fmtDate(sub.current_period_start)} → ${fmtDate(sub.current_period_end)}`
              }
            </p>
            {isTrial && (
              <p className="text-xs text-yellow-600 mt-1 font-medium">
                ⚠️ Após o trial, o plano será rebaixado para Gratuito automaticamente.
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-slate-900">{fmt(plan.price_monthly)}</p>
            <p className="text-xs text-slate-400">{sub.billing_cycle === 'yearly' ? 'anual' : 'mensal'}</p>
          </div>
        </div>
      </SectionCard>

      {/* Uso do período */}
      <SectionCard title="Uso do Período Atual">
        <div className="space-y-3">
          <UsageBar label="Vídeos gerados"    current={usage.videos_generated} limit={plan.max_videos_month} />
          <UsageBar label="Imagens geradas"   current={usage.images_generated} limit={plan.max_images_month} />
          <UsageBar label="Armazenamento"     current={Math.round(usage.storage_used_mb)} limit={plan.max_storage_mb} unit=" MB" />
          <UsageBar label="Templates salvos"  current={usage.templates_count}  limit={plan.max_templates} />
          <UsageBar label="Presets de marca"  current={usage.presets_count}    limit={plan.max_presets} />
          <UsageBar label="Membros"           current={usage.members_count}    limit={plan.max_users} />
        </div>
      </SectionCard>

      {status && <StatusBanner type={status.type} msg={status.msg} />}

      {/* Planos disponíveis */}
      <SectionCard title="Planos Disponíveis">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {plans.map(p => {
            const isCurrent = p.id === sub.plan_id && sub.status !== 'trial';
            const isUpgrade = p.price_monthly > plan.price_monthly;
            return (
              <div
                key={p.id}
                className={`border rounded-xl p-4 space-y-3 transition-all ${
                  isCurrent ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{p.display_name}</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{fmt(p.price_monthly)}</p>
                </div>
                <ul className="space-y-1 text-xs text-slate-600">
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />{p.max_users === -1 ? 'Membros ilimitados' : `${p.max_users} membro${p.max_users > 1 ? 's' : ''}`}</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />{p.max_videos_month === -1 ? 'Vídeos ilimitados' : `${p.max_videos_month} vídeos/mês`}</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />{p.max_images_month === -1 ? 'Imagens ilimitadas' : `${p.max_images_month} imagens/mês`}</li>
                  <li className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />{p.max_storage_mb === -1 ? 'Armazenamento ilimitado' : `${p.max_storage_mb >= 1024 ? `${p.max_storage_mb / 1024} GB` : `${p.max_storage_mb} MB`}`}</li>
                </ul>
                {isCurrent ? (
                  <span className="block text-center text-xs text-blue-600 font-medium py-1.5">Plano atual</span>
                ) : (
                  <button
                    onClick={() => handleSubscribe(p.id, 'monthly')}
                    disabled={!!subscribing}
                    className={`w-full py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                      isUpgrade
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {subscribing === p.id ? 'Aguarde...' : (
                      <><Zap className="w-3 h-3" />{isUpgrade ? 'Fazer upgrade' : 'Selecionar'}</>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

export default SubscriptionTab;
