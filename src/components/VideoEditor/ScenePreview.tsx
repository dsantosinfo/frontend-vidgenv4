// src/components/VideoEditor/ScenePreview.tsx
import React from 'react';
import { Scene, DecorativeElement } from '../../types';
import { ScenePreviewCard } from '../ui';

interface ScenePreviewProps {
  scene: Scene;
  template: string;
  decorativeElements: DecorativeElement[];
}

const ScenePreview: React.FC<ScenePreviewProps> = ({ scene, template, decorativeElements }) => (
  <ScenePreviewCard
    scene={scene}
    template={template}
    decorativeElements={decorativeElements}
    title="Preview da Cena"
    debounce={600}
  />
);

export default ScenePreview;
