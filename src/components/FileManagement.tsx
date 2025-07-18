// File: src/components/FileManagement.tsx

import React, { useState, useEffect } from 'react';
import { Upload, Trash2, RefreshCw, File, Image, Video, Music, Eye, ChevronDown } from 'lucide-react';
import { FileUploadRecord, FilePurpose } from '../types';
import { apiRequest } from '../config/api';
import AudioPreview from './VideoEditor/AudioPreview';
import VideoPreview from './VideoEditor/VideoPreview';

const FileManagement: React.FC = () => {
  const [files, setFiles] = useState<{
    image: FileUploadRecord[];
    video: FileUploadRecord[];
    audio: FileUploadRecord[];
  }>({
    image: [],
    video: [],
    audio: []
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'audio'>('image');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [uploadPurpose, setUploadPurpose] = useState<FilePurpose>(FilePurpose.BACKGROUND_IMAGE);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const data: FileUploadRecord[] = await apiRequest('/api/v1/files/list_uploads');
      
      if (data) {
        const categorizedFiles = {
          image: data.filter(f => f.file_type === 'image'),
          video: data.filter(f => f.file_type === 'video'),
          audio: data.filter(f => f.file_type === 'audio'),
        };
        setFiles(categorizedFiles);
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', uploadPurpose);

    try {
      const response = await fetch('/api/v1/files/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        await fetchFiles();
      } else {
        const errorData = await response.json();
        alert(`Falha no upload: ${errorData.detail || 'Erro desconhecido'}`);
        console.error("Falha no upload:", errorData);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async (filename: string) => {
    if (!window.confirm(`Tem certeza que deseja deletar o arquivo e todos os seus registros?`)) {
      return;
    }
    try {
      await apiRequest(`/api/v1/files/delete_upload/${filename}`, {
        method: 'DELETE',
      });
      fetchFiles();
      const deletedFile = [...files.image, ...files.video, ...files.audio].find(f => f.new_filename === filename);
      if (deletedFile && selectedFileId === deletedFile.id) {
        setSelectedFileId(null);
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      alert('Não foi possível deletar o arquivo.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
  };

  const renderFilePreview = (file: FileUploadRecord) => {
    if (file.file_type === 'audio') {
      return <AudioPreview audioPath={file.new_filename} title={file.original_filename} className="mt-3" />;
    }
    if (file.file_type === 'video') {
      return <VideoPreview videoPath={file.new_filename} title={file.original_filename} className="mt-3" />;
    }
    if (file.file_type === 'image') {
      return (
        <div className="mt-3">
          <img
            src={`${import.meta.env.VITE_API_BASE_URL}/uploads/${file.new_filename}`}
            alt={file.original_filename}
            className="w-full h-48 object-cover rounded-lg border"
          />
        </div>
      );
    }
    return null;
  };

  const tabs = [
    { id: 'image' as const, label: 'Imagens', icon: Image },
    { id: 'video' as const, label: 'Vídeos', icon: Video },
    { id: 'audio' as const, label: 'Áudios', icon: Music }
  ];

  const currentFiles = files[activeTab] || []; // Garante que currentFiles seja sempre um array
  const selectedFile = currentFiles.find(f => f.id === selectedFileId);

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Gerenciamento de Arquivos</h2>
              <p className="text-slate-600">Faça upload e gerencie seus recursos de mídia</p>
            </div>
            <button onClick={fetchFiles} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
              <RefreshCw className="w-4 h-4" /> Atualizar
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-8 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Faça Upload de Novos Arquivos</h3>
              <div className="mb-4 max-w-sm mx-auto">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  1. Selecione a finalidade do arquivo:
                </label>
                <select value={uploadPurpose} onChange={(e) => setUploadPurpose(e.target.value as FilePurpose)} className="w-full p-2 border border-slate-300 rounded-lg bg-white">
                  {Object.values(FilePurpose).map(p => <option key={p} value={p}>{p.replace(/_/g, ' ').toUpperCase()}</option>)}
                </select>
              </div>
              <label htmlFor="file-upload" className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer transition-colors font-medium">
                {uploading ? 'Enviando...' : '2. Selecionar Arquivo'}
              </label>
              <input type="file" accept="image/*,video/*,audio/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* vvvvvvvvvv BLOCO DE CÓDIGO CORRIGIDO vvvvvvvvvv */}
              <div className="flex border-b border-slate-200">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  // Garante que a contagem só aconteça se a lista existir
                  const count = files[tab.id] ? files[tab.id].length : 0;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all ${
                        isActive
                          ? 'border-blue-500 text-blue-600 bg-blue-50'
                          : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
              {/* ^^^^^^^^^^^ FIM DO BLOCO CORRIGIDO ^^^^^^^^^^^ */}

              <div className="p-6">
                {loading ? ( <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto" /></div> ) 
                : currentFiles.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">Nenhum arquivo encontrado para esta categoria.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentFiles.map((file) => (
                      <div key={file.id} onClick={() => setSelectedFileId(file.id)}
                        className={`group border rounded-lg p-4 transition-all cursor-pointer ${selectedFileId === file.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 hover:shadow'}`}>
                        <p className="font-medium text-slate-900 truncate" title={file.original_filename}>
                          {file.original_filename}
                        </p>
                        <p className="text-xs text-slate-500 truncate" title={file.new_filename}>
                          ID: {file.new_filename.split('_')[0]}...
                        </p>
                        <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedFileId(file.id); }} className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" /> Visualizar
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(file.new_filename); }} className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {selectedFile ? (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Detalhes do Arquivo</h3>
                  <p className="font-medium text-slate-900 truncate" title={selectedFile.original_filename}>{selectedFile.original_filename}</p>
                  <p className="text-sm text-slate-500 mb-2">Upload em: {new Date(selectedFile.uploaded_at).toLocaleString('pt-BR')}</p>
                  <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{selectedFile.purpose}</span>
                  {renderFilePreview(selectedFile)}
                </div>
              ) : ( 
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <Eye className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="font-medium text-slate-900 mb-2">Selecione um Arquivo</h4>
                    <p className="text-sm text-slate-600">Clique em um arquivo da lista para visualizá-lo aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileManagement;