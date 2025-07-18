// File: src/components/VideoEditor/SceneAudioEditor.tsx

import React, { useState, useEffect, useRef } from 'react';
import { Music, MessageSquare, Speaker, Plus, Trash2, Upload } from 'lucide-react';
import { Scene, FileUploadRecord, AudioTrack, FilePurpose } from '../../types';
import { apiRequest } from '../../config/api';
import AudioPreview from './AudioPreview';

interface SceneAudioEditorProps {
  scene: Scene;
  onUpdateScene: (updates: Partial<Scene>) => void;
  sceneIndex: number;
}

const SceneAudioEditor: React.FC<SceneAudioEditorProps> = ({ scene, onUpdateScene, sceneIndex }) => {
  const [audioFiles, setAudioFiles] = useState<FileUploadRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const narrationInputRef = useRef<HTMLInputElement>(null);
  const effectInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAudioFiles();
  }, []);

  const fetchAudioFiles = async () => {
    try {
      const data: FileUploadRecord[] = await apiRequest('/api/v1/files/list_uploads');
      if (data && Array.isArray(data)) {
        setAudioFiles(data.filter(f => f.file_type === 'audio'));
      }
    } catch (error) {
      console.error('Erro ao buscar arquivos de áudio:', error);
    }
  };

  // Função de upload genérica que aceita a finalidade como argumento
  const handleFileUpload = async (file: File, purpose: FilePurpose) => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', purpose);

    try {
      const response = await fetch('/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchAudioFiles(); // Atualiza a lista para todos os componentes
      } else {
        const errorData = await response.json();
        alert(`Falha no upload: ${errorData.detail || 'Erro desconhecido'}`);
      }
    } catch (err: any) {
      console.error('Erro no upload:', err);
      alert('Ocorreu um erro de rede durante o upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const addSoundEffect = (file: FileUploadRecord) => {
    const newEffect: AudioTrack = { path: file.new_filename, volume: 1.0 };
    onUpdateScene({ effects_audio: [...scene.effects_audio, newEffect] });
  };

  const removeSoundEffect = (effectIndex: number) => {
    const updatedEffects = scene.effects_audio.filter((_, i) => i !== effectIndex);
    onUpdateScene({ effects_audio: updatedEffects });
  };

  return (
    <div className="space-y-6">
      {/* Seção de Narração */}
      <div>
        <h4 className="font-semibold text-slate-900 mb-2">Narração</h4>
        <p className="text-sm text-slate-600 mb-3">Selecione um áudio para definir a duração da cena. Escolha "Nenhum" para definir a duração manualmente.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <button
            onClick={() => onUpdateScene({ narration: null })}
            className={`p-3 border rounded-lg text-center ${!scene.narration ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
          >
            Nenhum
          </button>
          {audioFiles.map(file => (
            <button
              key={file.id}
              onClick={() => onUpdateScene({ narration: { path: file.new_filename, volume: 1.0 } })}
              className={`p-3 border rounded-lg text-left truncate ${scene.narration?.path === file.new_filename ? 'border-blue-500 bg-blue-50' : 'hover:bg-slate-50'}`}
              title={file.original_filename}
            >
              <Music size={14} className="inline mr-2" /> {file.original_filename}
            </button>
          ))}
           {/* Botão de Upload para Narração */}
          <button
            onClick={() => narrationInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 border-2 border-dashed rounded-lg text-center text-slate-500 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50"
          >
            <Upload size={14} className="inline mr-2" /> {isUploading ? 'Enviando...' : 'Upload de Narração'}
          </button>
          <input
            ref={narrationInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], FilePurpose.NARRATION)}
            className="hidden"
          />
        </div>
        {scene.narration && <div className="mt-4"><AudioPreview audioPath={scene.narration.path} title="Preview da Narração" /></div>}
      </div>

      {/* Seção de Legendas */}
      <div className="pt-4 border-t">
        <h4 className="font-semibold text-slate-900 mb-2">Legendas Automáticas</h4>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`enable-subtitles-${sceneIndex}`}
            disabled={!scene.narration}
            checked={scene.subtitles.enabled}
            onChange={(e) => onUpdateScene({ subtitles: { ...scene.subtitles, enabled: e.target.checked } })}
            className="w-5 h-5 text-blue-600 disabled:opacity-50"
          />
          <label
            htmlFor={`enable-subtitles-${sceneIndex}`}
            className={`font-medium text-slate-800 ${!scene.narration ? 'text-slate-400' : ''}`}
          >
            Gerar legendas a partir da narração
          </label>
        </div>
        {!scene.narration && <p className="text-xs text-slate-500 mt-1">É preciso selecionar uma narração para ativar as legendas.</p>}
        {scene.subtitles.enabled && (
          <div className="grid md:grid-cols-2 gap-x-4 gap-y-2 mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Cor do Texto</label>
                <input type="color" value={scene.subtitles.color} onChange={e => onUpdateScene({ subtitles: { ...scene.subtitles, color: e.target.value } })} className="w-full h-10 p-1 border rounded-md" />
              </div>
              <div>
                <label className="text-sm">Cor do Contorno</label>
                <input type="color" value={scene.subtitles.stroke_color || '#000000'} onChange={e => onUpdateScene({ subtitles: { ...scene.subtitles, stroke_color: e.target.value } })} className="w-full h-10 p-1 border rounded-md" />
              </div>
            </div>
            <div>
              <label className="text-sm">Tamanho da Fonte ({scene.subtitles.font_size}px)</label>
              <input type="range" min="12" max="100" value={scene.subtitles.font_size} onChange={e => onUpdateScene({ subtitles: { ...scene.subtitles, font_size: parseInt(e.target.value) } })} className="w-full" />
            </div>
            <div>
              <label className="text-sm">Largura do Contorno ({scene.subtitles.stroke_width}px)</label>
              <input type="range" min="0" max="10" value={scene.subtitles.stroke_width} onChange={e => onUpdateScene({ subtitles: { ...scene.subtitles, stroke_width: parseInt(e.target.value) } })} className="w-full" />
            </div>
          </div>
        )}
      </div>

      {/* Seção de Efeitos Sonoros */}
      <div className="pt-4 border-t">
        <h4 className="font-semibold text-slate-900 mb-2">Efeitos Sonoros</h4>
        <div className="space-y-2 mb-3">
          {scene.effects_audio.map((effect, index) => (
            <div key={index} className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg">
              <Speaker size={16} className="text-slate-500" />
              <span className="flex-1 text-sm truncate">{effect.path}</span>
              <button onClick={() => removeSoundEffect(index)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
            </div>
          ))}
          {scene.effects_audio.length === 0 && <p className="text-sm text-slate-500">Nenhum efeito sonoro adicionado.</p>}
        </div>
        <h5 className="text-sm font-medium mb-2">Adicionar Efeito:</h5>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2">
          {audioFiles.map(file => (
            <button
              key={file.id}
              onClick={() => addSoundEffect(file)}
              className="p-3 border rounded-lg text-left truncate hover:bg-slate-50 text-slate-700"
              title={file.original_filename}
            >
              <Plus size={14} className="inline mr-2" /> {file.original_filename}
            </button>
          ))}
          {/* Botão de Upload para Efeitos Sonoros */}
          <button
            onClick={() => effectInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 border-2 border-dashed rounded-lg text-center text-slate-500 hover:bg-blue-50 hover:border-blue-400 disabled:opacity-50"
          >
            <Upload size={14} className="inline mr-2" /> {isUploading ? 'Enviando...' : 'Upload de Efeito'}
          </button>
          <input
            ref={effectInputRef}
            type="file"
            accept="audio/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], FilePurpose.AUDIO_EFFECT)}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default SceneAudioEditor;
