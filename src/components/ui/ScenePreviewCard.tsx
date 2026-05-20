// src/components/ui/ScenePreviewCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, X, Loader2 } from 'lucide-react';
import { Scene, DecorativeElement } from '../../types';
import { VIDEO_TEMPLATES } from '../../config/templates';
import { apiRequest } from '../../config/api';

interface ScenePreviewCardProps {
  scene: Scene;
  template: string;
  decorativeElements?: DecorativeElement[];
  title?: string;
  debounce?: number;
  isGeneratingFinal?: boolean;
}

const ScenePreviewCard: React.FC<ScenePreviewCardProps> = ({
  scene,
  template,
  decorativeElements = [],
  title = 'Preview',
  debounce = 600,
  isGeneratingFinal = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const currentTemplate = VIDEO_TEMPLATES[template] ?? VIDEO_TEMPLATES['instagram_story'];
  const { width, height } = currentTemplate;

  const generate = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const normalizeAnimation = (anim: any) => {
        if (!anim) return null;
        if (typeof anim === 'string') return { type: anim, duration: 1.0 };
        if (typeof anim === 'object' && anim.type) return { type: anim.type, duration: anim.duration ?? 1.0 };
        return null;
      };

      const normalizeTransition = (t: any) => {
        if (!t) return null;
        if (typeof t === 'string') return { type: t, duration: 1.0 };
        if (typeof t === 'object' && t.type) return { type: t.type, duration: t.duration ?? 1.0 };
        return null;
      };

      const payload = {
        template,
        fps: 10,
        scene: {
          ...scene,
          transition_from_previous: normalizeTransition(scene.transition),
          text_elements: scene.text_elements.map(el => ({
            ...el,
            animation: normalizeAnimation(el.animation),
          })),
        },
        decorative_elements: decorativeElements,
      };
      const data = await apiRequest('/api/v1/previews/scene', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (data?.preview_image) setPreviewUrl(data.preview_image);
      else throw new Error('Resposta inválida da API de preview.');
    } catch (err: any) {
      if (err?.name !== 'AbortError')
        setError(err instanceof Error ? err.message : 'Erro ao gerar preview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isGeneratingFinal) return;
    const t = setTimeout(generate, debounce);
    return () => clearTimeout(t);
  }, [scene, template, decorativeElements, isGeneratingFinal]);

  return (
    // Ocupa toda a área do pai (coluna direita h-full)
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 shrink-0">
        <span className="text-xs font-semibold text-slate-700">{title}</span>
        <button
          onClick={generate}
          disabled={loading || isGeneratingFinal}
          className="flex items-center gap-1 px-2 py-1 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-40 text-xs transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/*
        Canvas: flex-1 para ocupar toda a altura restante.
        O truque: usamos um wrapper que centraliza um elemento filho
        com aspect-ratio definido. O filho cresce até tocar a borda
        menor (width ou height) graças a max-w/max-h 100%.
      */}
      <div className="flex-1 min-h-0 bg-slate-100 flex items-center justify-center p-2">
        <div
          className="relative bg-slate-200 rounded overflow-hidden"
          style={{
            aspectRatio: `${width} / ${height}`,
            maxWidth: '100%',
            maxHeight: '100%',
            // Para portrait (height > width): limita pela altura
            // Para landscape (width > height): limita pela largura
            width: width >= height ? '100%' : 'auto',
            height: height > width ? '100%' : 'auto',
          }}
        >
          {/* Loading */}
          {(loading || isGeneratingFinal) && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 text-white gap-1.5">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-xs">{isGeneratingFinal ? 'Gerando...' : 'Gerando preview...'}</span>
            </div>
          )}

          {/* Erro */}
          {error && !loading && !isGeneratingFinal && (
            <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-3 text-center">
              <X className="w-5 h-5 text-red-500 mb-1" />
              <p className="text-[10px] font-semibold text-red-700">Erro no Preview</p>
              <p className="text-[10px] text-red-500 mt-0.5 line-clamp-3">{error}</p>
            </div>
          )}

          {/* Imagem */}
          {previewUrl && !loading && !isGeneratingFinal && !error && (
            <img src={previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-fill" />
          )}

          {/* Placeholder */}
          {!previewUrl && !loading && !isGeneratingFinal && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-[10px] text-slate-400 text-center px-3">O preview aparecerá aqui.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenePreviewCard;
