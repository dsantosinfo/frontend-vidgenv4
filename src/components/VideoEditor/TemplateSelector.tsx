// src/components/VideoEditor/TemplateSelector.tsx
import React from 'react';
import { Monitor, Smartphone, Square, Youtube } from 'lucide-react';
import { VIDEO_TEMPLATES } from '../../config/templates';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
}

const ICONS: Record<string, React.ElementType> = {
  instagram_feed: Square,
  instagram_story: Square,
  tiktok: Smartphone,
  youtube_thumbnail: Youtube,
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onTemplateChange }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {Object.values(VIDEO_TEMPLATES).map(t => {
      const Icon = ICONS[t.name] ?? Monitor;
      const active = selectedTemplate === t.name;
      return (
        <button
          key={t.name}
          onClick={() => onTemplateChange(t.name)}
          className={`flex flex-col gap-1.5 p-3 rounded-lg border text-left transition-all ${
            active ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className={`text-xs font-semibold truncate ${active ? 'text-blue-800' : 'text-slate-800'}`}>
                {t.description}
              </p>
              <p className="text-[10px] text-slate-400">{t.aspectRatio} · {t.width}×{t.height}</p>
            </div>
          </div>
          <div className="flex items-end gap-1">
            <div
              className={`rounded-sm ${active ? 'bg-blue-300' : 'bg-slate-200'}`}
              style={{
                width: t.width >= t.height ? 28 : Math.round(28 * t.width / t.height),
                height: t.height >= t.width ? 18 : Math.round(18 * t.height / t.width),
              }}
            />
            {active && <span className="text-[9px] text-blue-500 font-medium">✓ Ativo</span>}
          </div>
        </button>
      );
    })}
  </div>
);

export default TemplateSelector;
