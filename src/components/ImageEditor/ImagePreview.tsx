// src/components/ImageEditor/ImagePreview.tsx
import React from 'react';
import { ImageConfig } from '../../types';
import { ScenePreviewCard } from '../ui';

interface ImagePreviewProps {
  config: ImageConfig;
  isGenerating: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ config, isGenerating }) => (
  <ScenePreviewCard
    scene={config.scene}
    template={config.template}
    decorativeElements={config.decorative_elements}
    title="Preview da Imagem"
    debounce={1200}
    isGeneratingFinal={isGenerating}
  />
);

export default ImagePreview;
