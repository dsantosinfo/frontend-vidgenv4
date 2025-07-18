// File: src/components/VideoEditor/index.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState } from 'react';
import { VideoConfig } from '../../types';
import EditorTabs from './EditorTabs';
import TemplateSelector from './TemplateSelector';
import SceneEditor from './SceneEditor';
import AudioEditor from './AudioEditor';
import DecorativeElementsEditor from './DecorativeElementsEditor';
import ConfigManager from './ConfigManager';
import GenerateButton from './GenerateButton';

interface VideoEditorProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({
  config,
  onConfigChange,
  isGenerating,
  onGeneratingChange
}) => {
  const [activeTab, setActiveTab] = useState<'template' | 'scenes' | 'decorative' | 'audio' | 'config'>('scenes');

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200">
        <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
      
      {/* CORREÇÃO PRINCIPAL: A div abaixo NÃO DEVE ter 'overflow-auto'. A rolagem é gerenciada pelo componente <main> em MainContent.tsx */}
      <div className="flex-1 p-6 bg-slate-50">
        {activeTab === 'template' && (
          <TemplateSelector 
            selectedTemplate={config.template}
            onTemplateChange={(template) => 
              onConfigChange({ ...config, template })
            }
          />
        )}
        
        {activeTab === 'scenes' && (
          <SceneEditor 
            config={config}
            onConfigChange={onConfigChange}
          />
        )}

        {activeTab === 'decorative' && (
          <div className="max-w-7xl mx-auto">
             <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Elementos Decorativos Globais</h2>
              <p className="text-slate-600">Adicione imagens (logos, marcas d'água) que aparecerão em todo o vídeo.</p>
            </div>
            <DecorativeElementsEditor 
              config={config}
              onDecorativeElementsChange={(elements) => 
                onConfigChange({ ...config, decorative_elements: elements })
              }
            />
          </div>
        )}
        
        {activeTab === 'audio' && (
          <AudioEditor 
            musicaConfig={config.musica}
            onMusicaChange={(musica) => 
              onConfigChange({ ...config, musica })
            }
          />
        )}

        {activeTab === 'config' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Gerenciador de Configurações</h2>
              <p className="text-slate-600">Exporte, importe ou copie suas configurações de vídeo</p>
            </div>
            <ConfigManager 
              config={config}
              onConfigChange={onConfigChange}
            />
          </div>
        )}
      </div>
      
      <div className="bg-white border-t border-slate-200 p-6">
        <GenerateButton 
          config={config}
          isGenerating={isGenerating}
          onGeneratingChange={onGeneratingChange}
        />
      </div>
    </div>
  );
};

export default VideoEditor;