// File: src/components/ImageEditor/ImagePreview.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useMemo, useEffect, useState } from 'react';
import { Loader2, Eye, RefreshCw, X } from 'lucide-react';
import { ImageConfig, VideoTemplate, Scene } from '../../types';
import { apiRequest } from '../../config/api';

interface ImagePreviewProps {
  config: ImageConfig;
  isGenerating: boolean;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ config, isGenerating }) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isPreviewGenerating, setIsPreviewGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const templates = useMemo((): Record<string, VideoTemplate> => ({
    instagram_story: { name: 'instagram_story', width: 1080, height: 1920, fps: 24, aspectRatio: '9/16', description: 'Instagram Story' },
    instagram_feed: { name: 'instagram_feed', width: 1080, height: 1350, fps: 24, aspectRatio: '4/5', description: 'Instagram Feed' },
    youtube_thumbnail: { name: 'youtube_thumbnail', width: 1280, height: 720, fps: 24, aspectRatio: '16/9', description: 'YouTube' },
  }), []);

  const currentTemplate = templates[config.template] || templates['instagram_story'];

  const generateServerPreview = async () => {
    setIsPreviewGenerating(true);
    setError(null);
    try {
      const scenePayload: Partial<Scene> = {
        ...config.scene,
        text_elements: config.scene.text_elements.map(el => ({ ...el, animation: null }))
      };

      const payload = {
        template: config.template,
        fps: 10,
        scene: scenePayload,
        decorative_elements: config.decorative_elements,
      };

      const data = await apiRequest('/api/v1/previews/scene', { method: 'POST', body: JSON.stringify(payload) });

      if (data && data.preview_image) {
        setPreviewImageUrl(data.preview_image);
      } else {
        throw new Error('Resposta da API inválida para o preview.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao gerar preview.');
    } finally {
      setIsPreviewGenerating(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => { if (!isGenerating) { generateServerPreview(); } }, 1200);
    return () => clearTimeout(handler);
  }, [config, isGenerating]);

  return (
    // CORREÇÃO: O contêiner principal tem a classe 'sticky' para acompanhar a rolagem.
    <div className="sticky top-6 bg-white rounded-xl border border-slate-200 p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-hidden flex flex-col">
       <div className="flex items-center justify-between flex-shrink-0">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Eye className="w-5 h-5 text-indigo-600" />Preview da Imagem</h3>
        <button onClick={generateServerPreview} disabled={isGenerating || isPreviewGenerating} className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 text-sm">
          <RefreshCw className={`w-4 h-4 ${isPreviewGenerating ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>
      <div 
        className="relative w-full bg-slate-200 rounded-lg overflow-hidden shadow-inner flex items-center justify-center flex-1" 
        style={{ aspectRatio: `${currentTemplate.width} / ${currentTemplate.height}` }}
      >
        {(isGenerating || isPreviewGenerating) && (
          <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center z-10 text-white">
            <Loader2 className="w-8 h-8 animate-spin"/>
            <span className="text-sm mt-2">{isGenerating ? "Gerando Imagem Final..." : "Gerando preview..."}</span>
          </div>
        )}
        
        {error && !isGenerating && !isPreviewGenerating && (
          <div className="absolute inset-0 bg-red-50 flex flex-col p-4 items-center justify-center text-center">
            <X className="w-8 h-8 text-red-500 mb-2"/>
            <p className="font-semibold text-red-700">Erro no Preview</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        )}
        
        {previewImageUrl && !isGenerating && !isPreviewGenerating && !error && (
          <img src={previewImageUrl} alt="Preview da Imagem" className="max-w-full max-h-full object-contain" />
        )}

        {!previewImageUrl && !isGenerating && !isPreviewGenerating && !error && (
          <div className="text-slate-500 p-4 text-center"><p>O preview da imagem aparecerá aqui.</p></div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;