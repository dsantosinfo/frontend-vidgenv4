// File: src/types/index.ts
// Substitua o conteúdo completo deste arquivo.

export enum FilePurpose {
  BACKGROUND_VIDEO = "background_video",
  BACKGROUND_IMAGE = "background_image",
  DECORATIVE_ELEMENT = "decorative_element",
  NARRATION = "narration",
  MUSIC = "music",
  AUDIO_EFFECT = "audio_effect",
  FONT = "font",
  TEXTURE_IMAGE = "texture_image",
}

export interface FileUploadRecord {
  id: string;
  original_filename: string;
  new_filename: string;
  file_path: string;
  purpose: FilePurpose;
  uploaded_at: string;
  file_type: 'image' | 'video' | 'audio';
}

export interface Position {
  x: string | number;
  y: string | number | 'auto';
}

export interface SubtitleConfig {
  enabled: boolean;
  font: string;
  font_size: number;
  color: string;
  stroke_color: string | null;
  stroke_width: number;
  position: [string, any];
}

export interface AudioTrack {
  path: string;
  volume: number;
}

export interface Shadow {
  color: string;
  offset_x: number;
  offset_y: number;
  opacity: number;
  blur_radius: number;
}

export interface TextFill {
  type: 'solid' | 'gradient' | 'texture';
  color: string;
  gradient_colors: string[];
  gradient_angle: number;
  image_path?: string | null;
}

export interface OuterGlow {
  color: string;
  radius: number;
  opacity: number;
}

export interface Extrude {
  depth: number;
  color: string;
  direction_angle: number;
}

export interface Curve {
  radius: number;
  direction: 'up' | 'down';
}

export interface TextElement {
  text: string;
  font_size: number;
  fill: TextFill;
  font: string | null;
  position: Position;
  animation: string | null;
  alignment: 'left' | 'center' | 'right';
  line_height: number;
  background_color: string | null;
  background_opacity: number;
  border_color: string | null;
  border_width: number;
  background_padding: number;
  background_border_radius: number;
  stroke_color: string | null;
  stroke_width: number;
  shadow: Shadow | null;
  margin_bottom: number;
  vertical_offset?: number;
  outer_glow?: OuterGlow | null;
  extrude?: Extrude | null;
  curve?: Curve | null;
}

export interface Background {
  type: 'color' | 'image' | 'video';
  color?: string;
  path?: string;
}

export interface DecorativeElement {
  id: string;
  path?: string | null;
  base64?: string | null;
  position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top_center';
  width_ratio?: number | null;
  size_ratio: number;
  offset_y: number;
  opacity: number;
}

export interface Scene {
  duration: number | null;
  background: Background;
  text_elements: TextElement[];
  narration: AudioTrack | null;
  effects_audio: AudioTrack[];
  subtitles: SubtitleConfig;
  transition?: string | null;
}

export interface Musica {
    enabled: boolean;
    path: string | null;
    volume: number;
}

export interface VideoConfig {
  template: string;
  fps: number;
  scenes: Scene[];
  musica: Musica;
  decorative_elements: DecorativeElement[];
}

// NOVO: Tipo de configuração para a geração de imagem estática
export interface ImageConfig {
  template: string;
  scene: Omit<Scene, 'duration' | 'narration' | 'effects_audio' | 'subtitles' | 'transition'>;
  decorative_elements: DecorativeElement[];
}

export interface VideoTemplate {
  name: string;
  width: number;
  height: number;
  fps: number;
  aspectRatio: string;
  description: string;
}

export interface Font {
  name: string;
  path: string;
  type: 'system' | 'custom';
}

export interface Animation {
  name: string;
  description: string;
}

export interface Transition {
  name: string;
  description: string;
}

export interface TaskInfo {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  start_time: string;
  end_time?: string | null;
  output_file?: string | null;
  download_url?: string | null;
  error?: string | null;
  request_config?: any;
}
