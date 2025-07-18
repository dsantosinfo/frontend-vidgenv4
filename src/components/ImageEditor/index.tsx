// File: src/components/ImageEditor/index.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState } from 'react';
import { ImageConfig, TextElement } from '../../types';
import { Palette, Type, Sparkles, Plus, Settings } from 'lucide-react';

import ImageEditorTabs, { ImageEditorTab } from './ImageEditorTabs';
import TemplateSelector from '../VideoEditor/TemplateSelector';
import BackgroundEditor from '../VideoEditor/BackgroundEditor';
import TextElementEditor from '../VideoEditor/TextElementEditor';
import DecorativeElementsEditor from '../VideoEditor/DecorativeElementsEditor';
import GenerateImageButton from './GenerateImageButton';
import ImagePreview from './ImagePreview';
import ImageConfigManager from './ImageConfigManager'; // Importa o novo componente

interface ImageEditorProps {
  config: ImageConfig;
  onConfigChange: (config: ImageConfig) => void;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
  config,
  onConfigChange,
  isGenerating,
  onGeneratingChange
}) => {
  const [activeTab, setActiveTab] = useState<ImageEditorTab>('background');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  const handleSceneChange = (updates: Partial<ImageConfig['scene']>) => {
    onConfigChange({ ...config, scene: { ...config.scene, ...updates } });
  };

  const handleTextElementChange = (index: number, updatedElement: TextElement) => {
    const newTextElements = [...config.scene.text_elements];
    newTextElements[index] = updatedElement;
    handleSceneChange({ text_elements: newTextElements });
  };

  const addTextElement = () => {
    const newTextElement: TextElement = { text: 'Novo Texto', font_size: 48, fill: { type: 'solid', color: '#000000', gradient_colors: [], gradient_angle: 90, image_path: null }, font: null, position: { x: 'center', y: 'auto' }, animation: null, alignment: 'center', line_height: 1.2, background_color: null, background_opacity: 0.5, border_color: null, border_width: 0, background_padding: 20, background_border_radius: 0, stroke_color: null, stroke_width: 0, shadow: null, margin_bottom: 20 };
    handleSceneChange({ text_elements: [...config.scene.text_elements, newTextElement] });
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'template':
        return <TemplateSelector selectedTemplate={config.template} onTemplateChange={(template) => onConfigChange({ ...config, template })} />;
      case 'background':
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Palette size={18} className="text-green-600"/>Fundo da Imagem</h3>
            <BackgroundEditor background={config.scene.background} onBackgroundChange={(bg) => handleSceneChange({ background: bg })} />
          </div>
        );
      case 'text':
        return (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Type size={18} className="text-orange-600"/>Elementos de Texto</h3>
              <button onClick={addTextElement} className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"><Plus className="w-4 h-4" /> Adicionar</button>
            </div>
            <div className="space-y-4">
              {config.scene.text_elements.map((el, index) => <TextElementEditor key={index} textElement={el} onTextElementChange={(updatedEl) => handleTextElementChange(index, updatedEl)} elementIndex={index} sceneTextElements={config.scene.text_elements} />)}
              {config.scene.text_elements.length === 0 && <div className="text-center py-8 text-slate-500">Nenhum elemento de texto adicionado.</div>}
            </div>
          </div>
        );
      case 'decorative':
        return (
           <div className="bg-white rounded-xl border border-slate-200 p-6">
             <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Sparkles size={18} className="text-purple-600"/>Elementos Decorativos</h3>
             <DecorativeElementsEditor config={config} onDecorativeElementsChange={(elements) => onConfigChange({ ...config, decorative_elements: elements })} />
           </div>
        );
      // NOVA RENDERIZAÇÃO PARA A ABA DE CONFIGURAÇÃO
      case 'config':
        return <ImageConfigManager config={config} onConfigChange={onConfigChange} />;
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <ImageEditorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 p-6 bg-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {renderActiveTabContent()}
          </div>
          <div>
            <ImagePreview config={config} isGenerating={isGenerating} />
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-slate-200 p-6">
        <div className="max-w-md mx-auto">
          <GenerateImageButton config={config} isGenerating={isGenerating} onGeneratingChange={onGeneratingChange} onImageGenerated={setGeneratedImageUrl} />
          {generatedImageUrl && (
            <a href={generatedImageUrl} download="imagem-gerada.png" className="block text-center mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Baixar Imagem Gerada</a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;