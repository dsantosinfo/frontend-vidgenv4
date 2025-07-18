// File: src/components/VideoEditor/DecorativeElementsEditor.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState, useRef, useEffect } from 'react';
import { Upload, Trash2, Settings, Plus, Move, Percent, Eye, ChevronsUpDown, Image as ImageIcon, Loader2 } from 'lucide-react';
import { DecorativeElement, FileUploadRecord, VideoConfig, ImageConfig, FilePurpose } from '../../types';
import { apiRequest } from '../../config/api';
import ScenePreview from './ScenePreview';

// CORREÇÃO: A prop 'config' agora pode ser VideoConfig ou ImageConfig
interface DecorativeElementsEditorProps {
  config: VideoConfig | ImageConfig;
  onDecorativeElementsChange: (elements: DecorativeElement[]) => void;
}

const DecorativeElementsEditor: React.FC<DecorativeElementsEditorProps> = ({
  config,
  onDecorativeElementsChange
}) => {
  const { decorative_elements } = config;

  const [imageFiles, setImageFiles] = useState<FileUploadRecord[]>([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [selectedElementIndex, setSelectedElementIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchImageFiles();
  }, []);

  useEffect(() => {
    if (selectedElementIndex === null && decorative_elements.length > 0) {
      setSelectedElementIndex(0);
    }
    if (selectedElementIndex !== null && selectedElementIndex >= decorative_elements.length) {
        setSelectedElementIndex(decorative_elements.length > 0 ? decorative_elements.length - 1 : null);
    }
  }, [decorative_elements, selectedElementIndex]);

  const fetchImageFiles = async () => {
    setLoadingImages(true);
    try {
      const data: FileUploadRecord[] = await apiRequest('/api/v1/files/list_uploads');
      if (data && Array.isArray(data)) {
        setImageFiles(data.filter(f => f.file_type === 'image'));
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos de imagem:', error);
      setImageFiles([]);
    } finally {
        setLoadingImages(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', FilePurpose.DECORATIVE_ELEMENT);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/files/upload`, { method: 'POST', body: formData });
      if (response.ok) {
        await fetchImageFiles();
      } else {
        const errorData = await response.json();
        alert(`Falha no upload da imagem: ${errorData.detail || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addDecorativeElement = (file: FileUploadRecord) => {
    const newElement: DecorativeElement = {
      id: `deco_${Date.now()}`,
      path: file.new_filename,
      base64: null,
      position: 'top_right',
      width_ratio: null,
      size_ratio: 0.15,
      offset_y: 0,
      opacity: 1.0,
    };
    onDecorativeElementsChange([...decorative_elements, newElement]);
    setSelectedElementIndex(decorative_elements.length);
  };

  const updateElement = (index: number, updates: Partial<DecorativeElement>) => {
    const updatedElements = [...decorative_elements];
    updatedElements[index] = { ...updatedElements[index], ...updates };
    onDecorativeElementsChange(updatedElements);
  };

  const removeElement = (index: number) => {
    const updatedElements = decorative_elements.filter((_, i) => i !== index);
    onDecorativeElementsChange(updatedElements);
  };

  const getElementPreviewSrc = (element: DecorativeElement) => {
    if (element.base64) return element.base64;
    if (element.path) return `${import.meta.env.VITE_API_BASE_URL}/uploads/${element.path}`;
    return '';
  };

  const selectedElement = selectedElementIndex !== null ? decorative_elements[selectedElementIndex] : null;
  const positions = [
    { id: 'top_left', label: 'Superior Esquerda' },
    { id: 'top_right', label: 'Superior Direita' },
    { id: 'top_center', label: 'Centro Superior' },
    { id: 'bottom_left', label: 'Inferior Esquerda' },
    { id: 'bottom_right', label: 'Inferior Direita' }
  ];

  // A lógica de preview de cena só é renderizada se a config for de vídeo
  const canShowScenePreview = 'scenes' in config && config.scenes.length > 0;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
      <div className="xl:col-span-6 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Elementos na Composição</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {decorative_elements.length > 0 ? decorative_elements.map((element, index) => (
                 <div key={element.id} className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer ${selectedElementIndex === index ? 'bg-purple-50 border-purple-400' : 'hover:bg-slate-50'}`}
                  onClick={() => setSelectedElementIndex(index)}>
                  <div className="w-10 h-10 bg-slate-100 rounded overflow-hidden flex-shrink-0"><img src={getElementPreviewSrc(element)} alt="" className="w-full h-full object-cover" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{element.path || 'Nova Imagem'}</p></div>
                  <button onClick={(e) => { e.stopPropagation(); removeElement(index); }} className="p-2 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              )) : (
                <div className="text-center p-6 border-2 border-dashed rounded-lg text-slate-500">Nenhum elemento adicionado.</div>
              )}
          </div>
        </div>

        {selectedElement && selectedElementIndex !== null && (
           <div className="bg-white rounded-xl border border-slate-200 p-6">
             <h4 className="font-medium text-slate-900 flex items-center gap-2 mb-4"><Settings className="w-5 h-5 text-purple-600" />Editar Elemento Selecionado</h4>
             <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Move size={14}/> Posição</label>
                    <select value={selectedElement.position} onChange={(e) => updateElement(selectedElementIndex, { position: e.target.value as any })} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                        {positions.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Percent size={14}/> Tamanho Proporcional ({Math.round(selectedElement.size_ratio * 100)}%)
                    </label>
                    <input type="range" min="0.01" max="1" step="0.01" value={selectedElement.size_ratio} onChange={(e) => updateElement(selectedElementIndex, { size_ratio: parseFloat(e.target.value), width_ratio: null })} className="w-full"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <Eye size={14}/> Opacidade ({Math.round(selectedElement.opacity * 100)}%)
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={selectedElement.opacity} onChange={(e) => updateElement(selectedElementIndex, { opacity: parseFloat(e.target.value) })} className="w-full"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <ChevronsUpDown size={14}/> Deslocamento Vertical (offset_y)
                    </label>
                     <input type="number" value={selectedElement.offset_y} onChange={(e) => updateElement(selectedElementIndex, { offset_y: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-slate-300 rounded-lg"/>
                </div>
             </div>
           </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Adicionar Imagem da Biblioteca</h3>
            {loadingImages ? (
                <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400"/></div>
            ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2">
                    <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center text-center p-4 border-2 border-dashed rounded-lg text-slate-500 hover:bg-slate-50 hover:border-purple-400 cursor-pointer transition-all aspect-square">
                        <Upload className="w-8 h-8 mb-2"/>
                        <span className="text-sm font-medium">Novo Upload</span>
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </button>
                    {imageFiles.map((file) => (
                        <div key={file.id} className="group relative border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer aspect-square" onClick={() => addDecorativeElement(file)}>
                        <img src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${file.new_filename}`} alt={file.original_filename} className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-8 h-8 text-white" />
                        </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      <div className="xl:col-span-4">
        <div className="sticky top-6">
            {canShowScenePreview ? (
                <ScenePreview
                    scene={(config as VideoConfig).scenes[0]}
                    template={config.template}
                    decorativeElements={config.decorative_elements}
                />
            ) : (
                <div className="aspect-video bg-slate-100 rounded-lg flex items-center justify-center text-center p-4 border">
                    <p className="text-slate-500">O preview da cena aparecerá aqui (disponível no editor de vídeo).</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DecorativeElementsEditor;
