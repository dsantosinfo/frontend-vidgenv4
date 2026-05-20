// src/components/Sidebar.tsx
import React from 'react';
import {
  Video, Files, Image as ImageIcon,
  Settings, Shield, User,
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import AppLogo from './AppLogo';
import { useBranding } from '../context/BrandingContext';
import { useAuth } from '../context/useAuth';

export type ViewType =
  | 'editor' | 'imageEditor' | 'videos'
  | 'company-settings'
  | 'admin'
  | 'profile';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  /** Desktop: sidebar colapsada para ícones */
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  /** Mobile: drawer aberto */
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavItem {
  id: ViewType;
  icon: React.ElementType;
  label: string;
}

const CREATION_ITEMS: NavItem[] = [
  { id: 'editor',      icon: Video,     label: 'Editor de Vídeo' },
  { id: 'imageEditor', icon: ImageIcon, label: 'Gerador de Imagens' },
  { id: 'videos',      icon: Files,     label: 'Vídeos Gerados' },
];

const COMPANY_ITEMS: NavItem[] = [
  { id: 'company-settings', icon: Settings, label: 'Configurações' },
];

const ADMIN_ITEMS: NavItem[] = [
  { id: 'admin', icon: Shield, label: 'Administração' },
];

const NavGroup: React.FC<{
  label?: string;
  items: NavItem[];
  currentView: ViewType;
  onViewChange: (v: ViewType) => void;
  isCollapsed: boolean;
  activeStyle: React.CSSProperties;
  onItemClick: () => void;
}> = ({ label, items, currentView, onViewChange, isCollapsed, activeStyle, onItemClick }) => (
  <div className="space-y-0.5">
    {label && !isCollapsed && (
      <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </p>
    )}
    {isCollapsed && label && <div className="my-1 mx-3 border-t border-slate-100" />}
    {items.map(({ id, icon: Icon, label: itemLabel }) => {
      const active = currentView === id;
      return (
        <button
          key={id}
          onClick={() => { onViewChange(id); onItemClick(); }}
          title={isCollapsed ? itemLabel : undefined}
          style={active ? activeStyle : undefined}
          className={`w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 ${
            isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
          } ${
            active
              ? 'text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <span className="text-sm font-medium leading-tight truncate">{itemLabel}</span>
          )}
        </button>
      );
    })}
  </div>
);

const SidebarContent: React.FC<{
  currentView: ViewType;
  onViewChange: (v: ViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onItemClick: () => void;
  showAdmin: boolean;
}> = ({ currentView, onViewChange, isCollapsed, onToggleCollapse, onItemClick, showAdmin }) => {
  const { branding } = useBranding();
  const activeStyle: React.CSSProperties = {
    background: `linear-gradient(to right, ${branding.color_from}, ${branding.color_to})`,
  };

  const navProps = { currentView, onViewChange, isCollapsed, activeStyle, onItemClick };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className={`border-b border-slate-200 flex items-center shrink-0 ${isCollapsed ? 'justify-center p-3' : 'p-3'}`}>
        {isCollapsed
          ? <AppLogo size={28} iconOnly variant="gradient" />
          : <AppLogo size={28} variant="light" />
        }
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        <NavGroup label="Criação" items={CREATION_ITEMS} {...navProps} />
        <NavGroup label="Empresa" items={COMPANY_ITEMS} {...navProps} />
        {showAdmin && <NavGroup label="Admin" items={ADMIN_ITEMS} {...navProps} />}

        {/* Perfil no fundo */}
        <div className="pt-2 mt-2 border-t border-slate-100">
          {(() => {
            const active = currentView === 'profile';
            return (
              <button
                onClick={() => { onViewChange('profile'); onItemClick(); }}
                title={isCollapsed ? 'Meu Perfil' : undefined}
                style={active ? activeStyle : undefined}
                className={`w-full flex items-center gap-2.5 rounded-lg transition-all duration-150 ${
                  isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2'
                } ${active ? 'text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                <User className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">Meu Perfil</span>}
              </button>
            );
          })()}
        </div>
      </nav>

      {/* Toggle collapse — apenas desktop */}
      <div className="border-t border-slate-200 p-2 shrink-0">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-lg transition-colors text-xs"
        >
          {isCollapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <><ChevronLeft className="w-3.5 h-3.5" /><span>Recolher</span></>
          }
        </button>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  currentView, onViewChange,
  isCollapsed, onToggleCollapse,
  mobileOpen, onMobileClose,
}) => {
  const { user } = useAuth();
  const showAdmin = user?.role === 'owner' || user?.role === 'superadmin';

  const contentProps = {
    currentView, onViewChange, isCollapsed, onToggleCollapse, showAdmin,
  };

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────── */}
      <aside
        className={`hidden md:flex flex-col h-screen border-r border-slate-200 transition-all duration-300 shrink-0 ${
          isCollapsed ? 'w-14' : 'w-56'
        }`}
      >
        <SidebarContent {...contentProps} onItemClick={() => {}} />
      </aside>

      {/* ── Mobile drawer overlay ────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside className="relative z-50 w-56 flex flex-col shadow-xl">
            <SidebarContent
              {...contentProps}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onItemClick={onMobileClose}
            />
            <button
              onClick={onMobileClose}
              className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
