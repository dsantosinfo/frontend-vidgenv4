// src/components/Company/CompanySelector.tsx
import React, { useState } from 'react';
import { Building2, ChevronRight, Plus, LogOut } from 'lucide-react';
import { CompanyResponse } from '../../config/api';
import { useBranding } from '../../context/BrandingContext';
import AppLogo from '../AppLogo';

interface CompanySelectorProps {
  companies: CompanyResponse[];
  onSelect: (company: CompanyResponse) => void;
  onCreateNew: () => void;
  onLogout: () => void;
  isLoading?: boolean;
}

const ROLE_LABEL: Record<string, string> = {
  admin: 'Admin',
  member: 'Membro',
};

const CompanySelector: React.FC<CompanySelectorProps> = ({
  companies,
  onSelect,
  onCreateNew,
  onLogout,
  isLoading = false,
}) => {
  const { branding } = useBranding();
  const [selecting, setSelecting] = useState<string | null>(null);

  const btnStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${branding.color_from}, ${branding.color_to})`,
  };

  const handleSelect = async (company: CompanyResponse) => {
    setSelecting(company.id);
    await onSelect(company);
    setSelecting(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AppLogo size={52} iconOnly variant="gradient" />
          </div>
          <h1 className="text-3xl font-bold text-white">{branding.app_name}</h1>
          <p className="text-slate-400 mt-1">Selecione a empresa para continuar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Lista de empresas */}
          <div className="divide-y divide-slate-100">
            {companies.map(company => {
              const isSelecting = selecting === company.id;
              return (
                <button
                  key={company.id}
                  onClick={() => handleSelect(company)}
                  disabled={!!selecting || isLoading}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors disabled:opacity-60 text-left"
                >
                  {/* Avatar da empresa */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                    style={btnStyle}
                  >
                    {company.name[0].toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{company.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono">{company.slug}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                        {ROLE_LABEL[company.member_role] ?? company.member_role}
                      </span>
                    </div>
                  </div>

                  {/* Ação */}
                  {isSelecting ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              onClick={onCreateNew}
              disabled={!!selecting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Nova empresa
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySelector;
