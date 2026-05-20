// src/components/Header.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Menu, LogOut, ChevronDown, Building2, Settings } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import { useCompany } from '../context/CompanyContext';
import { BRAND } from '../config/branding';
import { Avatar } from './ui';
import type { ViewType } from './Sidebar';

interface HeaderProps {
  currentView: ViewType;
  onToggleSidebar: () => void;
  onViewChange: (view: ViewType) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onToggleSidebar, onViewChange }) => {
  const { user, logout } = useAuth();
  const { companies, activeCompany, switchCompany } = useCompany();
  const [companyOpen, setCompanyOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const companyRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const view = BRAND.viewTitles[currentView] ?? { title: 'VidGen', description: '' };
  const hasMultiple = companies.length > 1;

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (companyRef.current && !companyRef.current.contains(e.target as Node)) setCompanyOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-12 bg-white border-b border-slate-200 flex items-center px-3 gap-3 shrink-0">

      {/* Botão menu mobile */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Título da view */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{view.title}</p>
      </div>

      {/* Empresa ativa */}
      {activeCompany && (
        <div className="relative" ref={companyRef}>
          <button
            onClick={() => hasMultiple && setCompanyOpen(v => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 rounded-lg text-xs transition-colors ${
              hasMultiple ? 'hover:bg-slate-200 cursor-pointer' : 'cursor-default'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-medium text-slate-700 max-w-[100px] truncate hidden sm:block">
              {activeCompany.name}
            </span>
            {hasMultiple && (
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${companyOpen ? 'rotate-180' : ''}`} />
            )}
          </button>

          {companyOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
              <p className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                Suas empresas
              </p>
              <div className="max-h-56 overflow-y-auto">
                {companies.map(c => (
                  <button
                    key={c.id}
                    onClick={async () => { setCompanyOpen(false); await switchCompany(c); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors ${
                      c.id === activeCompany.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Avatar name={c.name} size="xs" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 truncate">{c.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">{c.slug}</p>
                    </div>
                    {c.id === activeCompany.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 p-1.5">
                <button
                  onClick={() => { setCompanyOpen(false); onViewChange('company-settings'); }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Configurações da empresa
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Avatar + dropdown do usuário */}
      {user && (
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(v => !v)}
            className="flex items-center gap-1.5 p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Avatar name={user.full_name || user.email} size="xs" />
            <span className="text-xs text-slate-700 max-w-[80px] truncate hidden sm:block">
              {user.full_name || user.email}
            </span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
          </button>

          {userOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <p className="text-xs font-medium text-slate-900 truncate">{user.full_name || user.email}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
              <button
                onClick={() => { setUserOpen(false); onViewChange('profile'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Avatar name={user.full_name || user.email} size="xs" />
                Meu perfil
              </button>
              <div className="border-t border-slate-100 p-1.5">
                <button
                  onClick={() => { setUserOpen(false); logout(); }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
