// src/components/ApiTokensPanel.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Copy, CheckCircle, Eye, EyeOff, RefreshCw, Key } from 'lucide-react';
import {
  listApiTokens, createApiToken, revokeApiToken,
  ApiTokenResponse, ApiTokenCreatedResponse,
} from '../config/api';
import { StatusBanner, EmptyState, LoadingSpinner, ConfirmDialog, Badge } from './ui';

interface ApiTokensPanelProps {
  companyId: string;
}

const ApiTokensPanel: React.FC<ApiTokensPanelProps> = ({ companyId }) => {
  const [tokens, setTokens] = useState<ApiTokenResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [newToken, setNewToken] = useState<ApiTokenCreatedResponse | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', expires_at: '' });
  const [creating, setCreating] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState<ApiTokenResponse | null>(null);

  const flash = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try { setTokens(await listApiTokens(companyId)); }
    catch { setTokens([]); }
    finally { setLoading(false); }
  }, [companyId]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const result = await createApiToken(companyId, {
        name: form.name,
        expires_at: form.expires_at || null,
      });
      setNewToken(result);
      setShowToken(false);
      setCopied(false);
      setShowForm(false);
      setForm({ name: '', expires_at: '' });
      await load();
    } catch (err: any) {
      flash('error', err.message || 'Erro ao criar token.');
    } finally { setCreating(false); }
  };

  const handleRevoke = async (t: ApiTokenResponse) => {
    setConfirmRevoke(null);
    try {
      await revokeApiToken(companyId, t.id);
      flash('success', `Token "${t.name}" revogado.`);
      await load();
    } catch (err: any) {
      flash('error', err.message || 'Erro ao revogar token.');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = 'w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500';

  return (
    <div className="space-y-3">
      {status && <StatusBanner type={status.type} msg={status.msg} />}

      {/* Token recém-criado */}
      {newToken && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5" /> Token criado — copie agora, não será exibido novamente
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-white border border-amber-200 rounded px-2 py-1.5 text-slate-800 truncate">
              {showToken ? newToken.token : '••••••••••••••••••••••••••••••••••••'}
            </code>
            <button onClick={() => setShowToken(v => !v)}
              className="p-1.5 text-amber-600 hover:bg-amber-100 rounded shrink-0">
              {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => handleCopy(newToken.token)}
              className="p-1.5 text-amber-600 hover:bg-amber-100 rounded shrink-0">
              {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button onClick={() => setNewToken(null)} className="text-[10px] text-amber-500 hover:text-amber-700">
            Fechar
          </button>
        </div>
      )}

      {/* Formulário de criação */}
      {showForm ? (
        <form onSubmit={handleCreate} className="bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-slate-700">Novo token de API</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Nome / descrição</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Integração Zapier" className={inputCls} />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Expiração (opcional)</label>
              <input type="datetime-local" value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className={inputCls} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-50">
              {creating ? 'Criando...' : 'Criar token'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <button onClick={load} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700">
            <Plus className="w-3.5 h-3.5" /> Novo token
          </button>
        </div>
      )}

      {/* Lista */}
      {loading ? <LoadingSpinner size="sm" className="py-4" /> : tokens.length === 0 ? (
        <EmptyState icon={Key} title="Nenhum token criado." description="Crie um token para integrar com APIs externas." />
      ) : (
        <div className="space-y-1.5">
          {tokens.map(t => (
            <div key={t.id} className={`flex items-center gap-3 p-2.5 rounded-lg border ${t.is_active ? 'border-slate-200 bg-white' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
              <Key className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-medium text-slate-900 truncate">{t.name}</p>
                  <Badge variant={t.is_active ? 'green' : 'red'}>{t.is_active ? 'Ativo' : 'Revogado'}</Badge>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Criado {new Date(t.created_at).toLocaleDateString('pt-BR')}
                  {t.created_by_email && ` por ${t.created_by_email}`}
                  {t.last_used_at && ` · Último uso: ${new Date(t.last_used_at).toLocaleDateString('pt-BR')}`}
                  {t.expires_at && ` · Expira: ${new Date(t.expires_at).toLocaleDateString('pt-BR')}`}
                </p>
              </div>
              {t.is_active && (
                <button onClick={() => setConfirmRevoke(t)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmRevoke}
        title="Revogar token"
        description={`Revogar o token "${confirmRevoke?.name}"? Integrações que usam este token deixarão de funcionar.`}
        confirmLabel="Revogar"
        variant="danger"
        onConfirm={() => confirmRevoke && handleRevoke(confirmRevoke)}
        onCancel={() => setConfirmRevoke(null)}
      />
    </div>
  );
};

export default ApiTokensPanel;
