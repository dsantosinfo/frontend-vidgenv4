// src/components/VideoEditor/AudioEditor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Upload, Music, Volume2 } from 'lucide-react';
import { Musica, FileUploadRecord, FilePurpose } from '../../types';
import { apiRequest, uploadFile } from '../../config/api';
import AudioPreview from './AudioPreview';
import { SectionCard, EmptyState } from '../ui';

interface AudioEditorProps {
  musicaConfig: Musica;
  onMusicaChange: (musica: Musica) => void;
}

const AudioEditor: React.FC<AudioEditorProps> = ({ musicaConfig, onMusicaChange }) => {
  const [audioFiles, setAudioFiles] = useState<FileUploadRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchAudioFiles(); }, []);

  const fetchAudioFiles = async () => {
    try {
      const data = await apiRequest('/api/v1/files/list_uploads');
      if (Array.isArray(data)) {
        setAudioFiles((data as FileUploadRecord[]).filter(f => f.file_type === 'audio'));
      }
    } catch { /* silencia */ }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      await uploadFile(file, FilePurpose.MUSIC);
      await fetchAudioFiles();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert(`Erro no upload: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload({ target: { files: e.dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div className="p-3 sm:p-4 max-w-3xl mx-auto space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-sm font-bold text-slate-900 sm:text-base">Áudio Global</h2>
        <p className="text-xs text-slate-500">Música de fundo que tocará durante todo o vídeo.</p>
      </div>

      <SectionCard>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="enable-audio"
            checked={musicaConfig.enabled}
            onChange={e => onMusicaChange({ ...musicaConfig, enabled: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="enable-audio" className="text-sm font-medium text-slate-900">
            Ativar Música de Fundo Global
          </label>
        </div>

        {musicaConfig.enabled && (
          <div className="space-y-4">
            {musicaConfig.path && (
              <AudioPreview
                audioPath={musicaConfig.path}
                volume={musicaConfig.volume}
                title="Música de Fundo Global"
              />
            )}

            {/* Upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-slate-300 rounded-lg p-5 text-center hover:border-blue-400 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600 mb-1">Clique ou arraste um áudio</p>
              <p className="text-xs text-slate-400">MP3, WAV, AAC, OGG, M4A</p>
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
              {isUploading && <p className="text-xs text-blue-500 mt-2">Enviando...</p>}
            </div>

            {/* Lista de áudios */}
            {audioFiles.length === 0 ? (
              <EmptyState icon={Music} title="Nenhum áudio disponível." description="Faça upload de um arquivo acima." />
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {audioFiles.map(file => (
                  <div
                    key={file.id}
                    onClick={() => onMusicaChange({ ...musicaConfig, path: file.file_path })}
                    className={`flex items-center gap-3 p-2.5 border rounded-lg cursor-pointer transition-all ${
                      musicaConfig.path === file.file_path
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Music className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="text-xs font-medium text-slate-800 truncate flex-1">{file.original_filename}</span>
                    {musicaConfig.path === file.file_path && (
                      <span className="text-[10px] font-bold text-blue-600 shrink-0">✓</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Volume */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                Volume ({Math.round(musicaConfig.volume * 100)}%)
              </label>
              <input
                type="range" min="0" max="1" step="0.05"
                value={musicaConfig.volume}
                onChange={e => onMusicaChange({ ...musicaConfig, volume: parseFloat(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AudioEditor;
