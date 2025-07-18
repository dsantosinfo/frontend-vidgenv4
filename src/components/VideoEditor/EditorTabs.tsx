// File: src/components/VideoEditor/EditorTabs.tsx

import React from 'react';
// <<< Ícones importados >>>
import { Monitor, Layers, Music, Settings, Sparkles } from 'lucide-react';

interface EditorTabsProps {
  // <<< CORREÇÃO: Adicionado 'decorative' aos tipos de aba permitidos >>>
  activeTab: 'template' | 'scenes' | 'decorative' | 'audio' | 'config';
  onTabChange: (tab: 'template' | 'scenes' | 'decorative' | 'audio' | 'config') => void;
}

const EditorTabs: React.FC<EditorTabsProps> = ({ activeTab, onTabChange }) => {
  // <<< CORREÇÃO: Nova aba "Decorativos" e renomeação da aba "Áudio" >>>
  const tabs = [
    { id: 'template' as const, label: 'Template', icon: Monitor },
    { id: 'scenes' as const, label: 'Cenas', icon: Layers },
    { id: 'decorative' as const, label: 'Decorativos', icon: Sparkles },
    { id: 'audio' as const, label: 'Áudio Global', icon: Music },
    { id: 'config' as const, label: 'Configuração', icon: Settings }
  ];

  return (
    <div className="flex border-b border-slate-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all duration-200 ${
              isActive
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default EditorTabs;