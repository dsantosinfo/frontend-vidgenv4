// src/components/Company/BrandPresetEditor.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Upload, Loader2, ImageIcon, Type } from 'lucide-react';
import { createCompanyPreset, updateCompanyPreset, extractPalette, getCompanyPresets, apiRequest } from '../../config/api';
import { DecorativeElement } from '../../types';
import DecorativeElementsPanel from '../VideoEditor/DecorativeElementsPanel';
import { StatusBanner } from '../ui';

export type PresetType = 'palette' | 'text_style' | 'decorative_set';

interface BrandPreset {
  id: string;
  name: string;
  type: PresetType;
  config: Record<string, any>;
}

interface Props {
  companyId: string;
  preset?: BrandPreset | null;
  defaultType?: PresetType;
  onSaved: () => void;
  onCancel: () => void;
}

const defaultConfig: Record<PresetType, Record<string, any>> = {
  palette: { colors: ['#000000', '#ffffff'] },
  text_style: { font_size: 48, fill: { type: 'solid', color: '#ffffff' }, alignment: 'center' },
  decorative_set: { elements: [] },
};

const BrandPresetEditor: React.FC<Props> = ({ companyId, preset, defaultType = 'palette', onSaved, onCancel }) => {
  const [name, setName] = useState(preset?.name ?? '');
  const [type, setType] = useState<PresetType>(preset?.type ?? defaultType);
  const [config, setConfig] = useState<Record<string, any>>(preset?.config ?? defaultConfig[defaultType]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [palettes, setPalettes] = useState<any[]>([]);

  useEffect(() => {
    getCompanyPresets(companyId, 'palette')
      .then(data => setPalettes(data ?? []))
      .catch(() => {});
  }, [companyId]);

  const handleTypeChange = (t: PresetType) => {
    setType(t);
    if (!preset) setConfig(defaultConfig[t]);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Nome obrigatório.'); return; }
    setSaving(true);
    setError('');
    try {
      if (preset) {
        await updateCompanyPreset(companyId, preset.id, { name, config });
      } else {
        await createCompanyPreset(companyId, { name, type, config });
      }
      onSaved();
    } catch (e: any) {
      setError(e.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  // --- Palette editor ---
  const PaletteEditor = () => {
    const colors: string[] = config.colors ?? [];
    const setColors = (c: string[]) => setConfig(prev => ({ ...prev, colors: c }));
    const [extracting, setExtracting] = useState(false);
    const [imgPreview, setImgPreview] = useState<string | null>(null);
    const [numColors, setNumColors] = useState(8);
    const imgRef = useRef<HTMLInputElement>(null);

    const handleExtract = async (file: File) => {
      setImgPreview(URL.createObjectURL(file));
      setExtracting(true);
      try {
        const data = await extractPalette(file, { num_colors: numColors, min_percent: 3, palette_type: 'full' });
        const extracted: string[] = (data?.palette ?? []).map((p: any) => p.hex);
        if (extracted.length > 0) setColors(extracted);
      } catch (e: any) {
        setError(e.message || 'Erro ao extrair paleta.');
      } finally {
        setExtracting(false);
      }
    };

    return (
      <div className="space-y-4">
        {/* Extração por imagem */}
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-purple-500" /> Extrair de imagem
          </p>
          <div className="flex items-center gap-3">
            <label
              className={`flex items-center gap-2 px-3 py-2 text-xs rounded-lg border cursor-pointer transition-colors ${
                extracting ? 'opacity-50 pointer-events-none' : 'border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              {extracting
                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Extraindo...</>
                : <><Upload className="w-3.5 h-3.5" /> Selecionar imagem</>
              }
              <input
                ref={imgRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleExtract(e.target.files[0])}
              />
            </label>
            <div className="flex items-center gap-1.5">
              <label className="text-xs text-slate-500">Nº cores</label>
              <input
                type="number" min={2} max={20} value={numColors}
                onChange={e => setNumColors(Number(e.target.value))}
                className="w-14 px-2 py-1 border border-slate-300 rounded text-xs"
              />
            </div>
            {imgPreview && (
              <img src={imgPreview} alt="" className="w-10 h-10 rounded object-cover border border-slate-200" />
            )}
          </div>
        </div>

        {/* Cores manuais */}
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2">Cores da paleta</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  type="color" value={c}
                  onChange={e => setColors(colors.map((x, j) => j === i ? e.target.value : x))}
                  className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5"
                />
                {colors.length > 1 && (
                  <button onClick={() => setColors(colors.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() => setColors([...colors, '#888888'])}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
            >
              <Plus className="w-3.5 h-3.5" /> Cor
            </button>
          </div>
        </div>
      </div>
    );
  };

  // --- Text style editor ---
  const TextStyleEditor = () => {
    const update = useCallback((k: string, v: any) => setConfig(prev => ({ ...prev, [k]: v })), []);
    const updateFill = useCallback((color: string) =>
      setConfig(prev => ({ ...prev, fill: { ...(prev.fill ?? {}), type: 'solid', color } })), []);

    const [previewImg, setPreviewImg] = useState<string | null>(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Gera preview com debounce sempre que config muda
    useEffect(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoadingPreview(true);
        try {
          const payload = {
            text: name || 'Texto de exemplo',
            font_size: Math.round(config.font_size ?? 48),
            fill: config.fill ?? { type: 'solid', color: '#ffffff' },
            font: config.font ?? null,
            position: { x: 'center', y: 'center' },
            animation: null,
            alignment: config.alignment ?? 'center',
            line_height: config.line_height ?? 1.2,
            background_color: null,
            background_opacity: 0.5,
            border_color: null,
            border_width: 0,
            background_padding: 20,
            background_border_radius: 0,
            stroke_color: config.stroke_color ?? null,
            stroke_width: Math.round(config.stroke_width ?? 0),
            shadow: config.shadow ?? null,
            margin_bottom: 20,
            max_width: 800,
          };
          const data = await apiRequest('/api/v1/previews/text', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
          if (data?.preview_image) setPreviewImg(data.preview_image);
        } catch {
          // silencia erros de preview
        } finally {
          setLoadingPreview(false);
        }
      }, 500);
      return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [config, name]);

    const fillColor = config.fill?.color ?? '#ffffff';

    return (
      <div className="space-y-4">
        {/* Preview */}
        <div className="relative min-h-[80px] bg-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
          {loadingPreview && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-700/80">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
          {previewImg
            ? <img src={previewImg} alt="preview" className="max-w-full max-h-32 object-contain" />
            : !loadingPreview && <p className="text-xs text-slate-400 flex items-center gap-1.5"><Type className="w-3.5 h-3.5" /> Preview aparecerá aqui</p>
          }
        </div>

        {/* Paletas da empresa como predefinições de cor */}
        {palettes.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-600 mb-2">Cores das paletas da empresa</p>
            <div className="space-y-1.5">
              {palettes.map((p: any) => (
                <div key={p.id} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-20 truncate shrink-0">{p.name}</span>
                  <div className="flex gap-1 flex-wrap">
                    {(p.config?.colors ?? []).map((c: string, i: number) => (
                      <button
                        key={i} title={c}
                        onClick={() => updateFill(c)}
                        className={`w-6 h-6 rounded border-2 hover:scale-110 transition-transform ${
                          fillColor === c ? 'border-blue-500' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Controles */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Tamanho ({config.font_size ?? 48}px)</label>
            <input type="range" min={10} max={200} value={config.font_size ?? 48}
              onChange={e => update('font_size', parseInt(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Alinhamento</label>
            <select value={config.alignment ?? 'center'} onChange={e => update('alignment', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-sm">
              <option value="left">Esquerda</option>
              <option value="center">Centro</option>
              <option value="right">Direita</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Cor do texto</label>
            <div className="flex items-center gap-2">
              <input type="color" value={fillColor}
                onChange={e => updateFill(e.target.value)}
                className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5" />
              <span className="text-xs font-mono text-slate-500">{fillColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Cor do contorno</label>
            <div className="flex items-center gap-2">
              <input type="color" value={config.stroke_color ?? '#000000'}
                onChange={e => update('stroke_color', e.target.value)}
                className="w-9 h-9 rounded border border-slate-300 cursor-pointer p-0.5" />
              <input type="number" min={0} max={20} value={config.stroke_width ?? 0}
                onChange={e => update('stroke_width', parseInt(e.target.value))}
                className="w-14 px-2 py-1 border border-slate-300 rounded text-xs" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Decorative set editor ---
  const DecorativeSetEditor = () => {
    const elements: DecorativeElement[] = config.elements ?? [];
    const setElements = (els: DecorativeElement[]) =>
      setConfig(prev => ({ ...prev, elements: els }));
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-500">
          Configure os elementos que farão parte deste conjunto. Ao aplicar o preset no editor, eles serão adicionados à composição.
        </p>
        <DecorativeElementsPanel elements={elements} onChange={setElements} />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-900">{preset ? 'Editar preset' : 'Novo preset'}</h4>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Nome</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Ex: Paleta Principal"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Tipo</label>
          <select
            value={type} onChange={e => handleTypeChange(e.target.value as PresetType)}
            disabled={!!preset}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm disabled:bg-slate-50"
          >
            <option value="palette">Paleta de cores</option>
            <option value="text_style">Estilo de texto</option>
            <option value="decorative_set">Conjunto decorativo</option>
          </select>
        </div>
      </div>

      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        {type === 'palette' && <PaletteEditor />}
        {type === 'text_style' && <TextStyleEditor />}
        {type === 'decorative_set' && <DecorativeSetEditor />}
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
        <button
          onClick={handleSave} disabled={saving}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  );
};

export default BrandPresetEditor;
