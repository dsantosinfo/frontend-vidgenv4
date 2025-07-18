// File: src/components/VideoEditor/AudioEditor.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Music, Volume2 } from 'lucide-react';
// Importa os tipos corretos e padronizados
import { Musica, FileUploadRecord, FilePurpose } from '../../types';
import { apiRequest } from '../../config/api';
import AudioPreview from './AudioPreview';

// Define a interface das props do componente
interface AudioEditorProps {
  musicaConfig: Musica;
  onMusicaChange: (musica: Musica) => void;
}

// Declaração do componente funcional
const AudioEditor: React.FC<AudioEditorProps> = ({ musicaConfig, onMusicaChange }) => {
  // Hooks de estado para gerenciar o componente
  const [audioFiles, setAudioFiles] = useState<FileUploadRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Efeito para buscar os arquivos de áudio quando o componente é montado
  useEffect(() => {
    fetchAudioFiles();
  }, []);

  // Função assíncrona para buscar a lista de arquivos
  const fetchAudioFiles = async (): Promise<void> => {
    try {
      const data = await apiRequest('/api/v1/files/list_uploads');
      const records = data as FileUploadRecord[];
      // Garante que a resposta é um array antes de filtrar
      if (records && Array.isArray(records)) {
        setAudioFiles(records.filter(f => f.file_type === 'audio'));
      }
    } catch (err: any) { // Usa 'err: any' para máxima compatibilidade
      console.error('Erro ao buscar arquivos de áudio:', err);
    }
  };

  // Função para lidar com o upload de um novo arquivo
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', FilePurpose.MUSIC);

    try {
      const response = await fetch('/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchAudioFiles();
        // Limpa o input para permitir o re-upload do mesmo arquivo
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
         const errorData = await response.json();
         alert(`Erro no upload: ${errorData.detail || 'Erro desconhecido'}`);
      }
    } catch (err: any) { // Usa 'err: any' para máxima compatibilidade
      console.error('Erro no upload:', err);
      alert('Ocorreu um erro de rede durante o upload.');
    } finally {
      setIsUploading(false);
    }
  };

  // Função para lidar com o evento de arrastar e soltar (drag and drop)
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      // Simula um evento de mudança para reutilizar a função de upload
      const mockEvent = { target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>;
      handleFileUpload(mockEvent);
    }
  };

  // Renderização do componente
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Configurações de Áudio Global</h2>
        <p className="text-slate-600">Adicione música de fundo que tocará durante todo o vídeo.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="enable-audio"
            checked={musicaConfig.enabled}
            onChange={(e) => onMusicaChange({ ...musicaConfig, enabled: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="enable-audio" className="font-medium text-slate-900">
            Ativar Música de Fundo Global
          </label>
        </div>

        {musicaConfig.enabled && (
          <div className="space-y-6">
            {musicaConfig.path && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Música de Fundo Selecionada</h4>
                <AudioPreview
                  audioPath={musicaConfig.path}
                  volume={musicaConfig.volume}
                  title="Música de Fundo Global"
                />
              </div>
            )}
            
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            >
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="font-medium text-slate-600 mb-2">Clique para selecionar um áudio ou arraste e solte</p>
              <p className="text-xs text-slate-500">MP3, WAV, AAC, OGG, M4A</p>
               <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
               {isUploading && <p className="text-sm text-blue-500 mt-2">Enviando...</p>}
            </div>
            
            {audioFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Áudios Disponíveis</h4>
                <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto pr-2">
                  {audioFiles.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => onMusicaChange({ ...musicaConfig, path: file.new_filename })}
                      className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center gap-4 ${
                        musicaConfig.path === file.new_filename ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Music className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-800 truncate flex-1" title={file.original_filename}>{file.original_filename}</span>
                       {musicaConfig.path === file.new_filename && <span className="text-xs font-bold text-blue-600">SELECIONADO</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Volume2 className="w-4 h-4 inline mr-2" />
                Volume Global ({Math.round(musicaConfig.volume * 100)}%)
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicaConfig.volume}
                onChange={(e) => onMusicaChange({ ...musicaConfig, volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioEditor;
