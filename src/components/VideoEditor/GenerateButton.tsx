// File: src/components/VideoEditor/GenerateButton.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState, useEffect } from 'react';
import { Play, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { VideoConfig, TaskInfo } from '../../types';
import { apiRequest, convertToApiPayload } from '../../config/api'; // Importa a nova função

interface GenerateButtonProps {
  config: VideoConfig;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

const GenerateButton: React.FC<GenerateButtonProps> = ({
  config,
  isGenerating,
  onGeneratingChange
}) => {
  const [taskStatus, setTaskStatus] = useState<TaskInfo | null>(null);
  const [generationTime, setGenerationTime] = useState<number>(0);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTaskId && (taskStatus?.status === 'queued' || taskStatus?.status === 'processing')) {
      interval = setInterval(async () => {
        try {
          const data = await apiRequest(`/api/v1/tasks/${currentTaskId}`);
          if (data) {
            const task = data as TaskInfo;
            setTaskStatus(task);
            if (task.status === 'completed' || task.status === 'failed') {
              onGeneratingChange(false);
              setCurrentTaskId(null);
            }
          }
        } catch (error) {
          console.error('Erro ao verificar status da tarefa:', error);
          onGeneratingChange(false);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [currentTaskId, taskStatus, onGeneratingChange]);
  
  useEffect(() => {
    let timeInterval: NodeJS.Timeout;
    if (isGenerating) {
      const startTime = Date.now();
      timeInterval = setInterval(() => {
        setGenerationTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      setGenerationTime(0);
    }
    return () => clearInterval(timeInterval);
  }, [isGenerating]);
  
  const generateVideo = async () => {
    onGeneratingChange(true);
    setTaskStatus(null);
    setCurrentTaskId(null);
    setGenerationTime(0);

    try {
      // CORREÇÃO: Usa a função centralizada para criar o payload
      const payload = convertToApiPayload(config);
      
      console.log('🎬 Iniciando geração de vídeo com o payload:', JSON.stringify(payload, null, 2));
      
      const data = await apiRequest('/api/v1/videos/generate', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (data && data.id) {
        setCurrentTaskId(data.id);
        setTaskStatus(data);
      } else {
        throw new Error('Falha ao iniciar geração: Nenhuma Task ID retornada.');
      }
    } catch (error) {
      console.error('🔥 Erro na geração do vídeo:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro de rede desconhecido';
      setTaskStatus({
        id: '', status: 'failed', start_time: new Date().toISOString(),
        error: errorMessage
      });
      onGeneratingChange(false);
    }
  };

  const canGenerate = () => {
    return config.scenes.length > 0;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      <button
        onClick={generateVideo}
        disabled={isGenerating || !canGenerate()}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all text-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <><Loader2 className="w-6 h-6 animate-spin" /> Gerando... ({formatTime(generationTime)})</>
        ) : (
          <><Play className="w-6 h-6" /> Gerar Vídeo</>
        )}
      </button>

      {!isGenerating && taskStatus && (
        <div className={`flex items-center gap-3 p-4 rounded-lg ${
          taskStatus.status === 'completed' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          {taskStatus.status === 'completed' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          <div className="flex-1">
            <span className={`text-sm font-medium ${taskStatus.status === 'completed' ? 'text-green-800' : 'text-red-800'}`}>
              {taskStatus.status === 'completed' ? 'Vídeo gerado com sucesso! 🎉' : `Erro: ${taskStatus.error || 'Falha na geração'}`}
            </span>
          </div>
          {taskStatus.status === 'completed' && taskStatus.download_url && (
            <a href={taskStatus.download_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium">
              <Download className="w-4 h-4" /> Baixar
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default GenerateButton;
