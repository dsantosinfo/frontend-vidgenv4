// src/components/VideoEditor/EditorTabs.tsx
import { Monitor, Layers, Music, Settings, Sparkles } from 'lucide-react';
import { Tabs } from '../ui';

export type VideoEditorTab = 'template' | 'scenes' | 'decorative' | 'audio' | 'config';

interface EditorTabsProps {
  activeTab: VideoEditorTab;
  onTabChange: (tab: VideoEditorTab) => void;
}

const TABS = [
  { id: 'template'  as const, label: 'Template',    icon: Monitor  },
  { id: 'scenes'    as const, label: 'Cenas',        icon: Layers   },
  { id: 'decorative'as const, label: 'Decorativos',  icon: Sparkles },
  { id: 'audio'     as const, label: 'Áudio',        icon: Music    },
  { id: 'config'    as const, label: 'Config',       icon: Settings },
];

const EditorTabs: React.FC<EditorTabsProps> = ({ activeTab, onTabChange }) => (
  <Tabs tabs={TABS} active={activeTab} onChange={onTabChange} />
);

import React from 'react';
export default EditorTabs;
