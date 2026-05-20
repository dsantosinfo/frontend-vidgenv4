// src/components/Company/CreateCompanyPage.tsx
import React, { useState } from 'react';
import { Building2, AlertCircle } from 'lucide-react';
import { createCompany, CompanyResponse } from '../../config/api';
import { useBranding } from '../../context/BrandingContext';
import AppLogo from '../AppLogo';

interface CreateCompanyPageProps {
  onCreated: (company: CompanyResponse) => void;
}

const CreateCompanyPage: React.FC<CreateCompanyPageProps> = ({ onCreated }) => {
  const { branding } = useBranding();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const btnStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${branding.color_from}, ${branding.color_to})`,
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    setError('');
    setIsLoading(true);
    try {
      const company = await createCompany({ name: name.trim(), slug: slug.trim() });
      onCreated(company);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar empresa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AppLogo size={52} iconOnly variant="gradient" />
          </div>
          <h1 className="text-3xl font-bold text-white">{branding.app_name}</h1>
          <p className="text-slate-400 mt-1">Bem-vindo! Vamos criar sua empresa.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Criar empresa</h2>
              <p className="text-sm text-slate-500">Configure sua primeira empresa para começar</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome da empresa</label>
              <input
                type="text"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="Minha Empresa"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Identificador único (slug)</label>
              <div className="flex items-center border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 overflow-hidden">
                <span className="px-3 py-2 bg-slate-50 text-slate-400 text-sm border-r border-slate-300 select-none">
                  empresa/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  placeholder="minha-empresa"
                  required
                  className="flex-1 px-3 py-2 focus:outline-none text-sm font-mono"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Apenas letras minúsculas, números e hífens.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !name.trim() || !slug.trim()}
              style={btnStyle}
              className="w-full py-2.5 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {isLoading ? 'Criando...' : 'Criar empresa e entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCompanyPage;
