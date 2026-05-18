# Guia de Implementação — Editor de Templates

**Destinatário:** Equipe de Frontend  
**Contexto:** A tela de criação de vídeos já existe. Este documento descreve como integrá-la ao sistema de templates da API, aproveitando os endpoints de preview para feedback em tempo real.

---

## 1. Análise da Situação

### O que a API oferece

| Endpoint | Propósito no editor |
|---|---|
| `POST /previews/text` | Renderiza um único elemento de texto → retorna PNG base64 |
| `POST /previews/scene` | Renderiza uma cena completa → retorna PNG base64 |
| `POST /images/generate` | Renderiza cena completa → retorna PNG binário |
| `POST /videos/generate` | Gera o vídeo final com todas as cenas |
| `POST /user-templates/` | Salva o config atual como template reutilizável |
| `PUT /user-templates/{id}` | Atualiza um template existente |
| `POST /files/upload` | Faz upload de assets (imagens, vídeos, áudios, fontes) |

### Diferença entre os endpoints de preview

| | `/previews/text` | `/previews/scene` |
|---|---|---|
| **Entrada** | Um `TextElement` isolado | Uma `Scene` completa |
| **Saída** | PNG base64 do texto renderizado | PNG base64 da cena inteira na resolução do template |
| **Quando usar** | Ao editar fonte, cor, efeitos de um texto | Ao editar fundo, posição, múltiplos textos |
| **Velocidade** | Mais rápido (menos dados) | Mais lento (renderiza tudo) |

### Estratégia recomendada

```
Usuário edita texto  →  debounce 400ms  →  POST /previews/text   →  atualiza preview do texto
Usuário edita cena   →  debounce 600ms  →  POST /previews/scene  →  atualiza canvas principal
Usuário clica "Salvar Template"         →  POST /user-templates/ →  salva config atual
Usuário clica "Gerar Vídeo"             →  POST /videos/generate →  enfileira geração
```

---

## 2. Estrutura de Dados — Mapa Completo

O `config` salvo no template é exatamente o mesmo enviado para `/videos/generate`. Entender cada campo é essencial para construir o editor.

### `VideoConfig` — raiz do config

```typescript
interface VideoConfig {
  template: TemplateId       // define a resolução do canvas
  fps: number                // default: 24
  scenes: Scene[]            // array de cenas em sequência
  musica?: Musica            // trilha sonora global
  decorative_elements?: DecorativeElement[]  // elementos sobre todas as cenas
}

type TemplateId =
  | 'instagram_story'    // 1080 × 1920
  | 'instagram_feed'     // 1080 × 1350
  | 'facebook_feed'      // 1200 × 630
  | 'youtube_thumbnail'  // 1280 × 720
  | 'tiktok'             // 1080 × 1920
  | 'custom'             // 1920 × 1080
```

### `Scene` — uma cena do vídeo

```typescript
interface Scene {
  duration?: number                        // segundos; null = duração do áudio de narração
  background: Background                   // fundo da cena
  text_elements: TextElement[]             // textos sobrepostos
  narration?: AudioTrack                   // áudio de narração desta cena
  effects_audio?: AudioTrack[]             // efeitos sonoros desta cena
  subtitles?: SubtitleConfig               // legendas automáticas via Whisper
  transition_from_previous?: Transition    // transição de entrada (da cena anterior)
}
```

### `Background` — fundo da cena

```typescript
interface Background {
  type: 'color' | 'image' | 'video'
  color?: string    // hex — obrigatório se type = 'color'
  path?: string     // new_filename do upload — obrigatório se type = 'image' | 'video'
}
```

### `TextElement` — elemento de texto

```typescript
interface TextElement {
  text: string
  font_size: number                        // default: 50
  fill: TextFill                           // preenchimento do texto
  font?: string                            // new_filename de fonte .ttf (opcional)
  position: { x: string|number, y: string|number|'auto' }
  alignment: 'left' | 'center' | 'right'  // default: 'center'
  line_height: number                      // default: 1.2
  animation?: Animation                    // animação de entrada/saída

  // Fundo do bloco de texto
  background_color?: string               // hex
  background_opacity: number              // 0.0 a 1.0, default: 0.5
  background_padding: number             // px, default: 20
  background_border_radius: number       // px, default: 0
  border_color?: string                  // hex
  border_width: number                   // px, default: 0

  // Efeitos de texto
  stroke_color?: string                  // hex — contorno
  stroke_width: number                   // px, default: 0
  shadow?: Shadow                        // sombra
  outer_glow?: OuterGlow                 // brilho externo
  extrude?: Extrude                      // extrusão 3D
  curve?: Curve                          // texto curvado

  margin_bottom: number                  // px, default: 20
}
```

### `TextFill` — preenchimento do texto

```typescript
interface TextFill {
  type: 'solid' | 'gradient' | 'texture'
  color: string                          // hex — usado em 'solid'
  gradient_colors: string[]              // array de hex — usado em 'gradient'
  gradient_angle: number                 // graus — usado em 'gradient'
  image_path?: string                    // new_filename — obrigatório em 'texture'
}
```

### Efeitos de texto

```typescript
interface Shadow {
  color: string          // hex, default: '#000000'
  offset_x: number       // px, default: 3
  offset_y: number       // px, default: 3
  opacity: number        // 0.0 a 1.0, default: 0.6
  blur_radius: number    // px, default: 5
}

interface OuterGlow {
  color: string          // hex, default: '#FFFF00'
  radius: number         // px, default: 10
  opacity: number        // 0.0 a 1.0, default: 0.8
}

interface Extrude {
  depth: number          // px, default: 5
  color: string          // hex, default: '#333333'
  direction_angle: number // graus, default: 135.0
}

interface Curve {
  radius: number         // raio da curva em px
  direction: 'up' | 'down'
}
```

### `Animation` — animação de entrada/saída do texto

```typescript
interface Animation {
  type: AnimationType
  duration: number       // segundos, default: 1.0
  on_duration?: number   // para 'blink': tempo ligado, default: 0.5
  off_duration?: number  // para 'blink': tempo desligado, default: 0.5
}

type AnimationType =
  | 'fade_in' | 'fade_out'
  | 'slide_in_from_top' | 'slide_in_from_bottom'
  | 'slide_in_from_left' | 'slide_in_from_right'
  | 'slide_out_to_top' | 'slide_out_to_bottom'
  | 'slide_out_to_left' | 'slide_out_to_right'
  | 'zoom_in' | 'zoom_out'
  | 'rotate'
  | 'blink'
```

### `Transition` — transição entre cenas

```typescript
interface Transition {
  type: TransitionType
  duration: number       // segundos, default: 1.0
}

type TransitionType =
  | 'fade'
  | 'slide_in_out'
  | 'wipe_right' | 'wipe_left' | 'wipe_up' | 'wipe_down'
  | 'circle_open' | 'circle_close'
```

### `DecorativeElement` — elemento decorativo global

```typescript
interface DecorativeElement {
  path?: string          // new_filename do upload
  base64?: string        // imagem em base64 (alternativa ao path)
  position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'top_center'
  size_ratio: number     // proporção em relação à largura do canvas, default: 0.15
  width_ratio?: number   // largura fixa como proporção do canvas
  offset_y: number       // deslocamento vertical em px, default: 0
  opacity: number        // 0.0 a 1.0, default: 1.0
}
```

### `Musica` — trilha sonora global

```typescript
interface Musica {
  enabled: boolean       // default: false
  path?: string          // new_filename do upload
  volume: number         // 0.0 a 1.0, default: 0.8
}
```

### `AudioTrack` — áudio por cena

```typescript
interface AudioTrack {
  path: string           // new_filename do upload
  volume: number         // 0.0 a 1.0, default: 1.0
}
```

---

## 3. Fluxo de Implementação Recomendado

### 3.1 Estado do editor

O editor deve manter um objeto de estado que espelha exatamente o `VideoConfig`:

```typescript
// Estado central do editor
const [config, setConfig] = useState<VideoConfig>({
  template: 'instagram_story',
  fps: 24,
  scenes: [
    {
      duration: 5,
      background: { type: 'color', color: '#000000' },
      text_elements: [],
      effects_audio: [],
      subtitles: { enabled: false, font: 'Arial', font_size: 48,
                   color: '#FFFFFF', stroke_color: '#000000',
                   stroke_width: 2, position: ['center', 'bottom'] }
    }
  ],
  musica: { enabled: false, volume: 0.8 },
  decorative_elements: []
});

// Índice da cena sendo editada
const [activeScenesIndex, setActiveSceneIndex] = useState(0);

// Índice do texto sendo editado
const [activeTextIndex, setActiveTextIndex] = useState<number | null>(null);
```

### 3.2 Preview de texto (feedback rápido)

Chamar ao editar qualquer propriedade de um `TextElement`. Usar debounce de **400ms**.

```typescript
// Endpoint: POST /previews/text
// Retorna: { preview_image: "data:image/png;base64,..." }

async function previewText(textElement: TextElement): Promise<string> {
  const body = {
    text: textElement.text,
    font_size: textElement.font_size,
    fill: textElement.fill,
    font: textElement.font,
    background_color: textElement.background_color,
    background_opacity: textElement.background_opacity,
    alignment: textElement.alignment,
    max_width: getTemplateWidth(config.template),  // largura do template atual
    border_color: textElement.border_color,
    border_width: textElement.border_width,
    stroke_color: textElement.stroke_color,
    stroke_width: textElement.stroke_width,
    line_height: textElement.line_height,
    background_padding: textElement.background_padding,
    background_border_radius: textElement.background_border_radius,
    shadow: textElement.shadow,
    animation: textElement.animation,
    outer_glow: textElement.outer_glow,
    extrude: textElement.extrude,
    curve: textElement.curve
  };

  const res = await fetch('/api/v1/previews/text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const { preview_image } = await res.json();
  return preview_image; // data URI pronto para usar em <img src={...} />
}

function getTemplateWidth(template: string): number {
  const widths: Record<string, number> = {
    instagram_story: 1080, instagram_feed: 1080,
    facebook_feed: 1200,   youtube_thumbnail: 1280,
    tiktok: 1080,          custom: 1920
  };
  return widths[template] ?? 1080;
}
```

### 3.3 Preview de cena (canvas principal)

Chamar ao editar qualquer propriedade da cena (fundo, posição de textos, elementos decorativos). Usar debounce de **600ms**.

```typescript
// Endpoint: POST /previews/scene
// Retorna: { preview_image: "data:image/png;base64,..." }

async function previewScene(sceneIndex: number): Promise<string> {
  const scene = config.scenes[sceneIndex];

  const body = {
    template: config.template,
    fps: config.fps,
    scene: scene,
    decorative_elements: config.decorative_elements
  };

  const res = await fetch('/api/v1/previews/scene', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const { preview_image } = await res.json();
  return preview_image;
}
```

> **Atenção:** O preview de cena renderiza na resolução real do template (ex: 1080×1920). Exibir em escala no CSS com `object-fit: contain` ou calcular a proporção para o canvas do editor.

### 3.4 Upload de assets

Antes de usar qualquer imagem/vídeo/áudio no config, fazer upload e guardar o `new_filename`.

```typescript
// Endpoint: POST /files/upload
// Retorna: FileUploadRecord com new_filename

async function uploadAsset(
  file: File,
  purpose: FilePurpose,
  token: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', purpose);

  const res = await fetch('/api/v1/files/upload', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });

  if (!res.ok) throw new Error('Falha no upload');
  const { new_filename } = await res.json();
  return new_filename; // usar este valor nos campos 'path' do config
}

// Exemplo de uso ao selecionar imagem de fundo:
async function onBackgroundImageSelected(file: File) {
  const filename = await uploadAsset(file, 'background_image', token);
  updateScene(activeSceneIndex, {
    background: { type: 'image', path: filename }
  });
}
```

### 3.5 Salvar como template

Ao clicar em "Salvar Template", enviar o estado atual do editor.

```typescript
// Endpoint: POST /user-templates/  (criar)
// Endpoint: PUT  /user-templates/{id}  (atualizar existente)

async function saveTemplate(name: string, templateId?: string): Promise<string> {
  const url = templateId
    ? `/api/v1/user-templates/${templateId}`
    : '/api/v1/user-templates/';

  const method = templateId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, config })
  });

  if (!res.ok) throw new Error('Falha ao salvar template');
  const saved = await res.json();
  return saved.id; // guardar para futuras atualizações
}
```

### 3.6 Gerar vídeo a partir do editor

```typescript
// Opção A: gerar direto com o config atual (sem template salvo)
async function generateVideo(): Promise<string> {
  const res = await fetch('/api/v1/videos/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ config })
  });
  const task = await res.json();
  return task.id; // task_id para polling
}

// Opção B: gerar a partir de um template salvo (com override opcional)
async function generateFromTemplate(
  templateId: string,
  overrides?: Partial<VideoConfig>
): Promise<string> {
  const res = await fetch('/api/v1/generate-simplified/video', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      template_id: templateId,
      content_type: 'video',
      overrides
    })
  });
  const task = await res.json();
  return task.id;
}
```

---

## 4. Fluxo Completo — Salvar Template a Partir da Tela de Criação

```
┌─────────────────────────────────────────────────────────────────┐
│  TELA DE CRIAÇÃO DE VÍDEO (já existente)                        │
│                                                                 │
│  1. Usuário configura cenas, textos, fundo, efeitos             │
│     └─ a cada mudança: debounce → POST /previews/scene          │
│        └─ exibe preview no canvas                               │
│                                                                 │
│  2. Usuário faz upload de assets (se necessário)                │
│     └─ POST /files/upload → guarda new_filename no estado       │
│                                                                 │
│  3. Usuário clica "Salvar como Template"                        │
│     └─ abre modal: pede nome do template                        │
│     └─ POST /user-templates/ com { name, config: estadoAtual }  │
│     └─ guarda template_id retornado                             │
│                                                                 │
│  4. Usuário clica "Gerar Vídeo"                                 │
│     ├─ Se tem template_id salvo:                                │
│     │   └─ POST /generate-simplified/video                      │
│     └─ Se não tem template salvo:                               │
│         └─ POST /videos/generate com config completo            │
│                                                                 │
│  5. Polling: GET /tasks/{task_id} a cada 3s                     │
│     └─ quando completed: exibe botão de download                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Decisões de Design para o Editor

### Posicionamento de textos

O campo `position` aceita:
- Strings: `'center'`, `'top'`, `'bottom'`, `'left'`, `'right'`
- Números: coordenadas absolutas em pixels (ex: `{ x: 540, y: 960 }`)
- `'auto'` para `y`: empilha os textos automaticamente de cima para baixo

**Recomendação:** implementar um seletor visual de posição (grid 3×3) que mapeia para as strings, com opção avançada de coordenadas numéricas.

### Preview vs. resolução real

O preview retornado pela API está na resolução real do template (ex: 1080×1920 para stories). Para exibir no editor:

```css
.preview-canvas {
  width: 100%;
  max-width: 360px;   /* largura de exibição desejada */
  aspect-ratio: 9/16; /* para instagram_story e tiktok */
  object-fit: contain;
}
```

Calcular a proporção de escala para converter cliques do usuário em coordenadas reais:

```typescript
function screenToCanvasCoords(
  clickX: number, clickY: number,
  displayWidth: number, displayHeight: number,
  template: string
): { x: number, y: number } {
  const dims = { instagram_story: [1080, 1920], instagram_feed: [1080, 1350],
                 facebook_feed: [1200, 630], youtube_thumbnail: [1280, 720],
                 tiktok: [1080, 1920], custom: [1920, 1080] };
  const [cw, ch] = dims[template] ?? [1080, 1920];
  return {
    x: Math.round((clickX / displayWidth) * cw),
    y: Math.round((clickY / displayHeight) * ch)
  };
}
```

### Múltiplas cenas

Cada cena é independente. O editor deve ter:
- Lista de cenas com thumbnail (gerado via `/previews/scene`)
- Botões de adicionar, remover e reordenar cenas
- Seletor de transição entre cenas (campo `transition_from_previous` da cena seguinte)

### Elementos decorativos

São globais — aparecem em **todas** as cenas. Ideal para logos e marcas d'água. Ficam no array `decorative_elements` do `VideoConfig`, não dentro de cada `Scene`.

---

## 6. Exemplo de Config Completo

Config real pronto para enviar à API, com todos os recursos principais:

```json
{
  "template": "instagram_story",
  "fps": 24,
  "scenes": [
    {
      "duration": 5.0,
      "background": {
        "type": "color",
        "color": "#1A1A2E"
      },
      "text_elements": [
        {
          "text": "TÍTULO PRINCIPAL",
          "font_size": 80,
          "fill": {
            "type": "gradient",
            "gradient_colors": ["#E94560", "#0F3460"],
            "gradient_angle": 90
          },
          "position": { "x": "center", "y": 600 },
          "alignment": "center",
          "stroke_color": "#FFFFFF",
          "stroke_width": 2,
          "shadow": {
            "color": "#000000",
            "offset_x": 4,
            "offset_y": 4,
            "opacity": 0.7,
            "blur_radius": 8
          },
          "animation": {
            "type": "fade_in",
            "duration": 0.8
          },
          "margin_bottom": 20
        },
        {
          "text": "Subtítulo descritivo aqui",
          "font_size": 40,
          "fill": { "type": "solid", "color": "#CCCCCC" },
          "position": { "x": "center", "y": "auto" },
          "alignment": "center",
          "animation": {
            "type": "slide_in_from_bottom",
            "duration": 0.6
          },
          "margin_bottom": 0
        }
      ],
      "effects_audio": [],
      "subtitles": { "enabled": false, "font": "Arial", "font_size": 48,
                     "color": "#FFFFFF", "stroke_color": "#000000",
                     "stroke_width": 2, "position": ["center", "bottom"] }
    },
    {
      "duration": 4.0,
      "background": {
        "type": "image",
        "path": "abc123_fundo.jpg"
      },
      "text_elements": [
        {
          "text": "Segunda cena",
          "font_size": 60,
          "fill": { "type": "solid", "color": "#FFFFFF" },
          "position": { "x": "center", "y": "center" },
          "alignment": "center",
          "background_color": "#000000",
          "background_opacity": 0.5,
          "background_padding": 24,
          "background_border_radius": 12,
          "margin_bottom": 0
        }
      ],
      "transition_from_previous": {
        "type": "fade",
        "duration": 0.8
      },
      "effects_audio": [],
      "subtitles": { "enabled": false, "font": "Arial", "font_size": 48,
                     "color": "#FFFFFF", "stroke_color": "#000000",
                     "stroke_width": 2, "position": ["center", "bottom"] }
    }
  ],
  "musica": {
    "enabled": true,
    "path": "xyz789_trilha.mp3",
    "volume": 0.6
  },
  "decorative_elements": [
    {
      "path": "logo123_marca.png",
      "position": "top_right",
      "size_ratio": 0.12,
      "offset_y": 40,
      "opacity": 0.9
    }
  ]
}
```

---

## 7. Checklist de Implementação

- [ ] Estado central do editor espelhando `VideoConfig`
- [ ] Seletor de template (resolução) com atualização do canvas
- [ ] Upload de assets com feedback visual e armazenamento do `new_filename`
- [ ] Editor de fundo por cena (cor, imagem, vídeo)
- [ ] Editor de `TextElement` com todos os campos
- [ ] Preview de texto via `POST /previews/text` com debounce 400ms
- [ ] Preview de cena via `POST /previews/scene` com debounce 600ms
- [ ] Seletor visual de posição (grid + coordenadas numéricas)
- [ ] Painel de efeitos de texto (shadow, glow, extrude, curve)
- [ ] Seletor de animação de entrada/saída por texto
- [ ] Gerenciador de cenas (adicionar, remover, reordenar)
- [ ] Seletor de transição entre cenas
- [ ] Editor de elementos decorativos globais
- [ ] Editor de trilha sonora global
- [ ] Modal "Salvar como Template" com campo de nome
- [ ] Botão "Atualizar Template" (quando template já foi salvo)
- [ ] Botão "Gerar Vídeo" com polling de status
- [ ] Exibição de progresso e botão de download ao completar
