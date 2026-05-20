// src/context/BrandingContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getBranding, getEffectiveBranding, BrandingResponse, getStoredToken } from '../config/api';

const DEFAULTS: BrandingResponse = {
  app_name: 'VidGen',
  tagline: 'Estúdio de Mídia Profissional',
  color_from: '#3B82F6',
  color_to: '#9333EA',
  logo_path: null,
  favicon_path: null,
  logo_url: null,
  favicon_url: null,
  updated_at: null,
};

interface BrandingContextValue {
  branding: BrandingResponse;
  reload: () => Promise<void>;
}

const BrandingContext = createContext<BrandingContextValue>({
  branding: DEFAULTS,
  reload: async () => {},
});

export const useBranding = () => useContext(BrandingContext);

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingResponse>(DEFAULTS);

  const applyFavicon = (url: string | null) => {
    const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
    const link = existing || document.createElement('link');
    link.rel = 'icon';
    link.href = url || '/favicon.svg';
    if (!existing) document.head.appendChild(link);
  };

  const load = useCallback(async () => {
    try {
      // Se autenticado usa effective-branding (empresa > global > defaults)
      // Se não autenticado usa branding global público
      const data = getStoredToken()
        ? await getEffectiveBranding()
        : await getBranding();

      setBranding(data);
      document.title = `${data.app_name} — ${data.tagline}`;
      applyFavicon(data.favicon_url);
    } catch {
      // Falha silenciosa — mantém estado atual
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <BrandingContext.Provider value={{ branding, reload: load }}>
      {children}
    </BrandingContext.Provider>
  );
};
