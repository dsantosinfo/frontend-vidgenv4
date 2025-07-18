// File: src/components/Sidebar.tsx
// Substitua o conteúdo completo deste arquivo.

import React from 'react';
import { 
  Video, 
  Files, 
  FolderOpen, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Image as ImageIcon // Novo ícone
} from 'lucide-react';

type ViewType = 'editor' | 'imageEditor' | 'videos' | 'files';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onViewChange, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const menuItems = [
    {
      id: 'editor' as const,
      icon: Video,
      label: 'Editor de Vídeo',
      description: 'Criar novos vídeos'
    },
    // NOVO ITEM DE MENU
    {
      id: 'imageEditor' as const,
      icon: ImageIcon,
      label: 'Gerador de Imagens',
      description: 'Criar imagens estáticas'
    },
    {
      id: 'videos' as const,
      icon: Files,
      label: 'Vídeos Gerados',
      description: 'Visualizar e baixar'
    },
    {
      id: 'files' as const,
      icon: FolderOpen,
      label: 'Gerenciar Arquivos',
      description: 'Gerenciar recursos'
    }
  ];

  return (
    <div className={`bg-white border-r border-slate-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    } flex flex-col relative`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Estúdio de Mídia</h2>
              <p className="text-xs text-slate-600">Criador Profissional</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex justify-center">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                
                {!isCollapsed && (
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${isActive ? 'text-white' : 'text-slate-900'}`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                      {item.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <div className="flex items-center gap-2">
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">Recolher</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
