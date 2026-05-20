import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, UserMinus, Shield } from 'lucide-react';
import { useCompany } from '../../context/CompanyContext';
import { useAuth } from '../../context/useAuth';
import {
  updateCompany,
  getCompanyMembers, addCompanyMember, updateCompanyMemberRole, removeCompanyMember,
  CompanyMemberResponse,
} from '../../config/api';
import BrandPresetList from './BrandPresetList';
import FileManagement from '../FileManagement';
import UserTemplatesManager from '../UserTemplatesManager';
import CompanyProfileTab from './CompanyProfileTab';
import SubscriptionTab from './SubscriptionTab';
import ApiTokensPanel from '../ApiTokensPanel';
import { StatusBanner, Avatar, SectionCard, Tabs, ConfirmDialog } from '../ui';
import type { ViewType } from '../Sidebar';

type Tab = 'identity' | 'profile' | 'subscription' | 'members' | 'files' | 'templates' | 'presets' | 'api-tokens';

interface CompanySettingsPageProps {
  currentVideoConfig?: Record<string, any>;
  currentImageConfig?: Record<string, any>;
  onNavigate?: (view: ViewType) => void;
  onLoadTemplate?: (config: Record<string, any>, type: 'video' | 'image') => void;
}

// ─── Aba Identidade ───────────────────────────────────────────────────────────
const IdentityTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { activeCompany } = useCompany();

  const [form, setForm] = useState({ name: activeCompany?.name ?? '', slug: activeCompany?.slug ?? '' });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3500);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompany(companyId, { name: form.name, slug: form.slug });
      flash('success', 'Configurações salvas!');
    } catch (e: any) {
      flash('error', e.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard title="Informações da empresa">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
            <input
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Slug</label>
            <input
              value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          ℹ️ O branding visual (logo, cores, nome da aplicação) é gerenciado pelo SuperAdmin em Administração → Branding Global.
        </p>

        {status && <StatusBanner type={status.type} msg={status.msg} />}

        <button type="submit" disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </SectionCard>
  );
};

// ─── Aba Membros ──────────────────────────────────────────────────────────────
const MembersTab: React.FC<{ companyId: string }> = ({ companyId }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<CompanyMemberResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [adding, setAdding] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setMembers(await getCompanyMembers(companyId)); }
    catch { setMembers([]); }
    finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await addCompanyMember(companyId, { email, role });
      setEmail('');
      await load();
      flash('success', 'Membro adicionado!');
    } catch (e: any) {
      flash('error', e.message || 'Erro ao adicionar.');
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateCompanyMemberRole(companyId, userId, newRole);
      setMembers(m => m.map(x => x.user_id === userId ? { ...x, role: newRole } : x));
    } catch (e: any) {
      flash('error', e.message || 'Erro ao alterar role.');
    }
  };

  const handleRemove = async (userId: string) => {
    setConfirmRemoveId(null);
    try {
      await removeCompanyMember(companyId, userId);
      setMembers(m => m.filter(x => x.user_id !== userId));
    } catch (e: any) {
      flash('error', e.message || 'Erro ao remover.');
    }
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Adicionar membro">
        <form onSubmit={handleAdd} className="flex gap-3 flex-wrap">
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="email@exemplo.com" required
            className="flex-1 min-w-48 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select value={role} onChange={e => setRole(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="user">Usuário</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" disabled={adding}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            <UserPlus className="w-4 h-4" />
            {adding ? 'Adicionando...' : 'Adicionar'}
          </button>
        </form>
        {status && <div className="mt-3"><StatusBanner type={status.type} msg={status.msg} /></div>}
      </SectionCard>

      <SectionCard title={`Membros (${members.length})`}>
        {loading ? (
          <p className="text-sm text-slate-500 py-2">Carregando...</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl">
                <Avatar name={m.full_name || m.email} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{m.full_name || m.email}</p>
                  <p className="text-xs text-slate-500 truncate">{m.email}</p>
                </div>
                <select
                  value={m.role}
                  onChange={e => handleRoleChange(m.user_id, e.target.value)}
                  disabled={m.user_id === user?.id}
                  className="px-2 py-1 border border-slate-300 rounded-lg text-xs disabled:bg-slate-50"
                >
                  <option value="user">Usuário</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
                {m.user_id !== user?.id && (
                  <button onClick={() => setConfirmRemoveId(m.user_id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={!!confirmRemoveId}
        title="Remover membro"
        description="O membro perderá acesso à empresa."
        confirmLabel="Remover"
        onConfirm={() => confirmRemoveId && handleRemove(confirmRemoveId)}
        onCancel={() => setConfirmRemoveId(null)}
      />
    </div>
  );
};

// ─── Página principal ─────────────────────────────────────────────────────────
const CompanySettingsPage: React.FC<CompanySettingsPageProps> = ({
  currentVideoConfig,
  currentImageConfig,
  onNavigate,
  onLoadTemplate,
}) => {
  const { activeCompany } = useCompany();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('identity');

  // isAdmin: superadmin/owner global OU admin/owner da empresa ativa
  const isGlobalAdmin = user?.role === 'owner' || user?.role === 'superadmin';
  const isCompanyAdmin = activeCompany?.member_role === 'owner' || activeCompany?.member_role === 'admin';
  const isAdmin = isGlobalAdmin || isCompanyAdmin;

  if (!activeCompany) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center text-slate-500">
        Nenhuma empresa selecionada.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="font-semibold text-yellow-800">Acesso restrito</p>
          <p className="text-sm text-yellow-600 mt-1">Apenas admins e owners podem editar as configurações da empresa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 w-full space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">{activeCompany.name}</h2>
        <p className="text-xs text-slate-500 font-mono">{activeCompany.slug}</p>
      </div>

      {/* Tabs — select em mobile, underline em sm+ */}
      <div className="sm:hidden">
        <select
          value={tab}
          onChange={e => setTab(e.target.value as Tab)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="identity">Identidade</option>
          <option value="profile">Cadastro</option>
          <option value="subscription">Assinatura</option>
          <option value="members">Membros</option>
          <option value="files">Arquivos</option>
          <option value="templates">Templates</option>
          <option value="presets">Presets</option>
          <option value="api-tokens">API Tokens</option>
        </select>
      </div>
      <div className="hidden sm:block">
        <Tabs
          tabs={[
            { id: 'identity',     label: 'Identidade' },
            { id: 'profile',      label: 'Cadastro' },
            { id: 'subscription', label: 'Assinatura' },
            { id: 'members',      label: 'Membros' },
            { id: 'files',        label: 'Arquivos' },
            { id: 'templates',    label: 'Templates' },
            { id: 'presets',      label: 'Presets' },
            { id: 'api-tokens',   label: 'API Tokens' },
          ]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'identity'     && <IdentityTab companyId={activeCompany.id} />}
      {tab === 'profile'      && <CompanyProfileTab companyId={activeCompany.id} company={activeCompany} />}
      {tab === 'subscription' && <SubscriptionTab companyId={activeCompany.id} />}
      {tab === 'members'      && <MembersTab companyId={activeCompany.id} />}
      {tab === 'files'        && <FileManagement />}
      {tab === 'templates'    && (
        <UserTemplatesManager
          currentVideoConfig={currentVideoConfig}
          currentImageConfig={currentImageConfig}
          onLoadTemplate={onLoadTemplate}
          onNavigate={onNavigate}
        />
      )}
      {tab === 'presets'      && <BrandPresetList companyId={activeCompany.id} />}
      {tab === 'api-tokens'   && <ApiTokensPanel companyId={activeCompany.id} />}
    </div>
  );
};

export default CompanySettingsPage;
