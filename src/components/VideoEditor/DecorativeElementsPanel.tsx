// src/components/VideoEditor/DecorativeElementsPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Settings, Plus, Move, Percent, Eye, ChevronsUpDown, Loader2 } from 'lucide-react';
import { DecorativeElement, FileUploadRecord, FilePurpose } from '../../types';
import { apiRequest, uploadFile } from '../../config/api';

interface Props {
  elements: DecorativeElement[];
  onChange: (elements: DecorativeElement[]) => void;
}

const POSITIONS = [
  { id: 'top_left',    label: 'Superior Esquerda' },
  { id: 'top_right',   label: 'Superior Direita'  },
  { id: 'top_center',  label: 'Centro Superior'   },
  { id: 'bottom_left', label: 'Inferior Esquerda' },
  { id: 'bottom_right',label: 'Inferior Direita'  },
];

const DecorativeElementsPanel: React.FC<Props> = ({ elements, onChange }) => {
  const [imageFiles, setImageFiles] = useState<FileUploadRecord[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLoadingImages(true);
    apiRequest('/api/v1/files/list_uploads')
      .then((data: FileUploadRecord[]) => {
        setImageFiles(Array.isArray(data) ? data.filter(f => f.file_type === 'image') : []);
      })
      .catch(() => setImageFiles([]))
      .finally(() => setLoadingImages(false));
  }, []);

  // Mantém selectedIndex válido quando a lista muda
  useEffect(() => {
    if (selectedIndex === null && elements.length > 0) setSelectedIndex(0);
    if (selectedIndex !== null && selectedIndex >= elements.length) {
      setSelectedIndex(elements.length > 0 ? elements.length - 1 : null);
    }
  }, [elements, selectedIndex]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await uploadFile(file, FilePurpose.DECORATIVE_ELEMENT);
      const data: FileUploadRecord[] = await apiRequest('/api/v1/files/list_uploads');
      setImageFiles(Array.isArray(data) ? data.filter(f => f.file_type === 'image') : []);
    } catch (err: any) {
      alert(`Falha no upload: ${err.message}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addElement = (file: FileUploadRecord) => {
    const el: DecorativeElement = {
      id: `deco_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      path: file.file_path,   // usa file_path para que a URL seja resolvida corretamente
      base64: null,
      position: 'top_right',
      width_ratio: null,
      size_ratio: 0.15,
      offset_y: 0,
      opacity: 1.0,
    };
    onChange([...elements, el]);
    setSelectedIndex(elements.length);
  };

  const updateElement = (index: number, updates: Partial<DecorativeElement>) => {
    const next = [...elements];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const removeElement = (index: number) => {
    onChange(elements.filter((_, i) => i !== index));
  };

  const previewSrc = (el: DecorativeElement) =>
    el.base64 ?? (el.path ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${el.path}` : '');

  // Monta URL correta usando file_path (inclui slug da empresa quando necessário)
  const fileSrc = (file: FileUploadRecord) =>
    `${import.meta.env.VITE_API_BASE_URL}/uploads/${file.file_path}`;

  const selected = selectedIndex !== null ? elements[selectedIndex] : null;

  return (
    <div className="space-y-4">
      {/* Lista de elementos na composição */}
      <div>
        <p className="text-xs font-medium text-slate-700 mb-2">Elementos na composição</p>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {elements.length === 0 ? (
            <div className="text-center py-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs">
              Nenhum elemento adicionado.
            </div>
          ) : elements.map((el, i) => (
            <div
              key={el.id}
              onClick={() => setSelectedIndex(i)}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                selectedIndex === i ? 'bg-purple-50 border-purple-400' : 'hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="w-8 h-8 bg-slate-100 rounded overflow-hidden shrink-0">
                <img src={previewSrc(el)} alt="" className="w-full h-full object-cover" />
              </div>
              <p className="flex-1 text-xs text-slate-700 truncate">{el.path || 'Imagem'}</p>
              <button
                onClick={e => { e.stopPropagation(); removeElement(i); }}
                className="p-1 text-slate-400 hover:text-red-500"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Controles do elemento selecionado */}
      {selected && selectedIndex !== null && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
          <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-purple-600" /> Editar elemento selecionado
          </p>

          <div>
            <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1"><Move className="w-3 h-3" /> Posição</label>
            <select
              value={selected.position}
              onChange={e => updateElement(selectedIndex, { position: e.target.value as DecorativeElement['position'] })}
              className="w-full p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
            >
              {POSITIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1">
              <Percent className="w-3 h-3" /> Tamanho ({Math.round(selected.size_ratio * 100)}%)
            </label>
            <input
              type="range" min={0.01} max={1} step={0.01}
              value={selected.size_ratio}
              onChange={e => updateElement(selectedIndex, { size_ratio: parseFloat(e.target.value), width_ratio: null })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1">
              <Eye className="w-3 h-3" /> Opacidade ({Math.round(selected.opacity * 100)}%)
            </label>
            <input
              type="range" min={0} max={1} step={0.05}
              value={selected.opacity}
              onChange={e => updateElement(selectedIndex, { opacity: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-600 mb-1 flex items-center gap-1">
              <ChevronsUpDown className="w-3 h-3" /> Deslocamento vertical (offset_y)
            </label>
            <input
              type="number"
              value={selected.offset_y}
              onChange={e => updateElement(selectedIndex, { offset_y: parseInt(e.target.value) || 0 })}
              className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>
      )}

      {/* Biblioteca de imagens */}
      <div>
        <p className="text-xs font-medium text-slate-700 mb-2">Adicionar da biblioteca</p>
        {loadingImages ? (
          <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-slate-400" /></div>
        ) : (
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-300 rounded-lg text-slate-400 hover:border-purple-400 hover:bg-purple-50 transition-colors text-xs gap-1"
            >
              <Upload className="w-5 h-5" />
              Upload
            </button>
            {imageFiles.map(file => (
              <div
                key={file.id}
                onClick={() => addElement(file)}
                className="group relative aspect-square border border-slate-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-all"
              >
                <img
                  src={fileSrc(file)}
                  alt={file.original_filename}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      </div>
    </div>
  );
};

export default DecorativeElementsPanel;
