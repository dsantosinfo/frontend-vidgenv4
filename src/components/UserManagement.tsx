import React, { useState, useEffect } from 'react';
import { RefreshCw, UserCheck, UserX, Shield, User, Edit2, Check, X } from 'lucide-react';
import { listUsers, updateUser, deactivateUser } from '../config/api';
import { UserResponse, UserRole } from '../types';
import { useAuth } from '../context/useAuth';

const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  superadmin: 'Super Admin',
  user: 'Usuário',
};

const ROLE_COLORS: Record<UserRole, string> = {
  owner: 'bg-purple-100 text-purple-700',
  superadmin: 'bg-blue-100 text-blue-700',
  user: 'bg-slate-100 text-slate-600',
};

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ full_name: string; role: UserRole }>({ full_name: '', role: 'user' });
  const [saving, setSaving] = useState(false);

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
    if (!confirm(`${u.is_active ? 'Desativar' : 'Reativar'} o usuário ${u.email}?`)) return;
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
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="font-semibold text-yellow-800">Acesso restrito</p>
          <p className="text-sm text-yellow-600 mt-1">Apenas owners e superadmins podem gerenciar usuários.</p>
        </div>
      </div>
    );
  }

  const active = users.filter(u => u.is_active).length;
  const inactive = users.filter(u => !u.is_active).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: users.length, color: 'bg-blue-50 text-blue-700' },
          { label: 'Ativos', value: active, color: 'bg-green-50 text-green-700' },
          { label: 'Inativos', value: inactive, color: 'bg-red-50 text-red-700' },
        ].map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 text-center`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">Usuários Cadastrados</h3>
          <button onClick={fetchUsers} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
        )}

        <div className="overflow-x-auto">
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {(u.full_name || u.email)[0].toUpperCase()}
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.full_name}
                              onChange={e => setEditForm(f => ({ ...f, full_name: e.target.value }))}
                              className="border border-slate-300 rounded px-2 py-0.5 text-sm w-36"
                              placeholder="Nome"
                            />
                          ) : (
                            <p className="font-medium text-slate-900">{u.full_name || '—'}</p>
                          )}
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {isEditing && !isSelf ? (
                        <select
                          value={editForm.role}
                          onChange={e => setEditForm(f => ({ ...f, role: e.target.value as UserRole }))}
                          className="border border-slate-300 rounded px-2 py-0.5 text-sm"
                        >
                          <option value="user">Usuário</option>
                          <option value="superadmin">Super Admin</option>
                          <option value="owner">Owner</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`flex items-center gap-1 text-xs font-medium ${u.is_active ? 'text-green-600' : 'text-red-500'}`}>
                        {u.is_active ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                        {u.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(u.id)}
                              disabled={saving}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                              title="Salvar"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg"
                              title="Cancelar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(u)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!isSelf && (
                              <button
                                onClick={() => toggleActive(u)}
                                className={`p-1.5 rounded-lg ${u.is_active ? 'text-red-500 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                title={u.is_active ? 'Desativar' : 'Reativar'}
                              >
                                {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
            <p className="text-center text-slate-500 text-sm py-10">Nenhum usuário encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
