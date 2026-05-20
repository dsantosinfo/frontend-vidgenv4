// src/components/VideoEditor/index.tsx
import React, { useState } from 'react';
import { VideoConfig } from '../../types';
import EditorTabs, { VideoEditorTab } from './EditorTabs';
import TemplateSelector from './TemplateSelector';
import SceneEditor from './SceneEditor';
import AudioEditor from './AudioEditor';
import DecorativeElementsEditor from './DecorativeElementsEditor';
import ConfigManager from './ConfigManager';
import GenerateButton from './GenerateButton';
import ScenePreview from './ScenePreview';
import { Eye } from 'lucide-react';
import { PreviewModal } from '../ui';

interface VideoEditorProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({
  config, onConfigChange, isGenerating, onGeneratingChange,
}) => {
  const [activeTab, setActiveTab] = useState<VideoEditorTab>('scenes');
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  const isScenes = activeTab === 'scenes';
  const activeScene = config.scenes[Math.min(activeSceneIndex, config.scenes.length - 1)];

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <EditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Esquerda: conteúdo scrollável — 60% */}
        <div className="flex-[3] overflow-y-auto p-3 bg-slate-50 min-w-0">
          {activeTab === 'template' && (
            <TemplateSelector
              selectedTemplate={config.template}
              onTemplateChange={t => onConfigChange({ ...config, template: t })}
              editorType="video"
              onLoadUserTemplate={raw => {
                const unwrap = (c: any): any => c?.config ? unwrap(c.config) : c;
                const cfg = unwrap(raw);
                if (cfg?.scenes) onConfigChange(cfg);
              }}
            />
          )}
          {activeTab === 'scenes' && (
            <SceneEditor
              config={config}
              onConfigChange={onConfigChange}
              activeSceneIndex={activeSceneIndex}
              onActiveSceneChange={setActiveSceneIndex}
            />
          )}
          {activeTab === 'decorative' && (
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-slate-700 mb-1">Elementos Decorativos Globais</p>
              <p className="text-xs text-slate-500 mb-3">Aparecem em todas as cenas do vídeo.</p>
              <DecorativeElementsEditor
                config={config}
                onDecorativeElementsChange={els => onConfigChange({ ...config, decorative_elements: els })}
              />
            </div>
          )}
          {activeTab === 'audio' && (
            <AudioEditor
              musicaConfig={config.musica}
              onMusicaChange={musica => onConfigChange({ ...config, musica })}
            />
          )}
          {activeTab === 'config' && (
            <div className="max-w-2xl">
              <p className="text-xs font-semibold text-slate-700 mb-3">Gerenciador de Configurações</p>
              <ConfigManager config={config} onConfigChange={onConfigChange} />
            </div>
          )}
        </div>

        {/* Direita: preview — 40%, desktop, em todas as abas com cena */}
        {activeScene && (
          <div className="hidden lg:flex flex-[2] border-l border-slate-200 bg-slate-50 p-3 min-w-0 h-full">
            <ScenePreview
              scene={activeScene}
              template={config.template}
              decorativeElements={config.decorative_elements}
            />
          </div>
        )}
      </div>

      {/* Botão gerar */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 shrink-0">
        <GenerateButton
          config={config}
          isGenerating={isGenerating}
          onGeneratingChange={onGeneratingChange}
        />
      </div>

      {/* Botão flutuante de preview — mobile */}
      {activeScene && (
        <button
          onClick={() => setPreviewOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 z-40 flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-full shadow-lg text-xs font-medium"
        >
          <Eye className="w-4 h-4" /> Preview
        </button>
      )}

      {/* Modal de preview — mobile */}
      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Preview da Cena">
        {activeScene && (
          <ScenePreview
            scene={activeScene}
            template={config.template}
            decorativeElements={config.decorative_elements}
          />
        )}
      </PreviewModal>
    </div>
  );
};

export default VideoEditor;
