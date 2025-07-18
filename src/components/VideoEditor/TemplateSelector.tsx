import React from 'react';
import { Monitor, Smartphone, Square, Youtube, BookText as TikTok } from 'lucide-react';
import { VideoTemplate } from '../../types';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const templates: VideoTemplate[] = [
  {
    name: 'instagram_feed',
    width: 1080,
    height: 1350,
    fps: 24,
    aspectRatio: '4:5',
    description: 'Perfeito para posts do feed do Instagram'
  },
  {
    name: 'instagram_story',
    width: 1080,
    height: 1920,
    fps: 24,
    aspectRatio: '9:16',
    description: 'Otimizado para Stories do Instagram'
  },
  {
    name: 'facebook_feed',
    width: 1200,
    height: 630,
    fps: 24,
    aspectRatio: '16:9',
    description: 'Posts do feed do Facebook'
  },
  {
    name: 'youtube_thumbnail',
    width: 1280,
    height: 720,
    fps: 24,
    aspectRatio: '16:9',
    description: 'Miniaturas de vídeos do YouTube'
  },
  {
    name: 'tiktok',
    width: 1080,
    height: 1920,
    fps: 24,
    aspectRatio: '9:16',
    description: 'Vídeos verticais do TikTok'
  },
  {
    name: 'custom',
    width: 1920,
    height: 1080,
    fps: 24,
    aspectRatio: '16:9',
    description: 'Dimensões personalizadas'
  }
];

const getIcon = (templateName: string) => {
  switch (templateName) {
    case 'instagram_feed':
    case 'instagram_story':
      return Square;
    case 'tiktok':
      return Smartphone;
    case 'youtube_thumbnail':
      return Youtube;
    default:
      return Monitor;
  }
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Escolha o Template de Vídeo</h2>
        <p className="text-slate-600">Selecione o formato perfeito para seu conteúdo de vídeo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = getIcon(template.name);
          const isSelected = selectedTemplate === template.name;
          
          return (
            <button
              key={template.name}
              onClick={() => onTemplateChange(template.name)}
              className={`group p-6 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                  : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${
                  isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`font-semibold ${
                    isSelected ? 'text-blue-900' : 'text-slate-900'
                  }`}>
                    {template.name.replace('_', ' ').toUpperCase()}
                  </h3>
                  <p className="text-sm text-slate-600">{template.aspectRatio}</p>
                </div>
              </div>
              
              <p className={`text-sm mb-3 ${
                isSelected ? 'text-blue-800' : 'text-slate-600'
              }`}>
                {template.description}
              </p>
              
              <div className="flex justify-between text-xs text-slate-500">
                <span>{template.width} × {template.height}</span>
                <span>{template.fps} FPS</span>
              </div>
              
              {isSelected && (
                <div className="mt-3 px-3 py-1 bg-blue-500 text-white text-xs rounded-full inline-block">
                  Selecionado
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TemplateSelector;