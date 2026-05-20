// src/components/ImageEditor/index.tsx
import React, { useState } from 'react';
import { ImageConfig, TextElement } from '../../types';
import { Plus, Trash2 } from 'lucide-react';
import ImageEditorTabs, { ImageEditorTab } from './ImageEditorTabs';
import TemplateSelector from '../VideoEditor/TemplateSelector';
import BackgroundEditor from '../VideoEditor/BackgroundEditor';
import TextElementEditor from '../VideoEditor/TextElementEditor';
import DecorativeElementsEditor from '../VideoEditor/DecorativeElementsEditor';
import GenerateImageButton from './GenerateImageButton';
import ImagePreview from './ImagePreview';
import ImageConfigManager from './ImageConfigManager';
import { SectionCard } from '../ui';

interface ImageEditorProps {
  config: ImageConfig;
  onConfigChange: (config: ImageConfig) => void;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  config, onConfigChange, isGenerating, onGeneratingChange,
}) => {
  const [activeTab, setActiveTab] = useState<ImageEditorTab>('background');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleSceneChange = (updates: Partial<ImageConfig['scene']>) =>
    onConfigChange({ ...config, scene: { ...config.scene, ...updates } });

  const handleTextChange = (i: number, updated: TextElement) => {
    const els = [...config.scene.text_elements];
    els[i] = updated;
    handleSceneChange({ text_elements: els });
  };

  const addText = () => {
    const el: TextElement = {
      text: 'Novo Texto', font_size: 48,
      fill: { type: 'solid', color: '#000000', gradient_colors: [], gradient_angle: 90, image_path: null },
      font: null, position: { x: 'center', y: 'auto' }, animation: null,
      alignment: 'center', line_height: 1.2, background_color: null,
      background_opacity: 0.5, border_color: null, border_width: 0,
      background_padding: 20, background_border_radius: 0,
      stroke_color: null, stroke_width: 0, shadow: null, margin_bottom: 20,
    };
    handleSceneChange({ text_elements: [...config.scene.text_elements, el] });
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'template':
        return (
          <TemplateSelector
            selectedTemplate={config.template}
            onTemplateChange={t => onConfigChange({ ...config, template: t })}
          />
        );
      case 'background':
        return (
          <SectionCard title="Fundo da Imagem">
            <BackgroundEditor
              background={config.scene.background}
              onBackgroundChange={bg => handleSceneChange({ background: bg })}
            />
          </SectionCard>
        );
      case 'text':
        return (
          <SectionCard
            title="Elementos de Texto"
            action={
              <button onClick={addText}
                className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-medium hover:bg-orange-600">
                <Plus className="w-3 h-3" /> Adicionar
              </button>
            }
          >
            <div className="space-y-2">
              {config.scene.text_elements.map((el, i) => (
                <details key={i} className="border border-slate-200 rounded-lg bg-slate-50/50">
                  <summary className="px-3 py-2 flex items-center justify-between cursor-pointer">
                    <span className="text-xs font-medium text-slate-700 truncate">
                      Texto {i + 1}: "{el.text.substring(0, 18)}{el.text.length > 18 ? '…' : ''}"
                    </span>
                    <button onClick={e => { e.preventDefault(); handleSceneChange({ text_elements: config.scene.text_elements.filter((_, idx) => idx !== i) }); }}
                      className="p-1 text-slate-400 hover:text-red-500 shrink-0">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </summary>
                  <div className="px-3 pb-3 border-t border-slate-200 bg-white pt-2">
                    <TextElementEditor
                      textElement={el}
                      onTextElementChange={updated => handleTextChange(i, updated)}
                      elementIndex={i}
                      sceneTextElements={config.scene.text_elements}
                    />
                  </div>
                </details>
              ))}
              {config.scene.text_elements.length === 0 && (
                <p className="text-center py-4 text-xs text-slate-400">Nenhum elemento de texto.</p>
              )}
            </div>
          </SectionCard>
        );
      case 'decorative':
        return (
          <DecorativeElementsEditor
            config={config}
            onDecorativeElementsChange={elements => onConfigChange({ ...config, decorative_elements: elements })}
          />
        );
      case 'config':
        return <ImageConfigManager config={config} onConfigChange={onConfigChange} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="shrink-0 bg-white border-b border-slate-200">
        <ImageEditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Body split */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Esquerda: scrollável — 60% */}
        <div className="flex-[3] overflow-y-auto p-3 bg-slate-50 min-w-0">
          {renderTab()}
        </div>

        {/* Direita: preview — 40%, apenas desktop */}
        <div className="hidden lg:flex flex-[2] border-l border-slate-200 bg-slate-50 p-3 min-w-0 h-full">
          <ImagePreview config={config} isGenerating={isGenerating} />
        </div>
      </div>

      {/* Botão gerar */}
      <div className="bg-white border-t border-slate-200 px-3 py-2 shrink-0">
        <div className="flex items-center gap-2">
          <GenerateImageButton
            config={config}
            isGenerating={isGenerating}
            onGeneratingChange={onGeneratingChange}
            onImageGenerated={setGeneratedImageUrl}
          />
          {generatedImageUrl && (
            <a href={generatedImageUrl} download="imagem-gerada.png"
              className="shrink-0 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium whitespace-nowrap">
              Baixar
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
