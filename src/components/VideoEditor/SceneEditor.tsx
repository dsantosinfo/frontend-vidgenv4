// src/components/VideoEditor/SceneEditor.tsx
import React, { useEffect, useState } from 'react';
import {
  Plus, Trash2, Copy, Music, Clock,
  Type, Palette, AudioLines, MessageSquare, ArrowUp, ArrowDown,
} from 'lucide-react';
import { Scene, TextElement, Transition, VideoConfig } from '../../types';
import { apiRequest } from '../../config/api';
import TextElementEditor from './TextElementEditor';
import BackgroundEditor from './BackgroundEditor';
import SceneAudioEditor from './SceneAudioEditor';

interface SceneEditorProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
  activeSceneIndex: number;
  onActiveSceneChange: (i: number) => void;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ config, onConfigChange, activeSceneIndex, onActiveSceneChange }) => {
  const { scenes, template } = config;
  const [transitions, setTransitions] = useState<Transition[]>([]);

  useEffect(() => {
    if (activeSceneIndex >= scenes.length && scenes.length > 0)
      onActiveSceneChange(scenes.length - 1);
  }, [scenes.length]);

  useEffect(() => {
    apiRequest('/api/v1/utils/list_transitions')
      .then(d => d?.transitions && setTransitions(d.transitions))
      .catch(() => {});
  }, []);

  const updateScenes = (s: Scene[]) => onConfigChange({ ...config, scenes: s });

  const addScene = () => {
    const s: Scene = {
      duration: 5,
      background: { type: 'color', color: '#000000' },
      text_elements: [],
      narration: null,
      effects_audio: [],
      subtitles: { enabled: false, font: 'Arial', font_size: 48, color: '#FFFFFF', stroke_color: '#000000', stroke_width: 2, position: ['center', 'bottom'] },
      transition: 'fade',
    };
    updateScenes([...scenes, s]);
    onActiveSceneChange(scenes.length);
  };

  const deleteScene = (i: number) => {
    if (scenes.length > 1) updateScenes(scenes.filter((_, idx) => idx !== i));
  };

  const duplicateScene = (i: number) => {
    const copy = JSON.parse(JSON.stringify(scenes[i]));
    const next = [...scenes];
    next.splice(i + 1, 0, copy);
    updateScenes(next);
  };

  const updateScene = (i: number, patch: Partial<Scene>) => {
    const next = [...scenes];
    next[i] = { ...next[i], ...patch };
    updateScenes(next);
  };

  const moveScene = (i: number, dir: 'up' | 'down') => {
    const t = dir === 'up' ? i - 1 : i + 1;
    if (t < 0 || t >= scenes.length) return;
    const next = [...scenes];
    [next[i], next[t]] = [next[t], next[i]];
    updateScenes(next);
    onActiveSceneChange(t);
  };

  const activeScene = scenes[activeSceneIndex];

  const inputCls = 'w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500';
  const labelCls = 'block text-[10px] font-medium text-slate-600 mb-0.5';
  const sectionCls = 'bg-white rounded-lg border border-slate-200';
  const summaryCls = 'px-3 py-2 flex items-center justify-between cursor-pointer select-none list-none';

  if (!activeScene) return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <p className="text-xs text-slate-500">Nenhuma cena.</p>
      <button onClick={addScene} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-xs">Adicionar cena</button>
    </div>
  );

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Barra de cenas horizontal */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
        {scenes.map((scene, i) => (
          <button
            key={i}
            onClick={() => onActiveSceneChange(i)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all shrink-0 ${
              activeSceneIndex === i
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
              activeSceneIndex === i ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'
            }`}>{i + 1}</span>
            <span>{scene.duration?.toFixed(1)}s</span>
            {scene.narration && <Music className="w-2.5 h-2.5 text-blue-400" />}
            {scene.subtitles.enabled && <MessageSquare className="w-2.5 h-2.5 text-green-400" />}
            {/* Ações inline */}
            <span className="flex gap-0.5 ml-0.5" onClick={e => e.stopPropagation()}>
              <button onClick={() => moveScene(i, 'up')} disabled={i === 0}
                className="p-0.5 text-slate-300 hover:text-blue-500 disabled:opacity-20"><ArrowUp className="w-2.5 h-2.5" /></button>
              <button onClick={() => moveScene(i, 'down')} disabled={i === scenes.length - 1}
                className="p-0.5 text-slate-300 hover:text-blue-500 disabled:opacity-20"><ArrowDown className="w-2.5 h-2.5" /></button>
              <button onClick={() => duplicateScene(i)}
                className="p-0.5 text-slate-300 hover:text-blue-500"><Copy className="w-2.5 h-2.5" /></button>
              {scenes.length > 1 && (
                <button onClick={() => deleteScene(i)}
                  className="p-0.5 text-slate-300 hover:text-red-500"><Trash2 className="w-2.5 h-2.5" /></button>
              )}
            </span>
          </button>
        ))}
        <button
          onClick={addScene}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:border-blue-400 hover:text-blue-600 whitespace-nowrap shrink-0 transition-colors"
        >
          <Plus className="w-3 h-3" /> Nova cena
        </button>
      </div>

      {/* Editor da cena ativa */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">

        {/* Configurações */}
        <details className={sectionCls} open>
          <summary className={summaryCls}>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <Clock className="w-3.5 h-3.5 text-blue-500" /> Configurações da cena
            </span>
          </summary>
          <div className="px-3 pb-3 border-t border-slate-100 pt-2 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Duração ({activeScene.duration?.toFixed(1)}s)</label>
              <input type="range" min="0.5" max="60" step="0.1"
                value={activeScene.duration || 0}
                onChange={e => updateScene(activeSceneIndex, { duration: parseFloat(e.target.value) })}
                className="w-full" disabled={!!activeScene.narration} />
              {activeScene.narration && <p className="text-[10px] text-slate-400 mt-0.5">Definida pelo áudio.</p>}
            </div>
            <div>
              <label className={labelCls}>Transição de entrada</label>
              <select value={activeScene.transition || ''} onChange={e => updateScene(activeSceneIndex, { transition: e.target.value })}
                className={inputCls} disabled={activeSceneIndex === 0}>
                <option value="">Nenhuma</option>
                {transitions.map(t => <option key={t.name} value={t.name}>{t.description}</option>)}
              </select>
              {activeSceneIndex === 0 && <p className="text-[10px] text-slate-400 mt-0.5">Primeira cena sem transição.</p>}
            </div>
          </div>
        </details>

        {/* Fundo */}
        <details className={sectionCls}>
          <summary className={summaryCls}>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <Palette className="w-3.5 h-3.5 text-green-500" /> Fundo
            </span>
          </summary>
          <div className="px-3 pb-3 border-t border-slate-100 pt-2">
            <BackgroundEditor
              background={activeScene.background}
              onBackgroundChange={bg => updateScene(activeSceneIndex, { background: bg })}
            />
          </div>
        </details>

        {/* Áudio */}
        <details className={sectionCls}>
          <summary className={summaryCls}>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <AudioLines className="w-3.5 h-3.5 text-purple-500" /> Áudio da cena
            </span>
          </summary>
          <div className="px-3 pb-3 border-t border-slate-100 pt-2">
            <SceneAudioEditor
              scene={activeScene}
              onUpdateScene={patch => updateScene(activeSceneIndex, patch)}
              sceneIndex={activeSceneIndex}
            />
          </div>
        </details>

        {/* Textos */}
        <details className={sectionCls} open>
          <summary className={summaryCls}>
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
              <Type className="w-3.5 h-3.5 text-orange-500" /> Textos ({activeScene.text_elements.length})
            </span>
            <button
              onClick={e => {
                e.stopPropagation(); e.preventDefault();
                const el: TextElement = {
                  text: 'Novo texto', font_size: 48,
                  fill: { type: 'solid', color: '#ffffff', gradient_colors: [], gradient_angle: 90 },
                  font: null, position: { x: 'center', y: 'auto' }, animation: 'fade_in',
                  alignment: 'center', line_height: 1.2, background_color: null,
                  background_opacity: 0.5, border_color: null, border_width: 0,
                  background_padding: 20, background_border_radius: 0,
                  stroke_color: null, stroke_width: 0, shadow: null, margin_bottom: 20,
                };
                updateScene(activeSceneIndex, { text_elements: [...activeScene.text_elements, el] });
              }}
              className="flex items-center gap-1 px-2 py-1 bg-orange-500 text-white rounded-lg text-[10px] font-medium hover:bg-orange-600"
            >
              <Plus className="w-3 h-3" /> Adicionar
            </button>
          </summary>
          {activeScene.text_elements.length > 0 && (
            <div className="px-3 pb-3 border-t border-slate-100 pt-2 space-y-2">
              {activeScene.text_elements.map((el, ti) => (
                <details key={ti} className="border border-slate-200 rounded-lg bg-slate-50/50">
                  <summary className="px-3 py-2 flex items-center justify-between cursor-pointer list-none">
                    <span className="text-xs font-medium text-slate-700 truncate">
                      Texto {ti + 1}: "{el.text.substring(0, 22)}{el.text.length > 22 ? '…' : ''}"
                    </span>
                    <button
                      onClick={e => {
                        e.preventDefault();
                        updateScene(activeSceneIndex, { text_elements: activeScene.text_elements.filter((_, idx) => idx !== ti) });
                      }}
                      className="p-1 text-slate-400 hover:text-red-500 shrink-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </summary>
                  <div className="px-3 pb-3 border-t border-slate-200 bg-white pt-2">
                    <TextElementEditor
                      textElement={el}
                      elementIndex={ti}
                      sceneTextElements={activeScene.text_elements}
                      template={template}
                      onTextElementChange={updated => {
                        const next = [...activeScene.text_elements];
                        next[ti] = updated;
                        updateScene(activeSceneIndex, { text_elements: next });
                      }}
                    />
                  </div>
                </details>
              ))}
            </div>
          )}
        </details>
      </div>
    </div>
  );
};

export default SceneEditor;
