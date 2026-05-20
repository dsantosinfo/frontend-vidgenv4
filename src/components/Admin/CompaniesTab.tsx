// src/components/Admin/CompaniesTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, Building2, Edit2, Check, X,
  ChevronDown, ChevronUp, Users, Power, PowerOff,
  Mail, Key, Eye, EyeOff, Copy, CheckCircle, CreditCard, UserPlus,
} from 'lucide-react';
import {
  getMyCompanies, createCompany, updateCompany, toggleCompanyActive,
  getCompanyById, getCompanyMembersFull, sendResetPassword, generateTempPassword,
  getPlans, getCompanySubscription, subscribeCompany, addCompanyMember,
  CompanyResponse, PlanResponse,
} from '../../config/api';
import { Avatar, Badge, SectionCard, EmptyState, LoadingSpinner, StatusBanner, ConfirmDialog } from '../ui';
import PlanBadge from '../ui/PlanBadge';
import ApiTokensPanel from '../ApiTokensPanel';

// ─── Painel de plano de uma empresa ─────────────────────────────────────────
const CompanyPlanPanel: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [subData, setSubData]   = useState<any>(null);
  const [plans, setPlans]       = useState<PlanResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [cycle, setCycle]       = useState('monthly');
  const [status, setStatus]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3500);
  };

  useEffect(() => {
    Promise.all([getCompanySubscription(companyId), getPlans()])
      .then(([sub, pl]) => { setSubData(sub); setPlans(pl); setSelectedPlan(sub.plan.id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleSave = async () => {
    if (!selectedPlan) return;
    setSaving(true);
    try {
      await subscribeCompany(companyId, { plan_id: selectedPlan, billing_cycle: cycle });
      const updated = await getCompanySubscription(companyId);
      setSubData(updated);
      flash('success', 'Plano atualizado!');
    } catch (e: any) {
      flash('error', e.message || 'Erro ao atualizar plano.');
    } finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner size="sm" className="py-4" />;

  return (
    <div className="space-y-3 pt-2">
      {status && <StatusBanner type={status.type} msg={status.msg} />}

      {subData && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500">Plano atual:</span>
          <PlanBadge plan={subData.plan.name} status={subData.subscription.status} />
          {subData.subscription.trial_ends_at && (
            <span className="text-[10px] text-yellow-600">
              Trial até {new Date(subData.subscription.trial_ends_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      )}

      <div className="flex items-end gap-2 flex-wrap">
        <div className="flex-1 min-w-32">
          <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Novo plano</label>
          <select
            value={selectedPlan}
            onChange={e => setSelectedPlan(e.target.value)}
            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.display_name} — {p.price_monthly === 0 ? 'Grátis' : `R$ ${(p.price_monthly / 100).toFixed(0)}/mês`}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Ciclo</label>
          <select
            value={cycle}
            onChange={e => setCycle(e.target.value)}
            className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </select>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || selectedPlan === subData?.plan?.id}
          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Aplicar plano'}
        </button>
      </div>
    </div>
  );
};

// ─── Painel de membros de uma empresa ────────────────────────────────────────
const CompanyMembersPanel: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [tempPassword, setTempPassword] = useState<{ email: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', role: 'member' });
  const [adding, setAdding] = useState(false);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  };

  useEffect(() => {
    getCompanyMembersFull(companyId)
      .then(setMembers)
      .catch(() => setMembers([]))
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleSendReset = async (userId: string, email: string) => {
    setActionLoading(userId + '_reset');
    try {
      await sendResetPassword(userId);
      flash('success', `Email de redefinição enviado para ${email}`);
    } catch (e: any) {
      flash('error', e.message || 'Erro ao enviar email.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGeneratePassword = async (userId: string) => {
    setActionLoading(userId + '_pass');
    try {
      const result = await generateTempPassword(userId);
      setTempPassword(result);
      setShowPassword(false);
      setCopied(false);
    } catch (e: any) {
      flash('error', e.message || 'Erro ao gerar senha.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      const m = await addCompanyMember(companyId, { email: addForm.email, role: addForm.role });
      setMembers(prev => [...prev, m]);
      setAddForm({ email: '', role: 'member' });
      setShowAddForm(false);
      flash('success', `${addForm.email} adicionado. Email de convite/redefinição enviado.`);
    } catch (e: any) {
      flash('error', e.message || 'Erro ao adicionar membro.');
    } finally { setAdding(false); }
  };

  if (loading) return <LoadingSpinner size="sm" className="py-4" />;

  return (
    <div className="space-y-3 pt-2">
      {status && <StatusBanner type={status.type} msg={status.msg} />}

      {/* Senha temporária gerada */}
      {tempPassword && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-amber-800">
            ⚠️ Senha temporária gerada para {tempPassword.email}
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm font-mono bg-white border border-amber-200 rounded px-2 py-1 text-slate-800">
              {showPassword ? tempPassword.password : '••••••••••••'}
            </code>
            <button onClick={() => setShowPassword(v => !v)}
              className="p-1.5 text-amber-600 hover:bg-amber-100 rounded">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button onClick={() => handleCopy(tempPassword.password)}
              className="p-1.5 text-amber-600 hover:bg-amber-100 rounded">
              {copied ? <CheckCircle className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-amber-600">
            Compartilhe esta senha com o usuário por canal seguro. Ela já está ativa.
          </p>
          <button onClick={() => setTempPassword(null)}
            className="text-[10px] text-amber-500 hover:text-amber-700">
            Fechar
          </button>
        </div>
      )}

      {/* Adicionar membro */}
      {showAddForm ? (
        <form onSubmit={handleAddMember} className="flex items-end gap-2 flex-wrap bg-blue-50 border border-blue-100 rounded-lg p-2.5">
          <div className="flex-1 min-w-40">
            <label className="block text-[10px] font-medium text-slate-600 mb-0.5">E-mail do usuário</label>
            <input
              type="email" required
              value={addForm.email}
              onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
              placeholder="usuario@email.com"
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Role</label>
            <select
              value={addForm.role}
              onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}
              className="px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="member">Membro</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={adding}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
            {adding ? 'Adicionando...' : 'Adicionar'}
          </button>
          <button type="button" onClick={() => setShowAddForm(false)}
            className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      ) : (
        <button onClick={() => setShowAddForm(true)}
          className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
          <UserPlus className="w-3.5 h-3.5" /> Adicionar membro
        </button>
      )}

      {members.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-3">Nenhum membro.</p>
      ) : (
        <div className="space-y-2">
          {members.map((m: any) => (
            <div key={m.user_id} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <Avatar name={m.full_name || m.email} size="xs" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-900 truncate">{m.full_name || m.email}</p>
                <p className="text-[10px] text-slate-400 truncate">{m.email}</p>
              </div>
              <Badge variant={m.role === 'admin' ? 'blue' : 'default'}>{m.role}</Badge>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => handleSendReset(m.user_id, m.email)}
                  disabled={actionLoading === m.user_id + '_reset'}
                  title="Enviar email de redefinição de senha"
                  className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-50"
                >
                  {actionLoading === m.user_id + '_reset'
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Mail className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleGeneratePassword(m.user_id)}
                  disabled={actionLoading === m.user_id + '_pass'}
                  title="Gerar senha temporária"
                  className="p-1.5 text-amber-500 hover:bg-amber-50 rounded-lg disabled:opacity-50"
                >
                  {actionLoading === m.user_id + '_pass'
                    ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    : <Key className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── CompaniesTab principal ───────────────────────────────────────────────────
const CompaniesTab: React.FC = () => {
  const [companies, setCompanies]     = useState<CompanyResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [expandedPanel, setExpandedPanel] = useState<Record<string, 'members' | 'plan' | 'tokens'>>({});
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editForm, setEditForm]       = useState<any>({});
  const [saving, setSaving]           = useState(false);
  const [showCreate, setShowCreate]   = useState(false);
  const [newForm, setNewForm]         = useState({ name: '', slug: '' });
  const [creating, setCreating]       = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<CompanyResponse | null>(null);
  const [status, setStatus]           = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setCompanies(await getMyCompanies()); }
    catch { setCompanies([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await createCompany({ name: newForm.name, slug: newForm.slug });
      setCompanies(prev => [...prev, created]);
      setNewForm({ name: '', slug: '' });
      setShowCreate(false);
      flash('success', `Empresa "${created.name}" criada!`);
    } catch (e: any) {
      flash('error', e.message || 'Erro ao criar empresa.');
    } finally { setCreating(false); }
  };

  const startEdit = async (c: CompanyResponse) => {
    // Busca dados completos da empresa
    try {
      const full = await getCompanyById(c.id);
      setEditForm(full);
    } catch {
      setEditForm({ name: c.name, slug: c.slug });
    }
    setEditingId(c.id);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    try {
      const updated = await updateCompany(id, editForm);
      setCompanies(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c));
      setEditingId(null);
      flash('success', 'Empresa atualizada!');
    } catch (e: any) {
      flash('error', e.message || 'Erro ao salvar.');
    } finally { setSaving(false); }
  };

  const handleToggleActive = async (c: CompanyResponse) => {
    setConfirmToggle(null);
    try {
      const updated = await toggleCompanyActive(c.id);
      setCompanies(prev => prev.map(x => x.id === c.id ? { ...x, ...(updated as any) } : x));
      flash('success', `Empresa ${(updated as any).is_active ? 'ativada' : 'inativada'}!`);
    } catch (e: any) {
      flash('error', e.message || 'Erro ao alterar status.');
    }
  };

  const inputCls = 'w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelCls = 'block text-[10px] font-medium text-slate-600 mb-0.5';

  const INDUSTRIES_LABELS: Record<string, string> = {
    marketing: 'Marketing e Publicidade', educacao: 'Educação e Treinamento',
    varejo: 'Varejo e E-commerce', saude: 'Saúde e Bem-estar',
    imobiliario: 'Imobiliário', gastronomia: 'Gastronomia e Alimentação',
    moda: 'Moda e Beleza', tecnologia: 'Tecnologia',
    financeiro: 'Financeiro e Contabilidade', juridico: 'Jurídico',
    entretenimento: 'Entretenimento e Mídia', esportes: 'Esportes e Fitness',
    turismo: 'Turismo e Hospitalidade', ong: 'ONG e Terceiro Setor', outro: 'Outro',
  };

  return (
    <div className="space-y-4">
      {status && <StatusBanner type={status.type} msg={status.msg} />}

      {/* Criar empresa */}
      {showCreate ? (
        <SectionCard title="Nova empresa">
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
                <input value={newForm.name}
                  onChange={e => setNewForm(f => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))}
                  required placeholder="Ex: Minha Empresa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Slug</label>
                <input value={newForm.slug}
                  onChange={e => setNewForm(f => ({ ...f, slug: e.target.value }))}
                  required placeholder="minha-empresa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                {creating ? 'Criando...' : 'Criar empresa'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">
                Cancelar
              </button>
            </div>
          </form>
        </SectionCard>
      ) : (
        <div className="flex justify-end">
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            <Plus className="w-4 h-4" /> Nova empresa
          </button>
        </div>
      )}

      {/* Lista */}
      <SectionCard
        title={`Empresas (${companies.length})`}
        action={
          <button onClick={load} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
        padding="p-0"
      >
        {loading ? <LoadingSpinner fullArea /> : companies.length === 0 ? (
          <EmptyState icon={Building2} title="Nenhuma empresa cadastrada." />
        ) : (
          <div className="divide-y divide-slate-100">
            {companies.map(c => {
              const isEditing  = editingId === c.id;
              const isExpanded = expandedId === c.id;

              return (
                <div key={c.id} className={`transition-colors ${!c.is_active ? 'opacity-60' : ''}`}>
                  {/* Linha principal */}
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50">
                    <Avatar name={c.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-slate-900 truncate">{c.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{c.slug}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {(c as any).industry && (
                          <span className="text-[10px] text-slate-400">
                            {INDUSTRIES_LABELS[(c as any).industry] ?? (c as any).industry}
                          </span>
                        )}
                        {(c as any).email && (
                          <span className="text-[10px] text-slate-400">{(c as any).email}</span>
                        )}
                      </div>
                    </div>
                    <Badge variant={c.is_active ? 'green' : 'red'}>
                      {c.is_active ? 'Ativa' : 'Inativa'}
                    </Badge>
                    <div className="flex gap-1 shrink-0">
                      {/* Expandir membros */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        title="Gerenciar membros"
                        className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                      >
                        <Users className="w-3.5 h-3.5" />
                        {isExpanded
                          ? <ChevronUp className="w-3 h-3 inline ml-0.5" />
                          : <ChevronDown className="w-3 h-3 inline ml-0.5" />}
                      </button>
                      {/* Editar */}
                      {isEditing ? (
                        <>
                          <button onClick={() => saveEdit(c.id)} disabled={saving}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50">
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setEditingId(null)}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button onClick={() => startEdit(c)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {/* Ativar/Inativar */}
                      <button
                        onClick={() => setConfirmToggle(c)}
                        title={c.is_active ? 'Inativar empresa' : 'Ativar empresa'}
                        className={`p-1.5 rounded-lg ${c.is_active
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'}`}
                      >
                        {c.is_active ? <PowerOff className="w-3.5 h-3.5" /> : <Power className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Formulário de edição */}
                  {isEditing && (
                    <div className="px-4 pb-4 bg-blue-50 border-t border-blue-100">
                      <p className="text-xs font-semibold text-slate-700 mt-3 mb-2">Editar cadastro completo</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div><label className={labelCls}>Nome fantasia</label>
                          <input value={editForm.name ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, name: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Slug</label>
                          <input value={editForm.slug ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, slug: e.target.value }))} className={`${inputCls} font-mono`} /></div>
                        <div><label className={labelCls}>Razão social</label>
                          <input value={editForm.legal_name ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, legal_name: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>CNPJ/CPF</label>
                          <input value={editForm.document ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, document: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>E-mail comercial</label>
                          <input value={editForm.email ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, email: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Telefone</label>
                          <input value={editForm.phone ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, phone: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Site</label>
                          <input value={editForm.website ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, website: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>Cidade</label>
                          <input value={editForm.address_city ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, address_city: e.target.value }))} className={inputCls} /></div>
                        <div><label className={labelCls}>UF</label>
                          <input value={editForm.address_state ?? ''} onChange={e => setEditForm((f: any) => ({ ...f, address_state: e.target.value }))} className={inputCls} maxLength={2} /></div>
                      </div>
                    </div>
                  )}

                  {/* Painel expandido com sub-abas */}
                  {isExpanded && (() => {
                    const panel = expandedPanel[c.id] ?? 'members';
                    const setPanel = (p: 'members' | 'plan' | 'tokens') =>
                      setExpandedPanel(prev => ({ ...prev, [c.id]: p }));
                    return (
                      <div className="px-4 pb-3 bg-slate-50 border-t border-slate-100">
                        {/* Sub-tabs */}
                        <div className="flex gap-1 mt-2 mb-2">
                          {(['members', 'plan', 'tokens'] as const).map(p => (
                            <button key={p} onClick={() => setPanel(p)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                                panel === p ? 'bg-slate-700 text-white' : 'text-slate-500 hover:bg-slate-200'
                              }`}>
                              {p === 'members' ? 'Membros' : p === 'plan' ? 'Plano' : 'API Tokens'}
                            </button>
                          ))}
                        </div>
                        {panel === 'members' && <CompanyMembersPanel companyId={c.id} />}
                        {panel === 'plan'    && <CompanyPlanPanel companyId={c.id} />}
                        {panel === 'tokens'  && <ApiTokensPanel companyId={c.id} />}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* Confirm toggle */}
      <ConfirmDialog
        open={!!confirmToggle}
        title={confirmToggle?.is_active ? 'Inativar empresa' : 'Ativar empresa'}
        description={`${confirmToggle?.is_active ? 'Inativar' : 'Ativar'} a empresa "${confirmToggle?.name}"?`}
        confirmLabel={confirmToggle?.is_active ? 'Inativar' : 'Ativar'}
        variant={confirmToggle?.is_active ? 'danger' : 'primary'}
        onConfirm={() => confirmToggle && handleToggleActive(confirmToggle)}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
};

export default CompaniesTab;
