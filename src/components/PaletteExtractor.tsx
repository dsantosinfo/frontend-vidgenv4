import React, { useState, useEffect } from 'react';
import { Upload, Palette, Copy, Check, Layers } from 'lucide-react';
import { extractPalette, PaletteExtractOptions, getCompanyPresets } from '../config/api';
import { PaletteColorItem, PaletteExtractionResponse } from '../types';
import { useCompany } from '../context/CompanyContext';

interface PaletteExtractorProps {
  onColorSelect?: (hex: string) => void;
}

const PaletteExtractor: React.FC<PaletteExtractorProps> = ({ onColorSelect }) => {
  const { activeCompany } = useCompany();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<PaletteExtractionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [companyPalettes, setCompanyPalettes] = useState<any[]>([]);
  const [options, setOptions] = useState<PaletteExtractOptions>({
    num_colors: 8,
    min_percent: 5,
    tolerance: 40,
    palette_type: 'full',
  });

  useEffect(() => {
    if (activeCompany) {
      getCompanyPresets(activeCompany.id, 'palette')
        .then(data => setCompanyPalettes(data ?? []))
        .catch(() => {});
    }
  }, [activeCompany]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError('');
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await extractPalette(file, options);
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
    onColorSelect?.(hex);
  };

  const palette = result?.palette as PaletteColorItem[] | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Palette className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-slate-900">Extrator de Paleta</h3>
      </div>

      {/* Paletas da empresa */}
      {companyPalettes.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-indigo-500" /> Paletas da empresa
          </p>
          <div className="space-y-2">
            {companyPalettes.map((p: any) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="text-xs text-slate-600 w-24 truncate">{p.name}</span>
                <div className="flex gap-1 flex-wrap">
                  {(p.config?.colors ?? []).map((c: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleCopy(c)}
                      title={c}
                      className="w-6 h-6 rounded border border-slate-200 hover:scale-110 transition-transform"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <hr className="my-3 border-slate-200" />
        </div>
      )}

      {/* Upload */}
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
        {preview ? (
          <img src={preview} alt="preview" className="h-full w-full object-contain rounded-xl p-1" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <Upload className="w-6 h-6" />
            <span className="text-sm">Selecionar imagem</span>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-600 mb-1">Nº de cores</label>
          <input
            type="number" min={2} max={20}
            value={options.num_colors}
            onChange={e => setOptions(o => ({ ...o, num_colors: Number(e.target.value) }))}
            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-600 mb-1">% mínima</label>
          <input
            type="number" min={0} max={50}
            value={options.min_percent}
            onChange={e => setOptions(o => ({ ...o, min_percent: Number(e.target.value) }))}
            className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleExtract}
        disabled={!file || isLoading}
        className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Extraindo...' : 'Extrair Paleta'}
      </button>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Result */}
      {palette && palette.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">
            {result?.metadata.final_color_count} cores • {result?.metadata.processing_time_seconds.toFixed(2)}s
          </p>
          <div className="grid grid-cols-4 gap-2">
            {palette.map((item) => (
              <button
                key={item.hex}
                onClick={() => handleCopy(item.hex)}
                title={`${item.hex} (${item.percentage.toFixed(1)}%)`}
                className="group relative flex flex-col items-center gap-1"
              >
                <div
                  className="w-full h-10 rounded-lg border border-slate-200 shadow-sm group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: item.hex }}
                />
                <span className="text-xs text-slate-600 font-mono">{item.hex}</span>
                {copiedHex === item.hex && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Copiado
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaletteExtractor;
