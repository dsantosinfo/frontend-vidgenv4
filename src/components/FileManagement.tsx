import React, { useState, useEffect } from 'react';
import { Upload, Trash2, RefreshCw, Image, Video, Music, Eye } from 'lucide-react';
import { FileUploadRecord, FilePurpose } from '../types';
import { apiRequest, uploadFile } from '../config/api';
import AudioPreview from './VideoEditor/AudioPreview';
import VideoPreview from './VideoEditor/VideoPreview';
import { EmptyState, LoadingSpinner, SectionCard, Tabs, ConfirmDialog } from './ui';

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
  const [confirmFile, setConfirmFile] = useState<string | null>(null);

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
    try {
      await uploadFile(file, uploadPurpose);
      await fetchFiles();
    } catch (error: any) {
      alert(`Falha no upload: ${error.message || 'Erro desconhecido'}`);
      console.error('Erro no upload:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async (filename: string) => {
    setConfirmFile(null);
    const deletedFile = [...files.image, ...files.video, ...files.audio].find(f => f.new_filename === filename);
    try {
      await apiRequest(`/api/v1/files/delete_upload/${filename}`, { method: 'DELETE' });
      if (deletedFile && selectedFileId === deletedFile.id) setSelectedFileId(null);
      await fetchFiles();
    } catch {
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
    const url = `${import.meta.env.VITE_API_BASE_URL}/uploads/${file.file_path}`;
    if (file.file_type === 'audio') {
      return <AudioPreview audioPath={file.file_path} title={file.original_filename} className="mt-3" />;
    }
    if (file.file_type === 'video') {
      return <VideoPreview videoPath={file.file_path} title={file.original_filename} className="mt-3" />;
    }
    if (file.file_type === 'image') {
      return (
        <div className="mt-3 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
          <img
            src={url}
            alt={file.original_filename}
            className="w-full max-h-64 object-contain"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      );
    }
    return null;
  };

  const currentFiles = files[activeTab] || []; // Garante que currentFiles seja sempre um array
  const selectedFile = currentFiles.find(f => f.id === selectedFileId);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 flex overflow-hidden">

        {/* Esquerda: lista + upload */}
        <div className="flex-[3] overflow-y-auto p-3 sm:p-4 space-y-3 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Gerenciamento de Arquivos</h2>
              <p className="text-xs text-slate-500">Upload e gerenciamento de mídia</p>
            </div>
            <button onClick={fetchFiles} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs">
              <RefreshCw className="w-3.5 h-3.5" /> Atualizar
            </button>
          </div>
          <SectionCard padding="p-3">
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-700 mb-2">Upload de Arquivos</p>
              <div className="mb-2 max-w-xs mx-auto">
                <select value={uploadPurpose} onChange={e => setUploadPurpose(e.target.value as FilePurpose)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg bg-white text-xs">
                  {Object.values(FilePurpose).filter(p => p !== FilePurpose.FONT).map(p => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <label htmlFor="file-upload"
                className="inline-block px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-xs font-medium">
                {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
              </label>
              <input type="file" accept="image/*,video/*,audio/*" onChange={handleFileSelect} className="hidden" id="file-upload" />
            </div>
          </SectionCard>

          <SectionCard padding="p-0">
            <Tabs
              tabs={[
                { id: 'image', label: 'Imagens', icon: Image,  badge: files.image.length },
                { id: 'video', label: 'Vídeos',  icon: Video,  badge: files.video.length },
                { id: 'audio', label: 'Áudios',   icon: Music,  badge: files.audio.length },
              ]}
              active={activeTab}
              onChange={setActiveTab}
              className="px-2 pt-1"
            />
            <div className="p-3">
              {loading ? (
                <LoadingSpinner fullArea />
              ) : currentFiles.length === 0 ? (
                <EmptyState icon={Upload} title="Nenhum arquivo nesta categoria." />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentFiles.map(file => (
                    <div key={file.id} onClick={() => setSelectedFileId(file.id)}
                      className={`group border rounded-lg p-2.5 transition-all cursor-pointer ${
                        selectedFileId === file.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'
                      }`}>
                      <p className="font-medium text-slate-900 truncate text-xs" title={file.original_filename}>
                        {file.original_filename}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(file.uploaded_at).toLocaleDateString('pt-BR')}
                      </p>
                      <div className="flex gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); setSelectedFileId(file.id); }}
                          className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3" /> Visualizar
                        </button>
                        <button onClick={e => { e.stopPropagation(); setConfirmFile(file.new_filename); }}
                          className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Direita: preview fixo */}
        <div className="hidden lg:flex flex-[2] border-l border-slate-200 bg-slate-50 p-3 min-w-0 h-full overflow-y-auto">
          {selectedFile ? (
            <div className="w-full space-y-2">
              <p className="text-xs font-semibold text-slate-700 truncate" title={selectedFile.original_filename}>
                {selectedFile.original_filename}
              </p>
              <p className="text-[10px] text-slate-400">{new Date(selectedFile.uploaded_at).toLocaleString('pt-BR')}</p>
              <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full inline-block">
                {selectedFile.purpose}
              </span>
              {renderFilePreview(selectedFile)}
            </div>
          ) : (
            <EmptyState icon={Eye} title="Selecione um arquivo" description="Clique para visualizar" />
          )}
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmFile}
        title="Deletar arquivo"
        description={`Remover "${confirmFile}" permanentemente?`}
        confirmLabel="Deletar"
        onConfirm={() => confirmFile && handleDelete(confirmFile)}
        onCancel={() => setConfirmFile(null)}
      />
    </div>
  );
};

export default FileManagement;