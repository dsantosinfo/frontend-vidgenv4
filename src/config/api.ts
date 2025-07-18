// File: src/config/api.ts
// Substitua o conteúdo completo deste arquivo.

import { VideoConfig } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const convertToApiPayload = (config: VideoConfig) => {
  const apiConfig = {
    ...config,
    scenes: config.scenes.map(scene => {
      const { transition, ...restOfScene } = scene;
      return {
        ...restOfScene,
        transition_from_previous: transition ? { type: transition, duration: 1.0 } : null,
        text_elements: scene.text_elements.map(textEl => {
          const { animation, ...restOfTextEl } = textEl;
          return {
            ...restOfTextEl,
            animation: animation ? { type: animation, duration: 1.0 } : null
          };
        })
      };
    }),
  };
  return { config: apiConfig };
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: response.statusText }));
      throw new Error(errorData.detail || `Erro HTTP: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;

  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

// --- FUNÇÕES ADICIONADAS ---

// Função específica para verificar status de tarefas
export const checkTaskStatus = async (taskId: string) => {
  return apiRequest(`/api/v1/tasks/${taskId}`);
};

// Função para listar todas as tarefas
export const listAllTasks = async () => {
  // O endpoint correto, conforme a documentação da API, é /api/v1/tasks/
  return apiRequest('/api/v1/tasks/');
};
