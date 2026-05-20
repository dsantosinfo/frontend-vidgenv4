// File: src/components/GeneratedVideos.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Trash2, Play, RefreshCw, CheckCircle, AlertCircle, Loader2, Eye, Film } from 'lucide-react';
import { TaskInfo } from '../types';
import { listAllTasks, deleteTask as apiDeleteTask, TASK_LIST_POLLING_INTERVAL_MS } from '../config/api';
import VideoPreview from './VideoEditor/VideoPreview';
import { SectionCard, EmptyState, LoadingSpinner, ConfirmDialog } from './ui';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const resolveUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

const formatTime = (iso: string) => new Date(iso).toLocaleString('pt-BR');

const getTaskDuration = (task: TaskInfo): string => {
  if (!task.start_time) return 'N/A';
  const start = new Date(task.start_time).getTime();
  const end = task.end_time ? new Date(task.end_time).getTime() : Date.now();
  const secs = Math.floor((end - start) / 1000);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  const suffix = !task.end_time ? ' (em andamento)' : '';
  return `${m}:${s.toString().padStart(2, '0')}${suffix}`;
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  processing: <Loader2 className="w-4 h-4 animate-spin text-blue-500" />,
  queued:     <Loader2 className="w-4 h-4 animate-spin text-blue-400" />,
  completed:  <CheckCircle className="w-4 h-4 text-green-500" />,
  failed:     <AlertCircle className="w-4 h-4 text-red-500" />,
};

const STATUS_BADGE: Record<string, string> = {
  processing: 'bg-blue-100 text-blue-800',
  queued:     'bg-blue-50 text-blue-600',
  completed:  'bg-green-100 text-green-800',
  failed:     'bg-red-100 text-red-800',
};

const STATUS_LABEL: Record<string, string> = {
  processing: 'Processando',
  queued:     'Na fila',
  completed:  'Concluído',
  failed:     'Erro',
};

const GeneratedVideos: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchTasks = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const data: TaskInfo[] = await listAllTasks();
      setTasks(data ?? []);
    } catch {
      // silencia — o apiRequest já trata 401
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling estável: não recria o intervalo a cada render
  useEffect(() => {
    fetchTasks(true);

    intervalRef.current = setInterval(() => {
      setTasks(prev => {
        const hasActive = prev.some(t => t.status === 'processing' || t.status === 'queued');
        if (hasActive) fetchTasks();
        return prev;
      });
    }, TASK_LIST_POLLING_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTasks]);

  const handleDelete = async (taskId: string) => {
    setConfirmDeleteId(null);
    setDeleting(taskId);
    try {
      await apiDeleteTask(taskId);
      if (selectedTaskId === taskId) setSelectedTaskId(null);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (e: any) {
      alert(e.message || 'Não foi possível excluir.');
    } finally {
      setDeleting(null);
    }
  };

  const processingTasks = tasks.filter(t => t.status === 'processing' || t.status === 'queued');
  const completedTasks  = tasks.filter(t => t.status === 'completed' && t.output_file);
  const failedTasks     = tasks.filter(t => t.status === 'failed');
  const selectedTask    = tasks.find(t => t.id === selectedTaskId);

  if (loading) {
    return <LoadingSpinner fullArea label="Carregando tarefas..." />;
  }

  return (
    <div className="p-3 sm:p-4 h-full overflow-auto">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">Vídeos Gerados</h2>
            <p className="text-xs text-slate-500 mt-0.5">Acompanhe e baixe seus vídeos</p>
          </div>
          <button
            onClick={() => fetchTasks()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
        </div>

        {/* Resumo */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2">
            <Loader2 className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <p className="text-[10px] text-blue-600 font-medium">Processando</p>
              <p className="text-lg font-bold text-blue-900">{processingTasks.length}</p>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <p className="text-[10px] text-green-600 font-medium">Concluídos</p>
              <p className="text-lg font-bold text-green-900">{completedTasks.length}</p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <p className="text-[10px] text-red-600 font-medium">Com erro</p>
              <p className="text-lg font-bold text-red-900">{failedTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
          <div className="lg:col-span-6 space-y-4">

            {/* Em processamento */}
            {processingTasks.length > 0 && (
              <SectionCard title="Em processamento">
                <div className="space-y-2">
                {processingTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">
                        {task.output_file ?? `Tarefa ${task.id.slice(0, 8)}...`}
                      </p>
                      <p className="text-xs text-blue-600">
                        {formatTime(task.start_time)} · {getTaskDuration(task)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[task.status]}`}>
                      {STATUS_LABEL[task.status]}
                    </span>
                  </div>
                ))}
                </div>
              </SectionCard>
            )}

            {/* Vídeos concluídos */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 sm:text-base mb-3">Vídeos concluídos</h3>
              {completedTasks.length === 0 ? (
                <SectionCard>
                  <EmptyState icon={Film} title="Nenhum vídeo ainda" description="Gere um vídeo no editor para vê-lo aqui" />
                </SectionCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {completedTasks.map(task => {
                    const url = resolveUrl(task.download_url);
                    const isSelected = selectedTaskId === task.id;
                    return (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTaskId(task.id)}
                        className={`bg-white rounded-xl border cursor-pointer transition-all ${
                          isSelected ? 'border-blue-500 shadow-md' : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div className="aspect-video bg-slate-900 rounded-t-xl overflow-hidden relative group">
                          <video
                            src={url}
                            className="w-full h-full object-cover"
                            muted
                            loop
                            playsInline
                            onMouseOver={e => (e.currentTarget as HTMLVideoElement).play().catch(() => {})}
                            onMouseOut={e => { (e.currentTarget as HTMLVideoElement).pause(); }}
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <Play className="w-10 h-10 text-white drop-shadow" />
                          </div>
                        </div>

                        {/* Info + ações */}
                        <div className="p-3">
                          <p className="text-sm font-medium text-slate-800 truncate mb-1" title={task.output_file ?? ''}>
                            {task.output_file ?? 'Vídeo gerado'}
                          </p>
                          <p className="text-xs text-slate-400 mb-3">
                            {formatTime(task.start_time)} · {getTaskDuration(task)}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={e => { e.stopPropagation(); setSelectedTaskId(task.id); }}
                              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> Visualizar
                            </button>
                            <a
                              href={url}
                              download
                              onClick={e => e.stopPropagation()}
                              className="flex items-center justify-center px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                              title="Baixar"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={e => { e.stopPropagation(); setConfirmDeleteId(task.id); }}
                              disabled={deleting === task.id}
                              className="flex items-center justify-center px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Excluir"
                            >
                              {deleting === task.id
                                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                : <Trash2 className="w-3.5 h-3.5" />
                              }
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Erros */}
            {failedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-900 sm:text-base mb-3">Tarefas com erro</h3>
                <div className="space-y-2">
                  {failedTasks.map(task => (
                    <details key={task.id} className="bg-white border border-red-200 rounded-xl overflow-hidden">
                      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-red-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-slate-800">Falha na geração</p>
                            <p className="text-xs text-slate-400">
                              {task.id.slice(0, 8)}... · {formatTime(task.start_time)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); setConfirmDeleteId(task.id); }}
                          disabled={deleting === task.id}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === task.id
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>
                      </summary>
                      <pre className="text-xs text-red-700 bg-red-50 p-4 border-t border-red-200 overflow-auto max-h-32 whitespace-pre-wrap">
                        {task.error || 'Erro desconhecido.'}
                      </pre>
                    </details>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Player lateral */}
          <div className="lg:col-span-4">
            <div className="sticky top-4">
              {selectedTask?.status === 'completed' ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-900">Visualização</h3>
                  <VideoPreview
                    videoPath={resolveUrl(selectedTask.download_url)}
                    title={selectedTask.output_file ?? undefined}
                    showDownload
                  />
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Arquivo</span>
                      <span className="text-slate-800 font-medium truncate max-w-[60%] text-right" title={selectedTask.output_file ?? ''}>
                        {selectedTask.output_file}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gerado em</span>
                      <span className="text-slate-800">{formatTime(selectedTask.start_time)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Duração do processo</span>
                      <span className="text-slate-800">{getTaskDuration(selectedTask)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <SectionCard>
                  <EmptyState icon={Play} title="Selecione um vídeo" description="Clique em um vídeo concluído para visualizar" />
                </SectionCard>
              )}
            </div>
          </div>
        </div>

      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Excluir vídeo"
        description="A tarefa e o vídeo associado serão removidos permanentemente."
        confirmLabel="Excluir"
        onConfirm={() => confirmDeleteId && handleDelete(confirmDeleteId)}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default GeneratedVideos;
