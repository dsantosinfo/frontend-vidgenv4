// File: src/components/VideoEditor/BackgroundEditor.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image, Video, Palette } from 'lucide-react';
import { Background, FileUploadRecord, FilePurpose } from '../../types';
import { apiRequest } from '../../config/api';

interface BackgroundEditorProps {
  background: Background;
  onBackgroundChange: (background: Background) => void;
}

const BackgroundEditor: React.FC<BackgroundEditorProps> = ({
  background,
  onBackgroundChange,
}) => {
  const [files, setFiles] = useState<{ images: FileUploadRecord[]; videos: FileUploadRecord[] }>({
    images: [],
    videos: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const data: FileUploadRecord[] = await apiRequest('/api/v1/files/list_uploads');
      if (data && Array.isArray(data)) {
        setFiles({
          images: data.filter(f => f.file_type === 'image'),
          videos: data.filter(f => f.file_type === 'video'),
        });
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos de fundo:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    // Define a finalidade com base no tipo de arquivo
    const purpose = file.type.startsWith('image/') 
      ? FilePurpose.BACKGROUND_IMAGE 
      : FilePurpose.BACKGROUND_VIDEO;
    formData.append('purpose', purpose);

    try {
      const response = await fetch('/api/v1/files/upload', {
        method: 'POST', body: formData,
      });

      if (response.ok) {
        await fetchFiles();
      } else {
        const errorData = await response.json();
        alert(`Erro no upload: ${errorData.detail || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploading(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };
  
  const getPreviewUrl = (filename: string) => {
    return `${import.meta.env.VITE_API_BASE_URL}/uploads/${filename}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        {[
          { type: 'color', icon: Palette, label: 'Cor' },
          { type: 'image', icon: Image, label: 'Imagem' },
          { type: 'video', icon: Video, label: 'Vídeo' }
        ].map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => onBackgroundChange({ ...background, type: type as any, path: undefined, color: type === 'color' ? '#000000' : background.color })}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm ${
              background.type === type
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-semibold'
                : 'border-slate-300 text-slate-600 hover:border-slate-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {background.type === 'color' && (
        <div className="p-4 bg-slate-50 rounded-lg">
          <label className="block text-sm font-medium text-slate-700 mb-2">Cor de Fundo</label>
          <div className="flex gap-2">
            <input 
              type="color" 
              value={background.color || '#000000'} 
              onChange={(e) => onBackgroundChange({ ...background, color: e.target.value })} 
              className="p-1 h-10 w-14 block bg-white border border-slate-300 rounded-md cursor-pointer"
            />
            <input 
              type="text" 
              value={background.color || '#000000'} 
              onChange={(e) => onBackgroundChange({ ...background, color: e.target.value })} 
              className="flex-1 p-2 border border-slate-300 rounded-lg font-mono text-sm" 
              placeholder="#000000" 
            />
          </div>
        </div>
      )}

      {(background.type === 'image' || background.type === 'video') && (
        <div className="space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
          >
            <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="font-medium text-slate-600 mb-1">Clique para selecionar ou arraste e solte</p>
            <p className="text-xs text-slate-500">{background.type === 'image' ? 'Imagens (JPG, PNG...)' : 'Vídeos (MP4, MOV...)'}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={background.type === 'image' ? 'image/*' : 'video/*'}
              onChange={handleFileSelect}
              className="hidden"
            />
             {isUploading && <p className="text-sm text-blue-500 mt-2">Enviando...</p>}
          </div>

          <div>
            <h4 className="font-medium text-slate-900 mb-3">
              {background.type === 'image' ? 'Imagens' : 'Vídeos'} Disponíveis
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto pr-2">
              {(background.type === 'image' ? files.images : files.videos).map((file) => (
                <button
                  key={file.id}
                  onClick={() => onBackgroundChange({ ...background, path: file.new_filename })}
                  className={`relative p-1 rounded-lg border-2 text-left transition-all ${
                    background.path === file.new_filename
                      ? 'border-blue-500'
                      : 'border-transparent hover:border-slate-300'
                  }`}
                >
                    <div className="aspect-video bg-slate-100 rounded overflow-hidden">
                       <img src={getPreviewUrl(file.new_filename)} alt={file.original_filename} className="w-full h-full object-cover"/>
                    </div>
                  <p className="text-xs font-medium text-slate-700 truncate mt-1" title={file.original_filename}>{file.original_filename}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundEditor;
