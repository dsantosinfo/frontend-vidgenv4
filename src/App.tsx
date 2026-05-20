// src/App.tsx
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import LoginPage from './components/Auth/LoginPage';
import CreateCompanyPage from './components/Company/CreateCompanyPage';
import CompanySelector from './components/Company/CompanySelector';
import { AuthProvider } from './context/AuthContext';
import { BrandingProvider } from './context/BrandingContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { useAuth } from './context/useAuth';
import { useBranding } from './context/BrandingContext';
import { VideoConfig, Scene, TextElement, ImageConfig } from './types';
import { CompanyResponse } from './config/api';

const defaultTextElement: TextElement = {
  text: 'Seu texto aqui',
  font_size: 48,
  fill: { type: 'solid', color: '#ffffff', gradient_colors: ['#ffffff', '#cccccc'], gradient_angle: 90 },
  font: null,
  position: { x: 'center', y: 'center' },
  animation: null,
  alignment: 'center',
  line_height: 1.2,
  background_color: null,
  background_opacity: 0.5,
  border_color: null,
  border_width: 0,
  background_padding: 20,
  background_border_radius: 0,
  stroke_color: null,
  stroke_width: 0,
  shadow: null,
  margin_bottom: 20,
  max_width: null,
};

const defaultScene: Scene = {
  duration: 5,
  background: { type: 'color', color: '#000000' },
  text_elements: [defaultTextElement],
  narration: null,
  effects_audio: [],
  subtitles: { enabled: false, font: 'Arial', font_size: 48, color: '#FFFFFF', stroke_color: '#000000', stroke_width: 2, position: ['center', 'bottom'] },
  transition: 'fade',
};

const defaultVideoConfig: VideoConfig = {
  template: 'instagram_story',
  fps: 24,
  scenes: [defaultScene],
  musica: { enabled: false, path: null, volume: 0.8 },
  decorative_elements: [],
};

const defaultImageConfig: ImageConfig = {
  template: 'instagram_story',
  scene: {
    background: { type: 'color', color: '#FFFFFF' },
    text_elements: [{ ...defaultTextElement, fill: { ...defaultTextElement.fill, color: '#000000' } }],
  },
  decorative_elements: [],
};

type ViewType = 'editor' | 'imageEditor' | 'videos' | 'company-settings' | 'admin' | 'profile';
type AppScreen = 'loading' | 'create-company' | 'select-company' | 'app';

function AppInner() {
  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { companies, activeCompany, loadCompanies, switchCompany, clearCompany } = useCompany();
  const { reload: reloadBranding } = useBranding();

  const [screen, setScreen] = useState<AppScreen>('loading');
  const [currentView, setCurrentView] = useState<ViewType>('editor');
  const [videoConfig, setVideoConfig] = useState<VideoConfig>(defaultVideoConfig);
  const [imageConfig, setImageConfig] = useState<ImageConfig>(defaultImageConfig);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Limpar empresa no logout
  useEffect(() => {
    const handler = () => clearCompany();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [clearCompany]);

  // Após autenticação: determinar qual tela mostrar
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { setScreen('loading'); return; }

    const init = async () => {
      setScreen('loading');
      const list = await loadCompanies();

      if (list.length === 0) {
        setScreen('create-company');
      } else if (activeCompany) {
        // Já tem empresa selecionada (localStorage) — vai direto pro app
        setScreen('app');
        reloadBranding();
      } else if (list.length === 1) {
        // Seleciona automaticamente
        await switchCompany(list[0]);
        setScreen('app');
        reloadBranding();
      } else {
        setScreen('select-company');
      }
    };

    init();
  }, [isAuthenticated, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompanyCreated = async (company: CompanyResponse) => {
    await switchCompany(company);
    await reloadBranding();
    setScreen('app');
  };

  const handleCompanySelected = async (company: CompanyResponse) => {
    await switchCompany(company);
    await reloadBranding();
    setScreen('app');
  };

  // Tela de login
  if (!isAuthenticated && !authLoading) return <LoginPage />;

  // Loading inicial
  if (screen === 'loading' || authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Criar primeira empresa
  if (screen === 'create-company') {
    return <CreateCompanyPage onCreated={handleCompanyCreated} />;
  }

  // Selecionar empresa (múltiplas)
  if (screen === 'select-company') {
    return (
      <CompanySelector
        companies={companies}
        onSelect={handleCompanySelected}
        onCreateNew={() => setScreen('create-company')}
        onLogout={logout}
      />
    );
  }

  // App principal
  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      <Sidebar
        currentView={currentView}
        onViewChange={v => { setCurrentView(v); setIsMobileSidebarOpen(false); }}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(v => !v)}
        mobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentView={currentView}
          onToggleSidebar={() => setIsMobileSidebarOpen(v => !v)}
          onViewChange={setCurrentView}
        />
        <MainContent
          currentView={currentView}
          onViewChange={setCurrentView}
          videoConfig={videoConfig}
          onVideoConfigChange={setVideoConfig}
          imageConfig={imageConfig}
          onImageConfigChange={setImageConfig}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrandingProvider>
        <CompanyProvider>
          <AppInner />
        </CompanyProvider>
      </BrandingProvider>
    </AuthProvider>
  );
}

export default App;
