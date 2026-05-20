// src/context/CompanyContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CompanyResponse, getMyCompanies, selectCompany as apiSelectCompany } from '../config/api';

const STORAGE_KEY = 'vidgen_active_company';

interface CompanyContextValue {
  companies: CompanyResponse[];
  activeCompany: CompanyResponse | null;
  isLoading: boolean;
  /** Carrega a lista de empresas do backend */
  loadCompanies: () => Promise<CompanyResponse[]>;
  /** Seleciona uma empresa, sincroniza com backend e persiste no localStorage */
  switchCompany: (company: CompanyResponse) => Promise<void>;
  /** Limpa o estado (usado no logout) */
  clearCompany: () => void;
}

const CompanyContext = createContext<CompanyContextValue>({
  companies: [],
  activeCompany: null,
  isLoading: false,
  loadCompanies: async () => [],
  switchCompany: async () => {},
  clearCompany: () => {},
});

export const useCompany = () => useContext(CompanyContext);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<CompanyResponse[]>([]);
  const [activeCompany, setActiveCompany] = useState<CompanyResponse | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadCompanies = useCallback(async (): Promise<CompanyResponse[]> => {
    setIsLoading(true);
    try {
      const data = await getMyCompanies();
      setCompanies(data);

      // Se há empresa salva no localStorage, verificar se ainda é válida
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const storedCompany: CompanyResponse = JSON.parse(stored);
        const stillValid = data.find(c => c.id === storedCompany.id);
        if (stillValid) {
          setActiveCompany(stillValid); // atualiza com dados frescos
        } else {
          localStorage.removeItem(STORAGE_KEY);
          setActiveCompany(null);
        }
      }

      return data;
    } catch {
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const switchCompany = useCallback(async (company: CompanyResponse) => {
    await apiSelectCompany(company.id);
    setActiveCompany(company);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
  }, []);

  const clearCompany = useCallback(() => {
    setActiveCompany(null);
    setCompanies([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <CompanyContext.Provider value={{
      companies,
      activeCompany,
      isLoading,
      loadCompanies,
      switchCompany,
      clearCompany,
    }}>
      {children}
    </CompanyContext.Provider>
  );
};
