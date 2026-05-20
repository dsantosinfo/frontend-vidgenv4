// src/components/MainContent.tsx
import React, { useState } from 'react';
import VideoEditor from './VideoEditor';
import ImageEditor from './ImageEditor/index.tsx';
import GeneratedVideos from './GeneratedVideos';
import UserProfile from './UserProfile';
import CompanySettingsPage from './Company/CompanySettingsPage';
import AdminPage from './Admin/AdminPage';
import { VideoConfig, ImageConfig } from '../types';
import { convertToApiPayload } from '../config/api';
import type { ViewType } from './Sidebar';

interface MainContentProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  videoConfig: VideoConfig;
  onVideoConfigChange: (config: VideoConfig) => void;
  imageConfig: ImageConfig;
  onImageConfigChange: (config: ImageConfig) => void;
}

const MainContent: React.FC<MainContentProps> = ({
  currentView,
  onViewChange,
  videoConfig,
  onVideoConfigChange,
  imageConfig,
  onImageConfigChange,
}) => {
  const scrollable = (children: React.ReactNode) => (
    <div className="h-full overflow-y-auto">{children}</div>
  );

  const [isVideoGenerating, setIsVideoGenerating] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);

  return (
    <main className="flex-1 min-h-0 overflow-hidden">

      {currentView === 'editor' && (
        <VideoEditor
          config={videoConfig}
          onConfigChange={onVideoConfigChange}
          isGenerating={isVideoGenerating}
          onGeneratingChange={setIsVideoGenerating}
        />
      )}

      {currentView === 'imageEditor' && (
        <ImageEditor
          config={imageConfig}
          onConfigChange={onImageConfigChange}
          isGenerating={isImageGenerating}
          onGeneratingChange={setIsImageGenerating}
        />
      )}

      {currentView === 'videos' && scrollable(<GeneratedVideos />)}

      {currentView === 'company-settings' && scrollable(
        <CompanySettingsPage
          currentVideoConfig={convertToApiPayload(videoConfig)}
          currentImageConfig={{ config: imageConfig }}
          onNavigate={onViewChange}
          onLoadTemplate={(rawConfig, type) => {
            const unwrap = (c: any): any => c?.config ? unwrap(c.config) : c;
            const cfg = unwrap(rawConfig);
            if (type === 'video' && cfg?.scenes) onVideoConfigChange(cfg as VideoConfig);
            else if (type === 'image' && cfg?.scene) onImageConfigChange(cfg as ImageConfig);
          }}
        />
      )}

      {currentView === 'admin' && scrollable(<AdminPage />)}

      {currentView === 'profile' && scrollable(<UserProfile />)}

    </main>
  );
};

export default MainContent;
