// File: src/components/VideoEditor/ScenePreview.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState, useEffect, useMemo } from 'react';
import { Eye, RefreshCw, X, Loader2 } from 'lucide-react';
import { Scene, VideoTemplate, DecorativeElement } from '../../types';
import { apiRequest } from '../../config/api';

interface ScenePreviewProps {
  scene: Scene;
  template: string;
  decorativeElements: DecorativeElement[];
}

const ScenePreview: React.FC<ScenePreviewProps> = ({
  scene,
  template,
  decorativeElements,
}) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const templates = useMemo((): Record<string, VideoTemplate> => ({
    instagram_story: { name: 'instagram_story', width: 1080, height: 1920, fps: 24, aspectRatio: '9/16', description: 'Instagram Story' },
    instagram_feed: { name: 'instagram_feed', width: 1080, height: 1350, fps: 24, aspectRatio: '4/5', description: 'Instagram Feed' },
    facebook_feed: { name: 'facebook_feed', width: 1200, height: 630, fps: 24, aspectRatio: '120/63', description: 'Facebook Feed' },
    youtube_thumbnail: { name: 'youtube_thumbnail', width: 1280, height: 720, fps: 24, aspectRatio: '16/9', description: 'YouTube' },
    tiktok: { name: 'tiktok', width: 1080, height: 1920, fps: 24, aspectRatio: '9/16', description: 'TikTok' },
    custom: { name: 'custom', width: 1920, height: 1080, fps: 24, aspectRatio: '16/9', description: 'Custom' },
  }), []);

  const currentTemplate = templates[template] || templates['instagram_story'];

  // Lógica original de geração de preview, que já funcionava corretamente.
  const generateServerPreview = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const payload = {
        template: template,
        fps: 10, // FPS baixo para um preview rápido
        scene: {
            ...scene,
            transition_from_previous: scene.transition ? { type: scene.transition, duration: 1.0 } : null,
            text_elements: scene.text_elements.map(el => ({
                ...el,
                animation: el.animation ? { type: el.animation, duration: 1.0 } : null
            }))
        },
        decorative_elements: decorativeElements,
      };

      const data = await apiRequest('/api/v1/previews/scene', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data && data.preview_image) {
        setPreviewImageUrl(data.preview_image);
      } else {
        throw new Error('Resposta da API inválida para o preview da cena.');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao gerar preview.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  useEffect(() => {
    const handler = setTimeout(() => {
      generateServerPreview();
    }, 1200);
    return () => clearTimeout(handler);
  }, [scene, template, decorativeElements]);


  return (
    // ESTILO CORRIGIDO: Contêiner com altura máxima e comportamento "sticky". Lógica interna preservada.
    <div className="sticky top-6 bg-white rounded-xl border border-slate-200 p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Eye className="w-5 h-5 text-indigo-600" />Preview da Cena</h3>
        <button onClick={generateServerPreview} disabled={isGenerating} className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 text-sm">
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>
      <div 
        className="relative w-full bg-slate-200 rounded-lg overflow-hidden shadow-inner flex items-center justify-center flex-1" 
        style={{ aspectRatio: `${currentTemplate.width} / ${currentTemplate.height}` }}
      >
        {isGenerating && (
            <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center z-10 text-white">
                <Loader2 className="w-8 h-8 animate-spin"/>
                <span className="text-sm mt-2">Gerando preview...</span>
            </div>
        )}
        {error && !isGenerating && (
            <div className="absolute inset-0 bg-red-50 flex flex-col p-4 items-center justify-center text-center">
                <X className="w-8 h-8 text-red-500 mb-2"/>
                <p className="font-semibold text-red-700">Erro no Preview</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
        )}
        
        {previewImageUrl && !isGenerating && !error && (
            <img 
                src={previewImageUrl} 
                alt="Preview da Cena"
                className="max-w-full max-h-full object-contain"
            />
        )}

         {!previewImageUrl && !isGenerating && !error && (
            <div className="text-slate-500">O preview da cena aparecerá aqui.</div>
        )}
      </div>
    </div>
  );
};

export default ScenePreview;