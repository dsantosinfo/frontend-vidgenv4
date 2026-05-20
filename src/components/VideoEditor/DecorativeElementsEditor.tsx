// File: src/components/VideoEditor/DecorativeElementsEditor.tsx
import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { DecorativeElement, VideoConfig, ImageConfig } from '../../types';
import { getCompanyPresets } from '../../config/api';
import DecorativeElementsPanel from './DecorativeElementsPanel';
import { useCompany } from '../../context/CompanyContext';

interface DecorativeElementsEditorProps {
  config: VideoConfig | ImageConfig;
  onDecorativeElementsChange: (elements: DecorativeElement[]) => void;
}

const DecorativeElementsEditor: React.FC<DecorativeElementsEditorProps> = ({
  config,
  onDecorativeElementsChange
}) => {
  const { decorative_elements } = config;
  const { activeCompany } = useCompany();
  const [decoPresets, setDecoPresets] = useState<any[]>([]);

  useEffect(() => {
    if (activeCompany) {
      getCompanyPresets(activeCompany.id, 'decorative_set')
        .then(data => setDecoPresets(data ?? []))
        .catch(() => {});
    }
  }, [activeCompany]);

  return (
    <div className="space-y-3">

      {/* Presets da empresa */}
      {decoPresets.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-3">
          <h3 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Conjuntos da empresa
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {decoPresets.map((p: any) => (
              <button
                key={p.id}
                onClick={() => {
                  const elements: DecorativeElement[] = (p.config?.elements ?? [])
                    .map((el: DecorativeElement) => ({ ...el, id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}` }));
                  if (elements.length > 0) onDecorativeElementsChange(elements);
                }}
                className="px-2.5 py-1 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 p-3">
        <DecorativeElementsPanel
          elements={decorative_elements}
          onChange={onDecorativeElementsChange}
        />
      </div>

    </div>
  );
};

export default DecorativeElementsEditor;
