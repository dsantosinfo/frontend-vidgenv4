// File: src/config/api.ts

import { VideoConfig } from '../types';

// Constantes configuráveis
export const DEFAULT_TRANSITION_DURATION = 1.0;
export const DEFAULT_ANIMATION_DURATION = 1.0;

// Debounces para previews
export const PREVIEW_DEBOUNCE_MS = 1200;
export const TEXT_PREVIEW_DEBOUNCE_MS = 700;

// Intervalos de polling
export const TASK_POLLING_INTERVAL_MS = 3000;
export const TASK_LIST_POLLING_INTERVAL_MS = 5000;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const convertToApiPayload = (config: VideoConfig) => {
  const apiConfig = {
    ...config,
    scenes: config.scenes.map(scene => {
      const { transition, ...restOfScene } = scene;
      return {
        ...restOfScene,
        transition_from_previous: transition
          ? { type: transition, duration: DEFAULT_TRANSITION_DURATION }
          : null,
        text_elements: scene.text_elements.map(textEl => {
          const { animation, ...restOfTextEl } = textEl;
          return {
            ...restOfTextEl,
            animation: animation
              ? { type: animation, duration: DEFAULT_ANIMATION_DURATION }
              : null
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
      let errorDetail: string;
      try {
        const errorData = await response.json();
        // FastAPI pode retornar detail como string ou array de validação
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          // Erros de validação FastAPI: [{loc, msg, type}, ...]
          errorDetail = errorData.detail.map((e: any) => e.msg || e.message).join('; ');
        } else if (typeof errorData.detail === 'object') {
          errorDetail = JSON.stringify(errorData.detail);
        } else {
          errorDetail = response.statusText;
        }
      } catch {
        errorDetail = response.statusText;
      }
      throw new Error(errorDetail || `Erro HTTP: ${response.status}`);
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
