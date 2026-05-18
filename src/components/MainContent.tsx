import React from 'react';
import VideoEditor from './VideoEditor';
import ImageEditor from './ImageEditor/index.tsx';
import GeneratedVideos from './GeneratedVideos';
import FileManagement from './FileManagement';
import UserTemplatesManager from './UserTemplatesManager';
import UserManagement from './UserManagement';
import { VideoConfig, ImageConfig } from '../types';
import { convertToApiPayload } from '../config/api';

type ViewType = 'editor' | 'imageEditor' | 'videos' | 'files' | 'templates' | 'users';

interface MainContentProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  videoConfig: VideoConfig;
  onVideoConfigChange: (config: VideoConfig) => void;
  imageConfig: ImageConfig;
  onImageConfigChange: (config: ImageConfig) => void;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  currentView,
  onViewChange,
  videoConfig,
  onVideoConfigChange,
  imageConfig,
  onImageConfigChange,
  isGenerating,
  onGeneratingChange
}) => {
  return (
    <main className="flex-1 min-h-0">
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
        <div className="overflow-auto h-full">
          <GeneratedVideos />
        </div>
      )}

      {currentView === 'files' && (
        <div className="overflow-auto h-full">
          <FileManagement />
        </div>
      )}

      {currentView === 'templates' && (
        <div className="overflow-auto h-full">
          <UserTemplatesManager
            currentVideoConfig={convertToApiPayload(videoConfig)}
            currentImageConfig={{ config: imageConfig }}
            onNavigate={(view) => onViewChange(view)}
            onLoadTemplate={(rawConfig, type) => {
              const unwrap = (c: any): any => {
                if (!c) return c;
                if (c.config) return unwrap(c.config);
                return c;
              };
              const cfg = unwrap(rawConfig);
              if (type === 'video' && cfg?.scenes) onVideoConfigChange(cfg as VideoConfig);
              else if (type === 'image' && cfg?.scene) onImageConfigChange(cfg as ImageConfig);
            }}
          />
        </div>
      )}

      {currentView === 'users' && (
        <div className="overflow-auto h-full">
          <UserManagement />
        </div>
      )}
    </main>
  );
};

export default MainContent;
