// src/components/Admin/AdminPage.tsx
import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { Tabs } from '../ui';
import CompaniesTab from './CompaniesTab';
import GlobalUsersTab from './GlobalUsersTab';
import GlobalBrandingTab from './GlobalBrandingTab';
import PlansTab from './PlansTab';
import FontsTab from './FontsTab';

type AdminTab = 'companies' | 'users' | 'plans' | 'branding' | 'fonts';

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<AdminTab>('companies');

  const isAdmin = user?.role === 'owner' || user?.role === 'superadmin';

  if (!isAdmin) {
    return (
      <div className="p-3 max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
          <Shield className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <p className="font-semibold text-yellow-800">Acesso restrito</p>
          <p className="text-sm text-yellow-600 mt-1">
            Apenas owners e superadmins podem acessar a administração global.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 w-full space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">Administração Global</h2>
        <p className="text-xs text-slate-500 mt-0.5">Gerencie empresas, usuários, planos e o branding da aplicação</p>
      </div>

      <Tabs
        tabs={[
          { id: 'companies', label: 'Empresas' },
          { id: 'users',     label: 'Usuários' },
          { id: 'plans',     label: 'Planos' },
          { id: 'branding',  label: 'Branding Global' },
          { id: 'fonts',     label: 'Fontes' },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'companies' && <CompaniesTab />}
      {tab === 'users'     && <GlobalUsersTab />}
      {tab === 'plans'     && <PlansTab />}
      {tab === 'branding'  && <GlobalBrandingTab />}
      {tab === 'fonts'     && <FontsTab />}
    </div>
  );
};

export default AdminPage;
