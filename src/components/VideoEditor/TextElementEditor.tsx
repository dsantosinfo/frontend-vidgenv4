// File: src/components/VideoEditor/TextElementEditor.tsx
// Substitua o conteúdo completo deste arquivo.

import React, { useState, useEffect, useRef } from 'react';
import {
    AlignLeft, AlignCenter, AlignRight,
    Paintbrush, Blend, Type, Sparkles, Loader2, Plus, Trash2, Palette, ChevronDown, ChevronUp, ChevronRight, Layers
} from 'lucide-react';
import { TextElement, Font, Animation, Shadow, TextFill, Position, OuterGlow, Extrude, Curve, FileUploadRecord, FilePurpose } from '../../types';
import { apiRequest, uploadFile, getCompanyPresets } from '../../config/api';
import { getTemplateWidth } from '../../config/templates';
import PaletteExtractor from '../PaletteExtractor';
import { useCompany } from '../../context/CompanyContext';

const PaletteSection: React.FC<{ onColorSelect: (hex: string) => void }> = ({ onColorSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 transition-colors"
      >
        <Palette className="w-3.5 h-3.5" />
        Extrair paleta
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>
      {open && (
        <div className="mt-2 p-3 bg-white border border-slate-200 rounded-lg">
          <PaletteExtractor onColorSelect={(hex) => { onColorSelect(hex); setOpen(false); }} />
        </div>
      )}
    </div>
  );
};

interface TextElementEditorProps {
  textElement: TextElement;
  onTextElementChange: (textElement: TextElement) => void;
  elementIndex: number;
  sceneTextElements: TextElement[];
  template?: string;
}

const TextElementEditor: React.FC<TextElementEditorProps> = ({
  textElement,
  onTextElementChange,
  elementIndex,
  sceneTextElements,
  template = 'instagram_story'
}) => {
  const { activeCompany } = useCompany();
  const [fonts, setFonts] = useState<Font[]>([]);
  const [animations, setAnimations] = useState<Animation[]>([]);
  const [textureFiles, setTextureFiles] = useState<FileUploadRecord[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [textPresets, setTextPresets] = useState<any[]>([]);
  const [showTextPresets, setShowTextPresets] = useState(false);
  const textureFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchFonts();
    fetchAnimations();
    fetchTextureFiles();
    if (activeCompany) {
      getCompanyPresets(activeCompany.id, 'text_style')
        .then(data => setTextPresets(data ?? []))
        .catch(() => {});
    }
  }, [activeCompany]);

  useEffect(() => {
    const handler = setTimeout(() => {
      generatePreview();
    }, 400);
    return () => clearTimeout(handler);
  }, [textElement, template]);

  const fetchFonts = async () => {
    try {
      const data = await apiRequest('/api/v1/utils/list_fonts');
      if (data && data.fonts) setFonts(data.fonts);
    } catch (error) {
      console.error('Erro ao buscar fontes:', error);
    }
  };
  
  const fetchAnimations = async () => {
    try {
      const data = await apiRequest('/api/v1/utils/list_animations');
      if (data && data.animations) setAnimations(data.animations);
    } catch (error) {
      console.error('Erro ao buscar animações:', error);
    }
  };

  const fetchTextureFiles = async () => {
    try {
      const data: FileUploadRecord[] = await apiRequest('/api/v1/files/list_uploads');
      if (data && Array.isArray(data)) {
        setTextureFiles(data.filter(f => f.purpose === FilePurpose.TEXTURE_IMAGE));
      }
    } catch (error) { console.error('Erro ao buscar texturas:', error); }
  };
  
  const handleTextureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await uploadFile(file, FilePurpose.TEXTURE_IMAGE);
      await fetchTextureFiles();
    } catch (error: any) {
      alert(`Falha no upload da textura: ${error.message}`);
    }
  };

  const handleChange = (updates: Partial<TextElement>) => onTextElementChange({ ...textElement, ...updates });
  const handleFillChange = (updates: Partial<TextFill>) => handleChange({ fill: { ...textElement.fill, ...updates } });
  const handleShadowChange = (updates: Partial<Shadow>) => handleChange({ shadow: textElement.shadow ? { ...textElement.shadow, ...updates } : { color: '#000000', offset_x: 2, offset_y: 2, opacity: 0.5, blur_radius: 3, ...updates } });
  const handleGlowChange = (updates: Partial<OuterGlow>) => handleChange({ outer_glow: textElement.outer_glow ? { ...textElement.outer_glow, ...updates } : { color: '#FFFF00', radius: 10, opacity: 0.8, ...updates } });
  const handleExtrudeChange = (updates: Partial<Extrude>) => handleChange({ extrude: textElement.extrude ? { ...textElement.extrude, ...updates } : { depth: 5, color: '#333333', direction_angle: 135, ...updates } });
  const handleCurveChange = (updates: Partial<Curve>) => handleChange({ curve: textElement.curve ? { ...textElement.curve, ...updates } : { radius: 300, direction: 'up', ...updates } });
  
  const toggleEffect = (effect: 'shadow' | 'outer_glow' | 'extrude' | 'curve', enabled: boolean) => {
    if (enabled) {
      if (effect === 'shadow') handleChange({ shadow: { color: '#000000', offset_x: 2, offset_y: 2, opacity: 0.5, blur_radius: 3 } });
      if (effect === 'outer_glow') handleChange({ outer_glow: { color: '#FFFF00', radius: 10, opacity: 0.8 } });
      if (effect === 'extrude') handleChange({ extrude: { depth: 5, color: '#333333', direction_angle: 135 } });
      if (effect === 'curve') handleChange({ curve: { radius: 300, direction: 'up' } });
    } else {
      handleChange({ [effect]: null });
    }
  };

  const generatePreview = async () => {
    if (!textElement.text) {
      setPreviewImage(null);
      return;
    }
    setIsLoadingPreview(true);
    try {
      // Sanitiza campos numéricos para inteiros (Pydantic é rigoroso)
      const payload: Record<string, any> = {
        ...textElement,
        font_size: Math.round(textElement.font_size),
        border_width: Math.round(textElement.border_width),
        stroke_width: Math.round(textElement.stroke_width),
        background_padding: Math.round(textElement.background_padding),
        background_border_radius: Math.round(textElement.background_border_radius),
        margin_bottom: Math.round(textElement.margin_bottom),
        // max_width baseado na largura real do template (conforme EDITOR_TEMPLATES.md)
        max_width: textElement.max_width != null
          ? Math.round(textElement.max_width)
          : getTemplateWidth(template),
        line_height: textElement.line_height,
        background_opacity: textElement.background_opacity,
        fill: {
          ...textElement.fill,
          gradient_angle: Math.round(textElement.fill.gradient_angle),
        },
        animation: null,
      };

      // Sanitiza shadow se existir
      if (textElement.shadow) {
        payload.shadow = {
          ...textElement.shadow,
          offset_x: Math.round(textElement.shadow.offset_x),
          offset_y: Math.round(textElement.shadow.offset_y),
          blur_radius: Math.round(textElement.shadow.blur_radius),
        };
      } else {
        payload.shadow = null;
      }

      // Sanitiza outer_glow se existir
      if (textElement.outer_glow) {
        payload.outer_glow = {
          ...textElement.outer_glow,
          radius: Math.round(textElement.outer_glow.radius),
        };
      }

      // Sanitiza extrude se existir
      if (textElement.extrude) {
        payload.extrude = {
          ...textElement.extrude,
          depth: Math.round(textElement.extrude.depth),
          direction_angle: textElement.extrude.direction_angle,
        };
      }

      // Sanitiza curve se existir
      if (textElement.curve) {
        payload.curve = textElement.curve;
      }

      const data = await apiRequest('/api/v1/previews/text', {
          method: 'POST',
          body: JSON.stringify(payload)
      });

      if (data && data.preview_image) {
        setPreviewImage(data.preview_image);
      }
    } catch (error) {
      console.error('Erro ao gerar preview do texto:', error);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const X_PRESETS = ['left', 'center', 'right'] as const;
  const Y_PRESETS = ['top', 'center', 'bottom', 'auto'] as const;

  const isXNumeric = typeof textElement.position.x === 'number';
  const isYNumeric = typeof textElement.position.y === 'number';

  const handleAxisChange = (axis: 'x' | 'y', value: string | number) => {
    handleChange({ position: { ...textElement.position, [axis]: value } });
  };

  const firstAutoIndex = sceneTextElements.findIndex(el => el.position.y === 'auto');
  const isFirstAutoElement = elementIndex === firstAutoIndex;

  return (
    <div className="space-y-4">
        {/* Preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="min-h-[100px] bg-slate-100 rounded-lg flex items-center justify-center p-4 relative">
                {isLoadingPreview && <div className="absolute inset-0 bg-white/70 flex items-center justify-center"><Loader2 className="w-6 h-6 text-slate-400 animate-spin" /></div>}
                {previewImage ? (
                   <img src={previewImage} alt="Preview do texto" className="max-w-full h-auto rounded-md" />
                ) : (
                  <p className="text-sm text-slate-500 text-center">O preview do texto aparecerá aqui.</p>
                )}
            </div>
        </div>

        {/* Presets da empresa */}
        {textPresets.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <button
              onClick={() => setShowTextPresets(o => !o)}
              className="flex items-center gap-2 text-sm font-medium text-slate-700 w-full"
            >
              <Layers className="w-4 h-4 text-indigo-500" />
              Presets da empresa
              {showTextPresets ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
            </button>
            {showTextPresets && (
              <div className="mt-3 flex flex-wrap gap-2">
                {textPresets.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const cfg = p.config ?? {};
                      handleChange({
                        ...(cfg.font_size ? { font_size: cfg.font_size } : {}),
                        ...(cfg.alignment ? { alignment: cfg.alignment } : {}),
                        ...(cfg.fill ? { fill: { ...textElement.fill, ...cfg.fill } } : {}),
                        ...(cfg.stroke_color ? { stroke_color: cfg.stroke_color } : {}),
                        ...(cfg.stroke_width ? { stroke_width: cfg.stroke_width } : {}),
                        ...(cfg.shadow !== undefined ? { shadow: cfg.shadow } : {}),
                      });
                    }}
                    className="px-3 py-1.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conteúdo e Fonte */}
        <details className="bg-white rounded-xl border border-slate-200 group" open>
            <summary className="p-4 flex items-center justify-between cursor-pointer font-medium text-slate-800">
                <div className="flex items-center gap-3"><Type size={18} className="text-blue-600"/> Conteúdo e Fonte</div>
                <div className="transform transition-transform group-open:rotate-90"><ChevronRight size={16}/></div>
            </summary>
            <div className="p-4 border-t border-slate-100 space-y-4">
                <textarea
                    value={textElement.text}
                    onChange={(e) => handleChange({ text: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg min-h-[80px]"
                    placeholder="Digite seu texto aqui..."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Fonte</label>
                        <select value={textElement.font || ''} onChange={(e) => handleChange({ font: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg">
                            <option value="">Padrão do Sistema</option>
                            {fonts.map(font => <option key={font.path} value={font.path}>{font.name} ({font.type})</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Alinhamento</label>
                        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                            {(['left', 'center', 'right'] as const).map(align => {
                                const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : AlignRight;
                                return (
                                <button key={align} onClick={() => handleChange({ alignment: align })} className={`flex-1 p-2 rounded-md transition-colors ${textElement.alignment === align ? 'bg-blue-500 text-white' : 'hover:bg-slate-200'}`}>
                                    <Icon size={18} className="mx-auto"/>
                                </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tamanho ({textElement.font_size}px)</label>
                        <input type="range" min="10" max="200" value={textElement.font_size} onChange={(e) => handleChange({ font_size: parseInt(e.target.value) })} className="w-full"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Altura da Linha ({textElement.line_height})</label>
                         <input type="range" min="0.8" max="3" step="0.1" value={textElement.line_height} onChange={(e) => handleChange({ line_height: parseFloat(e.target.value) })} className="w-full"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Largura Máxima ({textElement.max_width || 'Automático'})
                    </label>
                    <input
                        type="range"
                        min="100"
                        max="1920"
                        step="10"
                        value={textElement.max_width || 1080}
                        onChange={(e) => handleChange({ max_width: e.target.value === '' ? null : parseInt(e.target.value) })}
                        className="w-full"
                    />
                    <p className="text-xs text-slate-500 mt-1">Defina a largura máxima do texto. Deixe em automático para usar a largura total da cena.</p>
                </div>
            </div>
        </details>

        {/* Estilo de Preenchimento e Contorno */}
        <details className="bg-white rounded-xl border border-slate-200 group">
            <summary className="p-4 flex items-center justify-between cursor-pointer font-medium text-slate-800">
                <div className="flex items-center gap-3"><Paintbrush size={18} className="text-green-600"/> Estilo de Preenchimento e Contorno</div>
                <div className="transform transition-transform group-open:rotate-90"><ChevronRight size={16}/></div>
            </summary>
            <div className="p-4 border-t border-slate-100 space-y-6">
                <div>
                    <h4 className="font-medium text-slate-800 mb-3">Preenchimento do Texto</h4>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                        <select value={textElement.fill.type} onChange={(e) => handleFillChange({ type: e.target.value as any })} className="w-full p-2 border border-slate-300 rounded-lg">
                            <option value="solid">Cor Sólida</option>
                            <option value="gradient">Gradiente</option>
                            <option value="texture">Textura</option>
                        </select>
                        {textElement.fill.type === 'solid' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Cor</label>
                                <input type="color" value={textElement.fill.color} onChange={(e) => handleFillChange({ color: e.target.value })} className="p-1 h-10 w-full block bg-white border border-slate-300 rounded-md cursor-pointer"/>
                                <PaletteSection onColorSelect={(hex) => handleFillChange({ color: hex })} />
                            </div>
                        )}
                        {textElement.fill.type === 'gradient' && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Cores do Gradiente</label>
                                    {textElement.fill.gradient_colors.map((color, index) => (
                                        <div key={index} className="flex items-center gap-2 mb-2">
                                            <input type="color" value={color} onChange={(e) => handleFillChange({ gradient_colors: textElement.fill.gradient_colors.map((c, i) => i === index ? e.target.value : c) })} className="p-1 h-8 w-16 block bg-white border border-slate-300 rounded-md cursor-pointer"/>
                                            <span className="text-sm font-mono text-slate-600 flex-1">{color}</span>
                                            {textElement.fill.gradient_colors.length > 2 && (<button onClick={() => handleFillChange({ gradient_colors: textElement.fill.gradient_colors.filter((_, i) => i !== index)})} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><Trash2 size={14}/></button>)}
                                        </div>
                                    ))}
                                    <button onClick={() => handleFillChange({ gradient_colors: [...textElement.fill.gradient_colors, '#888888'] })} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Plus size={14}/> Adicionar Cor</button>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Ângulo do Gradiente ({textElement.fill.gradient_angle}°)</label>
                                    <input type="range" min="0" max="360" value={textElement.fill.gradient_angle} onChange={(e) => handleFillChange({gradient_angle: parseInt(e.target.value)})} className="w-full"/>
                                </div>
                            </div>
                        )}
                        {textElement.fill.type === 'texture' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Imagem de Textura</label>
                                <select value={textElement.fill.image_path || ''} onChange={(e) => handleFillChange({ image_path: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg">
                                    <option value="">Selecione uma textura</option>
                                    {textureFiles.map(file => <option key={file.id} value={file.file_path}>{file.original_filename}</option>)}
                                </select>
                                <button onClick={() => textureFileInputRef.current?.click()} className="text-sm text-blue-600 hover:underline mt-2">Fazer upload de nova textura</button>
                                <input ref={textureFileInputRef} type="file" accept="image/*" onChange={handleTextureUpload} className="hidden" />
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <h4 className="font-medium text-slate-800 mb-3">Contorno</h4>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Cor do Contorno</label>
                            <input type="color" value={textElement.stroke_color || '#000000'} onChange={(e) => handleChange({ stroke_color: e.target.value })} className="p-1 h-10 w-full block bg-white border border-slate-300 rounded-md cursor-pointer"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Largura</label>
                            <input type="number" min="0" value={textElement.stroke_width || 0} onChange={(e) => handleChange({ stroke_width: parseInt(e.target.value) })} className="w-full p-2 border border-slate-300 rounded-lg"/>
                        </div>
                    </div>
                </div>
            </div>
        </details>
        
        {/* Fundo e Posição */}
        <details className="bg-white rounded-xl border border-slate-200 group">
            <summary className="p-4 flex items-center justify-between cursor-pointer font-medium text-slate-800">
                <div className="flex items-center gap-3"><Blend size={18} className="text-purple-600"/> Fundo e Posição</div>
                <div className="transform transition-transform group-open:rotate-90"><ChevronRight size={16}/></div>
            </summary>
             <div className="p-4 border-t border-slate-100 space-y-6">
                <div>
                    <h4 className="font-medium text-slate-800 mb-3">Posicionamento</h4>

                    {/* Eixo X */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700">Horizontal (X)</label>
                            <button
                                onClick={() => handleAxisChange('x', isXNumeric ? 'center' : 0)}
                                className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                            >
                                {isXNumeric ? 'Usar preset' : 'Usar px'}
                            </button>
                        </div>
                        {isXNumeric ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={textElement.position.x as number}
                                    onChange={e => handleAxisChange('x', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-sm"
                                />
                                <span className="text-xs text-slate-500 whitespace-nowrap">px da esquerda</span>
                            </div>
                        ) : (
                            <div className="flex gap-1">
                                {X_PRESETS.map(v => (
                                    <button
                                        key={v}
                                        onClick={() => handleAxisChange('x', v)}
                                        className={`flex-1 py-1.5 text-sm rounded-md capitalize transition-colors ${
                                            textElement.position.x === v ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        {v === 'left' ? 'Esq' : v === 'center' ? 'Centro' : 'Dir'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Eixo Y */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-slate-700">Vertical (Y)</label>
                            <button
                                onClick={() => handleAxisChange('y', isYNumeric ? 'center' : 0)}
                                className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"
                            >
                                {isYNumeric ? 'Usar preset' : 'Usar px'}
                            </button>
                        </div>
                        {isYNumeric ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={textElement.position.y as number}
                                    onChange={e => handleAxisChange('y', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-sm"
                                />
                                <span className="text-xs text-slate-500 whitespace-nowrap">px do topo</span>
                            </div>
                        ) : (
                            <div className="flex gap-1">
                                {Y_PRESETS.map(v => (
                                    <button
                                        key={v}
                                        onClick={() => handleAxisChange('y', v)}
                                        className={`flex-1 py-1.5 text-xs rounded-md capitalize transition-colors ${
                                            textElement.position.y === v ? 'bg-blue-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }`}
                                    >
                                        {v === 'top' ? 'Topo' : v === 'center' ? 'Centro' : v === 'bottom' ? 'Base' : 'Auto'}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Ajuste vertical do bloco auto */}
                    {isFirstAutoElement && textElement.position.y === 'auto' && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Ajuste do bloco automático ({textElement.vertical_offset || 0}px)
                            </label>
                            <input
                                type="range"
                                min="-500" max="500"
                                value={textElement.vertical_offset || 0}
                                onChange={e => handleChange({ vertical_offset: parseInt(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    )}

                    {/* Resumo visual da posição atual */}
                    <p className="mt-3 text-xs text-slate-500 font-mono bg-slate-50 px-3 py-1.5 rounded">
                        position: x={String(textElement.position.x)}, y={String(textElement.position.y)}
                    </p>
                </div>
                <div>
                    <h4 className="font-medium text-slate-800 mb-3">Fundo do Texto</h4>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Cor do Fundo</label>
                                <input type="color" value={textElement.background_color || '#000000'} onChange={(e) => handleChange({ background_color: e.target.value })} className="p-1 h-10 w-full block bg-white border border-slate-300 rounded-md cursor-pointer"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Opacidade</label>
                                <input type="range" min="0" max="1" step="0.05" value={textElement.background_opacity} onChange={(e) => handleChange({background_opacity: parseFloat(e.target.value)})} className="w-full"/>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Padding ({textElement.background_padding}px)</label>
                                <input type="range" min="0" max="100" value={textElement.background_padding} onChange={(e) => handleChange({background_padding: parseInt(e.target.value)})} className="w-full"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Raio da Borda ({textElement.background_border_radius}px)</label>
                                <input type="range" min="0" max="100" value={textElement.background_border_radius} onChange={(e) => handleChange({background_border_radius: parseInt(e.target.value)})} className="w-full"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </details>

        {/* Efeitos Especiais */}
        <details className="bg-white rounded-xl border border-slate-200 group">
            <summary className="p-4 flex items-center justify-between cursor-pointer font-medium text-slate-800">
                <div className="flex items-center gap-3"><Sparkles size={18} className="text-amber-600"/> Efeitos Especiais e Animação</div>
                <div className="transform transition-transform group-open:rotate-90"><ChevronRight size={16}/></div>
            </summary>
            <div className="p-4 border-t border-slate-100 space-y-6">
                <div>
                    <h4 className="font-medium text-slate-800 mb-3">Animação</h4>
                    <select value={textElement.animation || ''} onChange={(e) => handleChange({ animation: e.target.value })} className="w-full p-2 border border-slate-300 rounded-lg">
                        <option value="">Nenhuma</option>
                        {animations.map(anim => <option key={anim.name} value={anim.name}>{anim.description}</option>)}
                    </select>
                </div>
                
                {/* Sombra */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-800">Sombra Projetada</h4>
                      <input type="checkbox" checked={!!textElement.shadow} onChange={(e) => toggleEffect('shadow', e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
                    </div>
                    {textElement.shadow && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Cor da Sombra</label>
                                <input type="color" value={textElement.shadow.color} onChange={(e) => handleShadowChange({ color: e.target.value })} className="p-1 h-10 w-full block bg-white border border-slate-300 rounded-md cursor-pointer"/>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Desloc. X ({textElement.shadow.offset_x}px)</label>
                                    <input type="range" min="-20" max="20" value={textElement.shadow.offset_x} onChange={(e) => handleShadowChange({offset_x: parseInt(e.target.value)})} className="w-full"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Desloc. Y ({textElement.shadow.offset_y}px)</label>
                                    <input type="range" min="-20" max="20" value={textElement.shadow.offset_y} onChange={(e) => handleShadowChange({offset_y: parseInt(e.target.value)})} className="w-full"/>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Opacidade ({Math.round(textElement.shadow.opacity * 100)}%)</label>
                                    <input type="range" min="0" max="1" step="0.05" value={textElement.shadow.opacity} onChange={(e) => handleShadowChange({opacity: parseFloat(e.target.value)})} className="w-full"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Desfoque ({textElement.shadow.blur_radius}px)</label>
                                    <input type="range" min="0" max="50" value={textElement.shadow.blur_radius} onChange={(e) => handleShadowChange({blur_radius: parseInt(e.target.value)})} className="w-full"/>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Brilho Externo */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-800">Brilho Externo (Glow)</h4>
                      <input type="checkbox" checked={!!textElement.outer_glow} onChange={(e) => toggleEffect('outer_glow', e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
                    </div>
                    {textElement.outer_glow && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Cor do Brilho</label>
                                    <input type="color" value={textElement.outer_glow.color} onChange={(e) => handleGlowChange({ color: e.target.value })} className="p-1 h-10 w-full block bg-white border border-slate-300 rounded-md cursor-pointer"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Opacidade ({Math.round(textElement.outer_glow.opacity * 100)}%)</label>
                                    <input type="range" min="0" max="1" step="0.05" value={textElement.outer_glow.opacity} onChange={(e) => handleGlowChange({opacity: parseFloat(e.target.value)})} className="w-full"/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Raio do Desfoque ({textElement.outer_glow.radius}px)</label>
                                <input type="range" min="0" max="50" value={textElement.outer_glow.radius} onChange={(e) => handleGlowChange({radius: parseInt(e.target.value)})} className="w-full"/>
                            </div>
                        </div>
                    )}
                </div>

                {/* Extrusão */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-800">Extrusão (Falso 3D)</h4>
                      <input type="checkbox" checked={!!textElement.extrude} onChange={(e) => toggleEffect('extrude', e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
                    </div>
                    {textElement.extrude && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Cor da Profundidade</label>
                                    <input type="color" value={textElement.extrude.color} onChange={(e) => handleExtrudeChange({ color: e.target.value })} className="p-1 h-10 w-full block bg-white border border-slate-300 rounded-md cursor-pointer"/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Profundidade ({textElement.extrude.depth}px)</label>
                                    <input type="range" min="1" max="20" value={textElement.extrude.depth} onChange={(e) => handleExtrudeChange({depth: parseInt(e.target.value)})} className="w-full"/>
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Ângulo da Direção ({textElement.extrude.direction_angle}°)</label>
                                <input type="range" min="0" max="360" value={textElement.extrude.direction_angle} onChange={(e) => handleExtrudeChange({direction_angle: parseInt(e.target.value)})} className="w-full"/>
                            </div>
                        </div>
                    )}
                </div>

                {/* Texto Curvado */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-800">Texto Curvado</h4>
                      <input type="checkbox" checked={!!textElement.curve} onChange={(e) => toggleEffect('curve', e.target.checked)} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"/>
                    </div>
                    {textElement.curve && (
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Direção da Curva</label>
                                <select value={textElement.curve.direction} onChange={(e) => handleCurveChange({ direction: e.target.value as 'up' | 'down' })} className="w-full p-2 border border-slate-300 rounded-lg">
                                    <option value="up">Curvar para Cima</option>
                                    <option value="down">Curvar para Baixo</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Raio da Curvatura ({textElement.curve.radius})</label>
                                <input type="range" min="100" max="1000" step="10" value={textElement.curve.radius} onChange={(e) => handleCurveChange({radius: parseInt(e.target.value)})} className="w-full"/>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </details>
    </div>
  );
};

export default TextElementEditor;
