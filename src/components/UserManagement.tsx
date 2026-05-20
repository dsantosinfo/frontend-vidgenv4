import React, { useState, useEffect } from 'react';
import { RefreshCw, UserCheck, UserX, Edit2, Check, X } from 'lucide-react';
import { listUsers, updateUser, deactivateUser } from '../config/api';
import { UserResponse, UserRole } from '../types';
import { useAuth } from '../context/useAuth';
import { Avatar, Badge, ROLE_BADGE, ROLE_LABEL, EmptyState, LoadingSpinner, SectionCard, ConfirmDialog } from './ui';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ full_name: string; role: UserRole }>({ full_name: '', role: 'user' });
  const [saving, setSaving] = useState(false);
  const [confirmToggle, setConfirmToggle] = useState<UserResponse | null>(null);

  const isAdmin = currentUser?.role === 'owner' || currentUser?.role === 'superadmin';

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await listUsers();
      setUsers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const startEdit = (u: UserResponse) => {
    setEditingId(u.id);
    setEditForm({ full_name: u.full_name || '', role: u.role });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (userId: string) => {
    setSaving(true);
    try {
      const updated = await updateUser(userId, {
        full_name: editForm.full_name || undefined,
        role: editForm.role,
      });
      setUsers(prev => prev.map(u => u.id === userId ? updated : u));
      setEditingId(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: UserResponse) => {
    setConfirmToggle(null);
    try {
      if (u.is_active) {
        await deactivateUser(u.id);
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, is_active: false } : x));
      } else {
        const updated = await updateUser(u.id, { is_active: true });
        setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
      }
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-4">
        <EmptyState
          icon={UserX}
          title="Acesso restrito"
          description="Apenas owners e superadmins podem gerenciar usuários."
        />
      </div>
    );
  }

  const active = users.filter(u => u.is_active).length;
  const inactive = users.filter(u => !u.is_active).length;

  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: users.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Ativos',   value: active,        color: 'bg-green-50 text-green-700' },
          { label: 'Inativos', value: inactive,       color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
            <p className="text-xl font-bold">{s.value}</p>
            <p className="text-xs font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <SectionCard
        title="Usuários Cadastrados"
        action={
          <button onClick={fetchUsers} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
        padding="p-0"
      >

        {error && (
          <div className="mx-4 mt-3 mb-1">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>
          </div>
        )}

        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Usuário</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Papel</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Criado em</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isEditing = editingId === u.id;
                const isSelf = u.id === currentUser?.id;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50 ${!u.is_active ? 'opacity-50' : ''}`}>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <Avatar name={u.full_name || u.email} size="sm" />
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.full_name}
                              onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                              className="border border-slate-300 rounded px-2 py-0.5 text-xs w-32"
                              placeholder="Nome"
                            />
                          ) : (
                            <p className="font-medium text-slate-900 text-xs">{u.full_name || '—'}</p>
                          )}
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {isEditing && !isSelf ? (
                        <select
                          value={editForm.role}
                          onChange={e => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))}
                          className="border border-slate-300 rounded px-2 py-0.5 text-xs"
                        >
                          <option value="user">Usuário</option>
                          <option value="superadmin">Super Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      ) : (
                        <Badge variant={ROLE_BADGE[u.role] ?? 'default'}>
                          {ROLE_LABEL[u.role] ?? u.role}
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant={u.is_active ? 'green' : 'red'}>
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-slate-500 text-[11px]">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(u.id)} disabled={saving} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50" title="Salvar">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={cancelEdit} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg" title="Cancelar">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(u)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => setConfirmToggle(u)}
                                className={`p-1.5 rounded-lg ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                title={u.is_active ? 'Desativar' : 'Reativar'}
                              >
                                {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {users.length === 0 && !isLoading && (
            <EmptyState icon={UserCheck} title="Nenhum usuário encontrado." className="py-8" />
          )}
        </div>

        {/* Cards mobile (< sm) */}
        <div className="sm:hidden divide-y divide-slate-100">
          {users.map(u => {
            const isSelf = u.id === currentUser?.id;
            return (
              <div key={u.id} className={`p-3 space-y-2 ${!u.is_active ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar name={u.full_name || u.email} size="sm" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{u.full_name || u.email}</p>
                      <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant={ROLE_BADGE[u.role] ?? 'default'}>{ROLE_LABEL[u.role] ?? u.role}</Badge>
                    <Badge variant={u.is_active ? 'green' : 'red'}>{u.is_active ? 'Ativo' : 'Inativo'}</Badge>
                  </div>
                </div>
                {!isSelf && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(u)}
                      className="flex-1 py-1.5 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setConfirmToggle(u)}
                      className={`flex-1 py-1.5 text-xs rounded-lg ${
                        u.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {u.is_active ? 'Desativar' : 'Reativar'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {users.length === 0 && !isLoading && (
            <EmptyState icon={UserCheck} title="Nenhum usuário encontrado." className="py-8" />
          )}
        </div>
      </SectionCard>

      <ConfirmDialog
        open={!!confirmToggle}
        title={confirmToggle?.is_active ? 'Desativar usuário' : 'Reativar usuário'}
        description={`${confirmToggle?.is_active ? 'Desativar' : 'Reativar'} ${confirmToggle?.email}?`}
        confirmLabel={confirmToggle?.is_active ? 'Desativar' : 'Reativar'}
        variant={confirmToggle?.is_active ? 'danger' : 'primary'}
        onConfirm={() => confirmToggle && toggleActive(confirmToggle)}
        onCancel={() => setConfirmToggle(null)}
      />
    </div>
  );
};

export default UserManagement;
