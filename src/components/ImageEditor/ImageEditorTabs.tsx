// File: src/components/ImageEditor/ImageEditorTabs.tsx
// Substitua o conteúdo completo deste arquivo.

import React from 'react';
import { LayoutTemplate, Palette, Type, Sparkles, Settings } from 'lucide-react';

// Define os tipos de abas possíveis para o editor de imagens
export type ImageEditorTab = 'template' | 'background' | 'text' | 'decorative' | 'config';

interface ImageEditorTabsProps {
  activeTab: ImageEditorTab;
  onTabChange: (tab: ImageEditorTab) => void;
}

const ImageEditorTabs: React.FC<ImageEditorTabsProps> = ({ activeTab, onTabChange }) => {
  // Configuração das abas com seus respectivos ícones e rótulos
  const tabs = [
    { id: 'template' as const, label: 'Template', icon: LayoutTemplate },
    { id: 'background' as const, label: 'Fundo', icon: Palette },
    { id: 'text' as const, label: 'Texto', icon: Type },
    { id: 'decorative' as const, label: 'Decorativos', icon: Sparkles },
    { id: 'config' as const, label: 'Configuração', icon: Settings } // NOVA ABA
  ];

  return (
    <div className="flex border-b border-slate-200 bg-white">
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

export default ImageEditorTabs;