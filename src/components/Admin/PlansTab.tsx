// src/components/Admin/PlansTab.tsx
import React, { useState, useEffect } from 'react';
import { Edit2, Check, X, RefreshCw } from 'lucide-react';
import { getPlans, updatePlan, PlanResponse } from '../../config/api';
import { SectionCard, LoadingSpinner, EmptyState, StatusBanner } from '../ui';
import PlanBadge from '../ui/PlanBadge';

// -1 = ilimitado
const LIMIT_FIELDS: { key: keyof PlanResponse; label: string; unit?: string }[] = [
  { key: 'max_users',        label: 'Membros' },
  { key: 'max_videos_month', label: 'Vídeos/mês' },
  { key: 'max_images_month', label: 'Imagens/mês' },
  { key: 'max_storage_mb',   label: 'Armazenamento (MB)' },
  { key: 'max_templates',    label: 'Templates' },
  { key: 'max_presets',      label: 'Presets' },
];

const fmtStorage = (mb: number) =>
  mb === -1 ? '∞' : mb >= 1024 ? `${mb / 1024} GB` : `${mb} MB`;

const fmtPrice = (cents: number) =>
  cents === 0 ? 'Grátis' : `R$ ${(cents / 100).toFixed(0)}/mês`;

interface EditForm {
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  max_users: number;
  max_videos_month: number;
  max_images_month: number;
  max_storage_mb: number;
  max_templates: number;
  max_presets: number;
  is_active: boolean;
}

const toForm = (p: PlanResponse): EditForm => ({
  display_name:     p.display_name,
  price_monthly:    p.price_monthly,
  price_yearly:     p.price_yearly,
  max_users:        p.max_users,
  max_videos_month: p.max_videos_month,
  max_images_month: p.max_images_month,
  max_storage_mb:   p.max_storage_mb,
  max_templates:    p.max_templates,
  max_presets:      p.max_presets,
  is_active:        p.is_active,
});

const PlansTab: React.FC = () => {
  const [plans, setPlans]       = useState<PlanResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm]         = useState<EditForm | null>(null);
  const [saving, setSaving]     = useState(false);
  const [status, setStatus]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3500);
  };

  const load = () => {
    setLoading(true);
    getPlans()
      .then(setPlans)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p: PlanResponse) => {
    setEditingId(p.id);
    setForm(toForm(p));
  };

  const cancelEdit = () => { setEditingId(null); setForm(null); };

  const handleSave = async (planId: string) => {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await updatePlan(planId, form) as PlanResponse;
      setPlans(prev => prev.map(p => p.id === planId ? updated : p));
      setEditingId(null);
      setForm(null);
      flash('success', 'Plano atualizado!');
    } catch (e: any) {
      flash('error', e.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const setField = (key: keyof EditForm, value: any) =>
    setForm(f => f ? { ...f, [key]: value } : f);

  if (loading) return <LoadingSpinner fullArea />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Gerencie os planos disponíveis na plataforma. Use -1 para ilimitado.
        </p>
        <button onClick={load} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {status && <StatusBanner type={status.type} msg={status.msg} />}

      {plans.length === 0 ? (
        <SectionCard>
          <EmptyState icon={Check} title="Nenhum plano cadastrado."
            description="Execute o seed de planos no backend." />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {plans.map(p => {
            const isEditing = editingId === p.id;
            return (
              <div key={p.id} className={`bg-white rounded-xl border transition-all ${
                isEditing ? 'border-blue-400 shadow-md' : 'border-slate-200'
              }`}>
                {/* Header */}
                <div className="flex items-start justify-between p-4 border-b border-slate-100">
                  <div>
                    {isEditing ? (
                      <input
                        value={form!.display_name}
                        onChange={e => setField('display_name', e.target.value)}
                        className="text-sm font-bold text-slate-900 border border-slate-300 rounded px-2 py-0.5 w-full mb-1"
                      />
                    ) : (
                      <PlanBadge plan={p.name} status={p.is_active ? 'active' : 'canceled'} />
                    )}
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-slate-500">R$</span>
                        <input
                          type="number" min={0}
                          value={form!.price_monthly}
                          onChange={e => setField('price_monthly', parseInt(e.target.value) || 0)}
                          className="w-20 text-sm font-bold border border-slate-300 rounded px-2 py-0.5"
                          title="Preço mensal em centavos"
                        />
                        <span className="text-xs text-slate-400">centavos/mês</span>
                      </div>
                    ) : (
                      <p className="text-base font-bold text-slate-900 mt-1">{fmtPrice(p.price_monthly)}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSave(p.id)} disabled={saving}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={cancelEdit}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => startEdit(p)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Limites */}
                <div className="p-4 space-y-2">
                  {LIMIT_FIELDS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-2">
                      <span className="text-xs text-slate-600 truncate">{label}</span>
                      {isEditing ? (
                        <input
                          type="number" min={-1}
                          value={(form as any)[key]}
                          onChange={e => setField(key, parseInt(e.target.value))}
                          className="w-20 text-xs text-right border border-slate-300 rounded px-2 py-0.5 font-mono"
                          title="-1 = ilimitado"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-800 font-mono">
                          {key === 'max_storage_mb'
                            ? fmtStorage(p[key] as number)
                            : (p[key] as number) === -1 ? '∞' : p[key]}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Preço anual */}
                  {isEditing && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <span className="text-xs text-slate-600">Preço anual (centavos)</span>
                      <input
                        type="number" min={0}
                        value={form!.price_yearly}
                        onChange={e => setField('price_yearly', parseInt(e.target.value) || 0)}
                        className="w-20 text-xs text-right border border-slate-300 rounded px-2 py-0.5 font-mono"
                      />
                    </div>
                  )}

                  {/* Ativo/Inativo */}
                  {isEditing && (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-xs text-slate-600">Plano ativo</span>
                      <input
                        type="checkbox"
                        checked={form!.is_active}
                        onChange={e => setField('is_active', e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </div>
                  )}

                  {!isEditing && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {p.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlansTab;
