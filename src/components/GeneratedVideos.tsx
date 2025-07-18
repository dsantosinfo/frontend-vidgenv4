// File: src/components/GeneratedVideos.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState, useEffect } from 'react';
import { Download, Trash2, Play, RefreshCw, Clock, CheckCircle, AlertCircle, Loader2, Eye } from 'lucide-react';
import { TaskInfo } from '../types';
import { apiRequest, listAllTasks } from '../config/api';
import VideoPreview from './VideoEditor/VideoPreview';

const GeneratedVideos: React.FC = () => {
  const [tasks, setTasks] = useState<TaskInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
    
    const interval = setInterval(() => {
      if (tasks.some(t => t.status === 'processing' || t.status === 'queued')) {
        fetchTasks();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [tasks]); 

  const fetchTasks = async () => {
    if (!loading) setLoading(true);
    try {
      const data: TaskInfo[] = await listAllTasks();
      setTasks(data || []);
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTask = async (taskId: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir esta tarefa e o vídeo associado?`)) {
      return;
    }
    
    setDeleting(taskId);
    try {
      await apiRequest(`/api/v1/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
      
      await fetchTasks();

    } catch (error) {
      console.error('Erro ao excluir a tarefa:', error);
      alert('Não foi possível excluir a tarefa.');
    } finally {
      setDeleting(null);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-BR');
  };

  const getTaskDuration = (task: TaskInfo) => {
    if ((task.status === 'processing' || task.status === 'queued') && task.start_time) {
      const start = new Date(task.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      return `${mins}:${secs.toString().padStart(2, '0')} (em andamento)`;
    }
    
    if (task.start_time && task.end_time) {
      const start = new Date(task.start_time);
      const end = new Date(task.end_time);
      const diffMs = end.getTime() - start.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const mins = Math.floor(diffSec / 60);
      const secs = diffSec % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    return 'N/A';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
      case 'queued':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
      case 'queued':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-800';
    }
  };
  
  if (loading && tasks.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">Carregando tarefas...</p>
        </div>
      </div>
    );
  }

  const processingTasks = tasks.filter(task => task.status === 'processing' || task.status === 'queued');
  const completedTasks = tasks.filter(task => task.status === 'completed' && task.output_file);
  const failedTasks = tasks.filter(task => task.status === 'failed');
  
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  return (
    <div className="p-6 h-full overflow-auto">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Vídeos e Tarefas</h2>
            <p className="text-slate-600">Gerencie seus vídeos e acompanhe o progresso das gerações</p>
          </div>
          
          <button
            onClick={fetchTasks}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-blue-900">Em Processamento</div>
                    <div className="text-sm text-blue-700">{processingTasks.length} tarefas</div>
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-green-900">Concluídos</div>
                    <div className="text-sm text-green-700">{completedTasks.length} vídeos</div>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-red-900">Com Erro</div>
                    <div className="text-sm text-red-700">{failedTasks.length} tarefas</div>
                  </div>
                </div>
            </div>

            {processingTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tarefas em Processamento</h3>
                <div className="space-y-4">
                  {processingTasks.map((task) => (
                    <div key={task.id} className={`border rounded-lg p-4 ${getStatusColor(task.status)}`}>
                      <div className="flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <div className="font-medium">Gerando vídeo...</div>
                            <div className="text-sm opacity-75">
                              ID: {task.id.slice(0, 8)}... | 
                              Iniciado: {formatTime(task.start_time)} | 
                              Duração: {getTaskDuration(task)}
                            </div>
                          </div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Vídeos Gerados</h3>
              {completedTasks.length === 0 ? (
                 <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <Play className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Nenhum Vídeo Ainda</h3>
                  <p className="text-slate-600 mb-6">Crie vídeos no editor para vê-los aqui</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className={`bg-white rounded-xl border transition-all cursor-pointer ${
                        selectedTaskId === task.id
                          ? 'border-blue-500 shadow-lg' 
                          : 'border-slate-200 hover:shadow-md'
                      }`}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="aspect-video bg-slate-100 flex items-center justify-center rounded-t-xl overflow-hidden">
                        <video 
                          src={task.download_url!} 
                          className="w-full h-full object-cover" 
                          muted 
                          loop
                          onMouseOver={e => (e.target as HTMLVideoElement).play()}
                          onMouseOut={e => (e.target as HTMLVideoElement).pause()}
                          />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 truncate" title={task.output_file || ''}>
                          {task.output_file}
                        </h3>
                        <div className="flex gap-2">
                           <button onClick={(e) => { e.stopPropagation(); setSelectedTaskId(task.id); }} className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex-1 justify-center">
                            <Eye className="w-4 h-4" /> Visualizar
                          </button>
                          <a href={task.download_url!} onClick={(e) => e.stopPropagation()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium">
                            <Download className="w-4 h-4" />
                          </a>
                          <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} disabled={deleting === task.id} className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50">
                            {deleting === task.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {failedTasks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tarefas com Erro</h3>
                <div className="space-y-4">
                  {failedTasks.map((task) => (
                    <details key={task.id} className={`border rounded-lg p-4 ${getStatusColor(task.status)}`}>
                       <summary className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(task.status)}
                          <div>
                            <div className="font-medium">Falha na geração</div>
                            <div className="text-sm opacity-75">ID: {task.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }} disabled={deleting === task.id} className="p-2 text-red-500 hover:text-red-700 disabled:opacity-50">
                           {deleting === task.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </summary>
                      <pre className="text-xs text-red-800 bg-red-100 p-2 mt-4 rounded overflow-auto max-h-40">
                        {task.error || 'Erro desconhecido.'}
                      </pre>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {selectedTask && selectedTask.status === 'completed' ? (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Visualização do Vídeo</h3>
                  <VideoPreview
                    videoPath={selectedTask.download_url!}
                    title={selectedTask.output_file ?? undefined}
                    showDownload={true}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Play className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="font-medium text-slate-900 mb-2">Selecione um Vídeo</h4>
                  <p className="text-sm text-slate-600">Clique em um vídeo concluído da lista para visualizá-lo aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneratedVideos;
