import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Download, RefreshCw, Play } from 'lucide-react';
import {
  listUserTemplates, createUserTemplate, deleteUserTemplate,
  generateSimplifiedVideo, generateSimplifiedImage
} from '../config/api';
import { UserTemplateResponse } from '../types';
import { SectionCard, EmptyState, ConfirmDialog, LoadingSpinner } from './ui';

interface UserTemplatesManagerProps {
  currentVideoConfig?: Record<string, any>;
  currentImageConfig?: Record<string, any>;
  onLoadTemplate?: (config: Record<string, any>, type: 'video' | 'image') => void;
  onNavigate?: (view: 'editor' | 'imageEditor') => void;
}

const UserTemplatesManager: React.FC<UserTemplatesManagerProps> = ({
  currentVideoConfig,
  currentImageConfig,
  onLoadTemplate,
  onNavigate,
}) => {
  const [templates, setTemplates] = useState<UserTemplateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveType, setSaveType] = useState<'video' | 'image'>('video');
  const [error, setError] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await listUserTemplates();
      setTemplates(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleSave = async () => {
    if (!saveName.trim()) return;
    const config = saveType === 'video' ? currentVideoConfig : currentImageConfig;
    if (!config) return;
    try {
      await createUserTemplate({ name: saveName.trim(), config });
      setSaveName('');
      fetchTemplates();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      await deleteUserTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const getTemplateType = (config: Record<string, any>): 'video' | 'image' => {
    const unwrap = (c: any): any => c?.config ? unwrap(c.config) : c;
    return unwrap(config)?.scenes ? 'video' : 'image';
  };

  const handleGenerate = async (template: UserTemplateResponse) => {
    const contentType = getTemplateType(template.config);
    setGeneratingId(template.id);
    try {
      if (contentType === 'video') {
        await generateSimplifiedVideo({ template_id: template.id, content_type: 'video' });
        alert('Geração iniciada! Acompanhe em "Vídeos Gerados".');
      } else {
        await generateSimplifiedImage({ template_id: template.id, content_type: 'image' });
        alert('Imagem gerada!');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">

      <SectionCard title="Salvar Configuração Atual">
        <div className="flex gap-2 flex-wrap">
          <select
            value={saveType}
            onChange={e => setSaveType(e.target.value as 'video' | 'image')}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="video">Vídeo</option>
            <option value="image">Imagem</option>
          </select>
          <input
            type="text"
            value={saveName}
            onChange={e => setSaveName(e.target.value)}
            placeholder="Nome do template..."
            className="flex-1 min-w-0 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={handleSave}
            disabled={!saveName.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Salvar
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title={`Templates Salvos (${templates.length})`}
        action={
          <button onClick={fetchTemplates} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      >
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">{error}</div>
        )}

        {isLoading ? (
          <LoadingSpinner fullArea />
        ) : templates.length === 0 ? (
          <EmptyState icon={Play} title="Nenhum template salvo ainda." />
        ) : (
          <div className="space-y-2">
            {templates.map(template => {
              const type = getTemplateType(template.config);
              return (
                <div key={template.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-slate-900 truncate">{template.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        type === 'video' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {type === 'video' ? '🎬 Vídeo' : '🖼️ Imagem'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {new Date(template.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {onLoadTemplate && (
                      <button
                        onClick={() => {
                          onLoadTemplate(template.config, type);
                          onNavigate?.(type === 'video' ? 'editor' : 'imageEditor');
                        }}
                        title="Abrir no editor"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Abrir
                      </button>
                    )}
                    <button
                      onClick={() => handleGenerate(template)}
                      disabled={generatingId === template.id}
                      title="Gerar agora"
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                    >
                      {generatingId === template.id
                        ? <RefreshCw className="w-4 h-4 animate-spin" />
                        : <Play className="w-4 h-4" />
                      }
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(template.id)}
                      title="Deletar"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Deletar template"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Deletar"
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default UserTemplatesManager;
