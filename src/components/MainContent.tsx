// File: src/components/MainContent.tsx
// Substitua o conteúdo completo deste arquivo.

import React from 'react';
import VideoEditor from './VideoEditor';
import ImageEditor from './ImageEditor/index.tsx'; // CORREÇÃO APLICADA AQUI
import GeneratedVideos from './GeneratedVideos';
import FileManagement from './FileManagement';
import { VideoConfig, ImageConfig } from '../types';

interface MainContentProps {
  currentView: 'editor' | 'imageEditor' | 'videos' | 'files';
  videoConfig: VideoConfig;
  onVideoConfigChange: (config: VideoConfig) => void;
  imageConfig: ImageConfig;
  onImageConfigChange: (config: ImageConfig) => void;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  currentView,
  videoConfig,
  onVideoConfigChange,
  imageConfig,
  onImageConfigChange,
  isGenerating,
  onGeneratingChange
}) => {
  return (
    <main className="flex-1 overflow-auto">
      {currentView === 'editor' && (
        <VideoEditor 
          config={videoConfig}
          onConfigChange={onVideoConfigChange}
          isGenerating={isGenerating}
          onGeneratingChange={onGeneratingChange}
        />
      )}
      
      {currentView === 'imageEditor' && (
        <ImageEditor
          config={imageConfig}
          onConfigChange={onImageConfigChange}
          isGenerating={isGenerating}
          onGeneratingChange={onGeneratingChange}
        />
      )}
      
      {currentView === 'videos' && (
        <GeneratedVideos />
      )}
      
      {currentView === 'files' && (
        <FileManagement />
      )}
    </main>
  );
};

export default MainContent;