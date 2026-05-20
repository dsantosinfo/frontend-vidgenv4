import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { apiRequest, changePassword } from '../config/api';
import { StatusBanner, SectionCard } from './ui';

const UserProfile: React.FC = () => {
  const { user, logout } = useAuth();

  // --- Nome ---
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameStatus, setNameStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // --- Senha ---
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingName(true);
    setNameStatus(null);
    try {
      await apiRequest('/api/v1/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ full_name: fullName.trim() || null }),
      });
      setNameStatus({ type: 'success', msg: 'Nome atualizado com sucesso!' });
    } catch (err: any) {
      setNameStatus({ type: 'error', msg: err.message || 'Erro ao atualizar nome.' });
    } finally {
      setSavingName(false);
      setTimeout(() => setNameStatus(null), 3000);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'As senhas não coincidem.' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordStatus({ type: 'success', msg: 'Senha alterada com sucesso! Faça login novamente.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => logout(), 2500);
    } catch (err: any) {
      setPasswordStatus({ type: 'error', msg: err.message || 'Erro ao alterar senha.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const roleLabel: Record<string, string> = {
    owner: 'Owner',
    superadmin: 'Super Admin',
    user: 'Usuário',
  };

  return (
    <div className="p-3 sm:p-4 w-full space-y-3 sm:space-y-4">

      {/* Avatar + info */}
      <SectionCard>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-bold shrink-0">
            {(user?.full_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{user?.full_name || '—'}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
              {roleLabel[user?.role || 'user']}
            </span>
          </div>
        </div>
      </SectionCard>

      {/* Editar nome */}
      <SectionCard
        title="Informações Pessoais"
        description="Atualize seu nome de exibição"
      >
        <form onSubmit={handleSaveName} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-400 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">O e-mail não pode ser alterado.</p>
          </div>

          {nameStatus && <StatusBanner type={nameStatus.type} msg={nameStatus.msg} />}

          <button
            type="submit"
            disabled={savingName}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {savingName ? 'Salvando...' : 'Salvar nome'}
          </button>
        </form>
      </SectionCard>

      {/* Alterar senha */}
      <SectionCard
        title="Alterar Senha"
        description="Você será desconectado após a alteração"
      >
        <form onSubmit={handleChangePassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha atual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nova senha</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">Mín. 8 caracteres, maiúscula, minúscula, número e caractere especial.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {passwordStatus && <StatusBanner type={passwordStatus.type} msg={passwordStatus.msg} />}

          <button
            type="submit"
            disabled={savingPassword}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {savingPassword ? 'Alterando...' : 'Alterar senha'}
          </button>
        </form>
      </SectionCard>

    </div>
  );
};

export default UserProfile;
