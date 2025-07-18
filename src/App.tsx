// File: src/App.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import { VideoConfig, Scene, TextElement, ImageConfig } from './types';

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

// Configuração padrão para o novo editor de imagem
const defaultImageConfig: ImageConfig = {
  template: 'instagram_story',
  scene: {
    background: { type: 'color', color: '#FFFFFF' },
    text_elements: [{...defaultTextElement, fill: {...defaultTextElement.fill, color: '#000000'}}],
  },
  decorative_elements: [],
};

function App() {
  const [currentView, setCurrentView] = useState<'editor' | 'imageEditor' | 'videos' | 'files'>('editor');
  const [videoConfig, setVideoConfig] = useState<VideoConfig>(defaultVideoConfig);
  const [imageConfig, setImageConfig] = useState<ImageConfig>(defaultImageConfig);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          currentView={currentView}
          isGenerating={isGenerating}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        
        <MainContent 
          currentView={currentView}
          videoConfig={videoConfig}
          onVideoConfigChange={setVideoConfig}
          imageConfig={imageConfig}
          onImageConfigChange={setImageConfig}
          isGenerating={isGenerating}
          onGeneratingChange={setIsGenerating}
        />
      </div>
    </div>
  );
}

export default App;
