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
          const normalizeAnim = (a: any) => {
            if (!a) return null;
            if (typeof a === 'string') return { type: a, duration: DEFAULT_ANIMATION_DURATION };
            if (typeof a === 'object' && a.type) return { type: a.type, duration: a.duration ?? DEFAULT_ANIMATION_DURATION };
            return null;
          };
          return {
            ...restOfTextEl,
            animation: normalizeAnim(animation),
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

// --- Settings / Branding ---

export interface BrandingResponse {
  app_name: string;
  tagline: string;
  color_from: string;
  color_to: string;
  logo_path: string | null;
  favicon_path: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  updated_at: string | null;
}

export const getBranding = (): Promise<BrandingResponse> =>
  apiRequest('/api/v1/settings/branding');

export const updateBranding = (data: Partial<Pick<BrandingResponse, 'app_name' | 'tagline' | 'color_from' | 'color_to'>>) =>
  apiRequest('/api/v1/settings/branding', { method: 'PUT', body: JSON.stringify(data) });

export const uploadLogo = (file: File): Promise<BrandingResponse> => {
  const form = new FormData();
  form.append('file', file);
  return apiRequest('/api/v1/settings/branding/logo', { method: 'POST', body: form });
};

export const uploadFavicon = (file: File): Promise<BrandingResponse> => {
  const form = new FormData();
  form.append('file', file);
  return apiRequest('/api/v1/settings/branding/favicon', { method: 'POST', body: form });
};

export const deleteBrandingAsset = (asset: 'logo' | 'favicon'): Promise<BrandingResponse> =>
  apiRequest(`/api/v1/settings/branding/${asset}`, { method: 'DELETE' });

// --- Companies ---

export interface CompanyResponse {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  owner_id: string | null;
  created_at: string;
  member_role: string;
}

export interface CompanyMemberResponse {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  joined_at: string;
}

export const getMyCompanies = (): Promise<CompanyResponse[]> =>
  apiRequest('/api/v1/auth/my-companies');

export const selectCompany = (company_id: string) =>
  apiRequest('/api/v1/auth/select-company', {
    method: 'POST',
    body: JSON.stringify({ company_id }),
  });

export const createCompany = (data: { name: string; slug: string }): Promise<CompanyResponse> =>
  apiRequest('/api/v1/companies/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateCompany = (id: string, data: { name?: string; slug?: string; [key: string]: any }) =>
  apiRequest(`/api/v1/companies/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const getCompanyIndustries = (): Promise<{ value: string; label: string }[]> =>
  apiRequest('/api/v1/companies/industries');

// --- Plans & Subscriptions ---

export interface PlanResponse {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  is_active: boolean;
  max_users: number;
  max_videos_month: number;
  max_images_month: number;
  max_storage_mb: number;
  max_templates: number;
  max_presets: number;
  features: Record<string, any>;
}

export interface SubscriptionResponse {
  id: string;
  company_id: string;
  plan_id: string;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'expired';
  billing_cycle: string;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  canceled_at: string | null;
  plan: PlanResponse | null;
}

export interface UsageResponse {
  company_id: string;
  period_start: string;
  period_end: string;
  videos_generated: number;
  images_generated: number;
  storage_used_mb: number;
  templates_count: number;
  presets_count: number;
  members_count: number;
}

export interface SubscriptionWithUsage {
  subscription: SubscriptionResponse;
  usage: UsageResponse;
  plan: PlanResponse;
}

export const getPlans = (): Promise<PlanResponse[]> =>
  apiRequest('/api/v1/plans/');

export const updatePlan = (planId: string, data: Partial<Omit<PlanResponse, 'id'>>) =>
  apiRequest(`/api/v1/plans/${planId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const getCompanySubscription = (companyId: string): Promise<SubscriptionWithUsage> =>
  apiRequest(`/api/v1/companies/${companyId}/subscription`);

export const subscribeCompany = (companyId: string, data: { plan_id: string; billing_cycle: string }) =>
  apiRequest(`/api/v1/companies/${companyId}/subscription`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const getEffectiveBranding = (): Promise<BrandingResponse> =>
  apiRequest('/api/v1/settings/effective-branding');

export const getCompanyMembers = (id: string): Promise<CompanyMemberResponse[]> =>
  apiRequest(`/api/v1/companies/${id}/members`);

export const addCompanyMember = (id: string, data: { email: string; role: string }) =>
  apiRequest(`/api/v1/companies/${id}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateCompanyMemberRole = (id: string, userId: string, role: string) =>
  apiRequest(`/api/v1/companies/${id}/members/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });

export const removeCompanyMember = (id: string, userId: string) =>
  apiRequest(`/api/v1/companies/${id}/members/${userId}`, { method: 'DELETE' });

export const getCompanyBranding = (id: string) =>
  apiRequest(`/api/v1/companies/${id}/branding`);

export const updateCompanyBranding = (id: string, data: Partial<Pick<BrandingResponse, 'app_name' | 'tagline' | 'color_from' | 'color_to'>>) =>
  apiRequest(`/api/v1/companies/${id}/branding`, { method: 'PUT', body: JSON.stringify(data) });

export const uploadCompanyLogo = (id: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiRequest(`/api/v1/companies/${id}/branding/logo`, { method: 'POST', body: form });
};

export const uploadCompanyFavicon = (id: string, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiRequest(`/api/v1/companies/${id}/branding/favicon`, { method: 'POST', body: form });
};

export const deleteCompanyBrandingAsset = (id: string, asset: 'logo' | 'favicon') =>
  apiRequest(`/api/v1/companies/${id}/branding/${asset}`, { method: 'DELETE' });

export const getCompanyPresets = (id: string, type?: string) =>
  apiRequest(`/api/v1/companies/${id}/presets${type ? `?type=${type}` : ''}`);

export const createCompanyPreset = (id: string, data: { name: string; type: string; config: Record<string, any> }) =>
  apiRequest(`/api/v1/companies/${id}/presets`, { method: 'POST', body: JSON.stringify(data) });

export const updateCompanyPreset = (id: string, presetId: string, data: { name?: string; config?: Record<string, any> }) =>
  apiRequest(`/api/v1/companies/${id}/presets/${presetId}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCompanyPreset = (id: string, presetId: string) =>
  apiRequest(`/api/v1/companies/${id}/presets/${presetId}`, { method: 'DELETE' });

export const forgotPassword = async (email: string) =>
  apiRequest('/api/v1/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const resetPassword = async (token: string, new_password: string) =>
  apiRequest('/api/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, new_password }),
  });

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

// --- API Tokens ---

export interface ApiTokenResponse {
  id: string;
  company_id: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  created_by_email: string | null;
}

export interface ApiTokenCreatedResponse extends ApiTokenResponse {
  token: string;
}

export const listApiTokens = (companyId: string): Promise<ApiTokenResponse[]> =>
  apiRequest(`/api/v1/companies/${companyId}/tokens`);

export const createApiToken = (companyId: string, data: { name: string; expires_at?: string | null }): Promise<ApiTokenCreatedResponse> =>
  apiRequest(`/api/v1/companies/${companyId}/tokens`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const revokeApiToken = (companyId: string, tokenId: string): Promise<void> =>
  apiRequest(`/api/v1/companies/${companyId}/tokens/${tokenId}`, { method: 'DELETE' });

// --- Admin ---

export const listFonts = (): Promise<{ fonts: { name: string; path: string; type: string }[] }> =>
  apiRequest('/api/v1/utils/list_fonts');

export const uploadFont = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return apiRequest('/api/v1/utils/upload_font', { method: 'POST', body: form });
};

export const deleteFont = (filename: string) =>
  apiRequest(`/api/v1/utils/fonts/${encodeURIComponent(filename)}`, { method: 'DELETE' });

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

export const sendResetPassword = async (userId: string): Promise<{ detail: string }> =>
  apiRequest(`/api/v1/admin/users/${userId}/send-reset-password`, { method: 'POST' });

export const generateTempPassword = async (userId: string): Promise<{ password: string; email: string }> =>
  apiRequest(`/api/v1/admin/users/${userId}/generate-password`, { method: 'POST' });

export const toggleCompanyActive = async (companyId: string) =>
  apiRequest(`/api/v1/companies/${companyId}/toggle-active`, { method: 'PATCH' });

export const getCompanyById = async (companyId: string) =>
  apiRequest(`/api/v1/companies/${companyId}`);

export const getCompanyMembersFull = async (companyId: string) =>
  apiRequest(`/api/v1/companies/${companyId}/members`);

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
