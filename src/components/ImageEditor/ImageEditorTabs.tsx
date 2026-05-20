// src/components/ImageEditor/ImageEditorTabs.tsx
import { LayoutTemplate, Palette, Type, Sparkles, Settings } from 'lucide-react';
import { Tabs } from '../ui';

export type ImageEditorTab = 'template' | 'background' | 'text' | 'decorative' | 'config';

interface ImageEditorTabsProps {
  activeTab: ImageEditorTab;
  onTabChange: (tab: ImageEditorTab) => void;
}

const TABS = [
  { id: 'template'   as const, label: 'Template',    icon: LayoutTemplate },
  { id: 'background' as const, label: 'Fundo',       icon: Palette        },
  { id: 'text'       as const, label: 'Texto',       icon: Type           },
  { id: 'decorative' as const, label: 'Decorativos', icon: Sparkles       },
  { id: 'config'     as const, label: 'Config',      icon: Settings       },
];

const ImageEditorTabs: React.FC<ImageEditorTabsProps> = ({ activeTab, onTabChange }) => (
  <Tabs tabs={TABS} active={activeTab} onChange={onTabChange} className="bg-white" />
);

import React from 'react';
export default ImageEditorTabs;
