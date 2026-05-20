// src/components/VideoEditor/TemplateSelector.tsx
import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Square, Youtube, Download, RefreshCw } from 'lucide-react';
import { VIDEO_TEMPLATES } from '../../config/templates';
import { listUserTemplates } from '../../config/api';
import { UserTemplateResponse } from '../../types';
import { LoadingSpinner, EmptyState } from '../ui';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
  /** Tipo de editor — filtra templates personalizados por tipo */
  editorType?: 'video' | 'image';
  /** Callback para carregar um template personalizado no editor */
  onLoadUserTemplate?: (config: Record<string, any>) => void;
}

const ICONS: Record<string, React.ElementType> = {
  instagram_feed: Square,
  instagram_story: Square,
  tiktok: Smartphone,
  youtube_thumbnail: Youtube,
};

const getTemplateType = (config: Record<string, any>): 'video' | 'image' => {
  const unwrap = (c: any): any => c?.config ? unwrap(c.config) : c;
  return unwrap(config)?.scenes ? 'video' : 'image';
};

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateChange,
  editorType,
  onLoadUserTemplate,
}) => {
  const [userTemplates, setUserTemplates] = useState<UserTemplateResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!onLoadUserTemplate) return;
    setLoading(true);
    listUserTemplates()
      .then(data => setUserTemplates(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = editorType
    ? userTemplates.filter(t => getTemplateType(t.config) === editorType)
    : userTemplates;

  return (
    <div className="space-y-4">
      {/* Grid de templates de formato */}
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
                <div className={`p-1.5 rounded ${
                  active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-semibold truncate ${
                    active ? 'text-blue-800' : 'text-slate-800'
                  }`}>{t.description}</p>
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

      {/* Templates personalizados */}
      {onLoadUserTemplate && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-600">Templates personalizados</p>
            <button
              onClick={() => {
                setLoading(true);
                listUserTemplates().then(setUserTemplates).catch(() => {}).finally(() => setLoading(false));
              }}
              className="p-1 text-slate-400 hover:bg-slate-100 rounded"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <LoadingSpinner size="sm" className="py-3" />
          ) : filtered.length === 0 ? (
            <p className="text-[10px] text-slate-400 py-2">
              Nenhum template salvo. Crie em Configurações → Templates.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {filtered.map(t => (
                <button
                  key={t.id}
                  onClick={() => onLoadUserTemplate(t.config)}
                  className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-left transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(t.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <Download className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateSelector;
