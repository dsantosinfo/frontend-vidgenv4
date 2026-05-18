// File: src/config/api.ts

import { VideoConfig, UserTemplateCreate, UserTemplateUpdate, SimplifiedVideoRequest } from '../types';

// Constantes configuráveis
export const DEFAULT_TRANSITION_DURATION = 1.0;
export const DEFAULT_ANIMATION_DURATION = 1.0;

// Debounces para previews (conforme EDITOR_TEMPLATES.md)
export const PREVIEW_DEBOUNCE_MS = 600;      // preview de cena
export const TEXT_PREVIEW_DEBOUNCE_MS = 400; // preview de texto

// Intervalos de polling
export const TASK_POLLING_INTERVAL_MS = 3000;
export const TASK_LIST_POLLING_INTERVAL_MS = 5000;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const TOKEN_KEY = 'vidgen_access_token';

export const getStoredToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setStoredToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearStoredToken = () => localStorage.removeItem(TOKEN_KEY);

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
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Não adicionar Content-Type para FormData (browser define automaticamente com boundary)
  // Aplicar antes dos headers customizados para permitir override (ex: form-urlencoded)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  // Headers customizados sobrescrevem os defaults
  Object.assign(headers, options.headers as Record<string, string>);

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      clearStoredToken();
      window.dispatchEvent(new CustomEvent('auth:logout'));
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    if (!response.ok) {
      let errorDetail: string;
      try {
        const errorData = await response.json();
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
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
    // 204 No Content ou body vazio — não tentar parsear JSON
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return response;
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    throw error;
  }
};

// --- Auth ---

export const login = async (email: string, password: string) => {
  const body = new URLSearchParams({ username: email, password });
  const response = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (response?.access_token) setStoredToken(response.access_token);
  return response;
};

export const register = async (email: string, password: string, full_name?: string) => {
  return apiRequest('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name }),
  });
};

export const getMe = async () => apiRequest('/api/v1/auth/me');

export const changePassword = async (current_password: string, new_password: string) => {
  return apiRequest('/api/v1/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  });
};

// --- Tasks ---

export const checkTaskStatus = async (taskId: string) =>
  apiRequest(`/api/v1/tasks/${taskId}`);

export const listAllTasks = async () => apiRequest('/api/v1/tasks/');

export const deleteTask = async (taskId: string) =>
  apiRequest(`/api/v1/tasks/${taskId}`, { method: 'DELETE' });

// --- User Templates ---

export const listUserTemplates = async () => apiRequest('/api/v1/user-templates/');

export const createUserTemplate = async (data: UserTemplateCreate) =>
  apiRequest('/api/v1/user-templates/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getUserTemplate = async (templateId: string) =>
  apiRequest(`/api/v1/user-templates/${templateId}`);

export const updateUserTemplate = async (templateId: string, data: UserTemplateUpdate) =>
  apiRequest(`/api/v1/user-templates/${templateId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteUserTemplate = async (templateId: string) =>
  apiRequest(`/api/v1/user-templates/${templateId}`, { method: 'DELETE' });

// --- Simplified Generation ---

export const generateSimplifiedVideo = async (data: SimplifiedVideoRequest) =>
  apiRequest('/api/v1/generate-simplified/video', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const generateSimplifiedImage = async (data: SimplifiedVideoRequest) =>
  apiRequest('/api/v1/generate-simplified/image', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// --- Admin ---

export const listUsers = async (skip = 0, limit = 100) =>
  apiRequest(`/api/v1/admin/users?skip=${skip}&limit=${limit}`);

export const getUser = async (userId: string) =>
  apiRequest(`/api/v1/admin/users/${userId}`);

export const updateUser = async (userId: string, data: { full_name?: string; phone?: string; is_active?: boolean; role?: string }) =>
  apiRequest(`/api/v1/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deactivateUser = async (userId: string) =>
  apiRequest(`/api/v1/admin/users/${userId}`, { method: 'DELETE' });

// --- Files ---

export const uploadFile = async (file: File, purpose: string): Promise<any> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);
  return apiRequest('/api/v1/files/upload', { method: 'POST', body: formData });
};

// --- Palette Extractor ---

export interface PaletteExtractOptions {
  num_colors?: number;
  min_percent?: number;
  tolerance?: number;
  palette_type?: 'full' | 'simplified';
}

export const extractPalette = async (file: File, options: PaletteExtractOptions = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  if (options.num_colors !== undefined) formData.append('num_colors', String(options.num_colors));
  if (options.min_percent !== undefined) formData.append('min_percent', String(options.min_percent));
  if (options.tolerance !== undefined) formData.append('tolerance', String(options.tolerance));
  if (options.palette_type) formData.append('palette_type', options.palette_type);

  return apiRequest('/api/v1/palette/extract', { method: 'POST', body: formData });
};
