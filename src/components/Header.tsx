// File: src/components/Header.tsx
// Substitua o conteúdo completo deste arquivo.

import React from 'react';
import { Menu, Video, Loader2, Download, Upload, Image as ImageIcon } from 'lucide-react';

interface HeaderProps {
  currentView: 'editor' | 'imageEditor' | 'videos' | 'files';
  isGenerating: boolean;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, isGenerating, onToggleSidebar }) => {
  const getTitle = () => {
    switch (currentView) {
      case 'editor':
        return 'Editor de Vídeo';
      case 'imageEditor':
        return 'Gerador de Imagens';
      case 'videos':
        return 'Vídeos Gerados';
      case 'files':
        return 'Gerenciamento de Arquivos';
      default:
        return 'Estúdio de Mídia';
    }
  };

  const getDescription = () => {
    switch (currentView) {
      case 'editor':
        return 'Crie vídeos incríveis com ferramentas avançadas de edição';
      case 'imageEditor':
        return 'Crie imagens estáticas com textos e efeitos';
      case 'videos':
        return 'Gerencie e baixe seus vídeos gerados';
      case 'files':
        return 'Faça upload e organize seus arquivos de mídia';
      default:
        return 'Plataforma profissional de criação de mídia';
    }
  };
  
  const getIcon = () => {
      switch (currentView) {
          case 'editor': return <Video className="w-6 h-6 text-white" />;
          case 'imageEditor': return <ImageIcon className="w-6 h-6 text-white" />;
          default: return <Video className="w-6 h-6 text-white" />;
      }
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              {getIcon()}
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{getTitle()}</h1>
              <p className="text-sm text-slate-600">{getDescription()}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isGenerating && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Gerando...</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
