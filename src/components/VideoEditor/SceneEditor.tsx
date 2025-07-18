// File: src/components/VideoEditor/SceneEditor.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Music, ArrowRight, Clock, Type, Palette, AudioLines, Film, MessageSquare } from 'lucide-react';
import { Scene, TextElement, Transition, VideoConfig } from '../../types';
import { apiRequest } from '../../config/api';
import TextElementEditor from './TextElementEditor';
import BackgroundEditor from './BackgroundEditor';
import ScenePreview from './ScenePreview';
import SceneAudioEditor from './SceneAudioEditor';

interface SceneEditorProps {
  config: VideoConfig;
  onConfigChange: (config: VideoConfig) => void;
}

const SceneEditor: React.FC<SceneEditorProps> = ({ config, onConfigChange }) => {
  const { scenes, template, decorative_elements } = config;
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [transitions, setTransitions] = useState<Transition[]>([]);

  useEffect(() => {
    if (activeSceneIndex >= scenes.length && scenes.length > 0) {
      setActiveSceneIndex(scenes.length - 1);
    }
  }, [scenes, activeSceneIndex]);

  useEffect(() => {
    const fetchTransitions = async () => {
      try {
        const data = await apiRequest('/api/v1/utils/list_transitions');
        if (data && data.transitions) setTransitions(data.transitions);
      } catch (error) {
        console.error('Erro ao buscar transições:', error);
      }
    };
    fetchTransitions();
  }, []);

  const onScenesChange = (newScenes: Scene[]) => {
    onConfigChange({ ...config, scenes: newScenes });
  };

  const addScene = () => {
    const newScene: Scene = {
      duration: 5,
      background: { type: 'color', color: '#000000' },
      text_elements: [],
      narration: null,
      effects_audio: [],
      subtitles: { enabled: false, font: 'Arial', font_size: 48, color: '#FFFFFF', stroke_color: '#000000', stroke_width: 2, position: ['center', 'bottom']},
      transition: 'fade'
    };
    onScenesChange([...scenes, newScene]);
    setActiveSceneIndex(scenes.length);
  };

  const deleteScene = (index: number) => {
    if (scenes.length > 1) onScenesChange(scenes.filter((_, i) => i !== index));
  };

  const duplicateScene = (index: number) => {
    const sceneToDuplicate = JSON.parse(JSON.stringify(scenes[index]));
    const newScenes = [...scenes];
    newScenes.splice(index + 1, 0, sceneToDuplicate);
    onScenesChange(newScenes);
  };

  const updateScene = (index: number, updatedSceneData: Partial<Scene>) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], ...updatedSceneData };
    onScenesChange(newScenes);
  };
  
  const activeScene = scenes[activeSceneIndex];

  if (!activeScene) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Nenhuma cena para editar.</p>
        <button onClick={addScene} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">Adicionar Primeira Cena</button>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto px-6">
      <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Editor de Cenas</h2>
            <p className="text-slate-600">Crie e gerencie as cenas do seu vídeo</p>
          </div>
          <button onClick={addScene} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"><Plus className="w-4 h-4" /> Nova Cena</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-slate-200 p-4 sticky top-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Film size={18}/> Cenas ({scenes.length})</h3>
            <div className="space-y-2 max-h-[75vh] overflow-y-auto pr-2">
              {scenes.map((scene, index) => (
                <div key={index}>
                  <div className={`p-3 rounded-lg border transition-all cursor-pointer ${activeSceneIndex === index ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}
                    onClick={() => setActiveSceneIndex(index)}>
                     <div className="flex items-start justify-between">
                       <div className="font-medium text-sm flex items-center gap-2">
                         <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${activeSceneIndex === index ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{index + 1}</span>
                         <span className="truncate">Cena {index + 1}</span>
                       </div>
                       <div className="flex gap-1">
                         <button onClick={(e) => { e.stopPropagation(); duplicateScene(index); }} className="p-1 text-slate-400 hover:text-blue-500" title="Duplicar"><Copy className="w-3 h-3" /></button>
                         {scenes.length > 1 && <button onClick={(e) => { e.stopPropagation(); deleteScene(index); }} className="p-1 text-slate-400 hover:text-red-500" title="Excluir"><Trash2 className="w-3 h-3" /></button>}
                       </div>
                     </div>
                     <div className="text-xs text-slate-500 mt-1 pl-8 flex items-center gap-2">
                        <span>{scene.duration?.toFixed(1)}s</span>
                        {scene.narration && <span title="Contém narração"><Music className="w-3 h-3 text-blue-500"/></span>}
                        {scene.subtitles.enabled && <span title="Legendas ativadas"><MessageSquare className="w-3 h-3 text-green-500"/></span>}
                     </div>
                  </div>
                  {index < scenes.length - 1 && (
                    <div className="flex items-center justify-center py-2 text-xs text-slate-400 gap-2"><ArrowRight className="w-3 h-3" /> Transição</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 grid grid-cols-1 xl:grid-cols-10 gap-6">
            <div className="xl:col-span-6 space-y-6">
                <details className="bg-white rounded-xl border border-slate-200 group" open>
                    <summary className="p-4 flex items-center justify-between cursor-pointer font-medium text-slate-800">
                        <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-blue-600" />Configurações da Cena</div>
                        <div className="transform transition-transform group-open:rotate-90"><ArrowRight size={16}/></div>
                    </summary>
                    <div className="p-4 border-t border-slate-100 grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Duração ({activeScene.duration?.toFixed(1) || 0}s)</label>
                            <input type="range" min="0.5" max="60" step="0.1" value={activeScene.duration || 0} onChange={(e) => updateScene(activeSceneIndex, { duration: parseFloat(e.target.value) || 0 })} className="w-full" disabled={!!activeScene.narration} />
                            {activeScene.narration && <p className="text-xs text-slate-500 mt-1">Duração definida pelo áudio.</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Transição para esta Cena</label>
                            <select value={activeScene.transition || ''} onChange={(e) => updateScene(activeSceneIndex, { transition: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg bg-white" disabled={activeSceneIndex === 0}>
                            <option value="">Nenhuma</option>
                            {transitions.map(t => <option key={t.name} value={t.name}>{t.description}</option>)}
                            </select>
                            {activeSceneIndex === 0 && <p className="text-xs text-slate-500 mt-1">A primeira cena não pode ter transição.</p>}
                        </div>
                    </div>
                </details>

                <details className="bg-white rounded-xl border border-slate-200 group">
                    <summary className="p-4 flex items-center justify-between cursor-pointer font-medium text-slate-800">
                        <div className="flex items-center gap-3"><Palette className="w-5 h-5 text-green-600" />Fundo da Cena</div>
                        <div className="transform transition-transform group-open:rotate-90"><ArrowRight size={16}/></div>
                    </summary>
                    <div className="p-4 border-t"><BackgroundEditor background={activeScene.background} onBackgroundChange={(bg) => updateScene(activeSceneIndex, { background: bg })} /></div>
                </details>

                <details className="bg-white rounded-xl border border-slate-200 group">
                     <summary className="p-4 flex items-center justify-between cursor-pointer font-medium text-slate-800">
                        <div className="flex items-center gap-3"><AudioLines className="w-5 h-5 text-purple-600" />Áudio da Cena</div>
                        <div className="transform transition-transform group-open:rotate-90"><ArrowRight size={16}/></div>
                    </summary>
                    <div className="p-4 border-t">
                        <SceneAudioEditor
                            scene={activeScene}
                            onUpdateScene={(updates) => updateScene(activeSceneIndex, updates)}
                            sceneIndex={activeSceneIndex}
                        />
                    </div>
                </details>

                <details className="bg-white rounded-xl border border-slate-200 group" open>
                    <summary className="p-4 flex items-center justify-between cursor-pointer font-medium text-slate-800">
                        <div className="flex items-center gap-3"><Type className="w-5 h-5 text-orange-600" />Elementos de Texto ({activeScene.text_elements.length})</div>
                        <button onClick={(e) => {
                            e.stopPropagation(); e.preventDefault();
                            const newTextElement: TextElement = { text: 'Novo texto', font_size: 48, fill: {type: 'solid', color: '#ffffff', gradient_colors: [], gradient_angle: 90}, font: null, position: { x: 'center', y: 'auto' }, animation: 'fade_in', alignment: 'center', line_height: 1.2, background_color: null, background_opacity: 0.5, border_color: null, border_width: 0, background_padding: 20, background_border_radius: 0, stroke_color: null, stroke_width: 0, shadow: null, margin_bottom: 20 };
                            updateScene(activeSceneIndex, { text_elements: [...activeScene.text_elements, newTextElement] });
                        }} className="flex items-center gap-2 px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm"><Plus className="w-4 h-4" /> Adicionar</button>
                    </summary>
                    {activeScene.text_elements.length > 0 && (
                        <div className="px-4 pb-4 space-y-4 border-t border-slate-100 pt-4">
                        {activeScene.text_elements.map((textElement, textIndex) => (
                            <details key={textIndex} className="border border-slate-200 rounded-lg bg-slate-50/50" open>
                            <summary className="p-4 flex items-center justify-between cursor-pointer">
                                <h4 className="font-medium text-slate-900 truncate">Texto {textIndex + 1}: "{textElement.text.substring(0, 20)}..."</h4>
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    const newTextElements = activeScene.text_elements.filter((_, i) => i !== textIndex);
                                    updateScene(activeSceneIndex, { text_elements: newTextElements });
                                    }} className="p-2 text-slate-400 hover:text-red-500" title="Remover"><Trash2 className="w-4 h-4" /></button>
                            </summary>
                            <div className="p-4 border-t border-slate-200 bg-white">
                                <TextElementEditor
                                    textElement={textElement}
                                    elementIndex={textIndex}
                                    sceneTextElements={activeScene.text_elements}
                                    onTextElementChange={(updatedTextElement) => {
                                        const newTextElements = [...activeScene.text_elements];
                                        newTextElements[textIndex] = updatedTextElement;
                                        updateScene(activeSceneIndex, { text_elements: newTextElements });
                                    }}
                                />
                            </div>
                            </details>
                        ))}
                        </div>
                    )}
                </details>
            </div>
            {/* CORREÇÃO: A div que envolve o preview não precisa mais de classes de posicionamento */}
            <div className="xl:col-span-4">
                <ScenePreview scene={activeScene} template={template} decorativeElements={decorative_elements} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default SceneEditor;