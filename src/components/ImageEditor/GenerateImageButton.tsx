// File: src/components/ImageEditor/GenerateImageButton.tsx
// Crie este novo arquivo.

import React from 'react';
import { Image as ImageIcon, Loader2 } from 'lucide-react';
import { ImageConfig } from '../../types';
import { apiRequest } from '../../config/api';

interface GenerateImageButtonProps {
  config: ImageConfig;
  isGenerating: boolean;
  onGeneratingChange: (generating: boolean) => void;
  onImageGenerated: (imageUrl: string | null) => void;
}

const GenerateImageButton: React.FC<GenerateImageButtonProps> = ({
  config,
  isGenerating,
  onGeneratingChange,
  onImageGenerated,
}) => {
  
  const generateImage = async () => {
    onGeneratingChange(true);
    onImageGenerated(null);

    try {
      const payload = { config };
      
      const response = await apiRequest('/api/v1/images/generate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      onImageGenerated(imageUrl);

    } catch (error) {
      console.error('🔥 Erro na geração da imagem:', error);
      alert('Falha ao gerar a imagem. Verifique o console para mais detalhes.');
      onImageGenerated(null);
    } finally {
      onGeneratingChange(false);
    }
  };

  const canGenerate = () => {
    return config.scene.text_elements.length > 0 || config.scene.background.path;
  };

  return (
    <button
      onClick={generateImage}
      disabled={isGenerating || !canGenerate()}
      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all text-sm bg-gradient-to-r from-green-500 to-cyan-500 text-white hover:from-green-600 hover:to-cyan-600 shadow disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none disabled:cursor-not-allowed"
    >
      {isGenerating ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</>
      ) : (
        <><ImageIcon className="w-4 h-4" /> Gerar Imagem</>
      )}
    </button>
  );
};

export default GenerateImageButton;
