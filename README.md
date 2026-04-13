# VidGen Frontend

Interface web para criação e geração de vídeos e imagens personalizados, construída com React, TypeScript e Tailwind CSS.

## 🚀 Visão Geral

O VidGen Frontend é uma aplicação React SPA (Single Page Application) que serve como interface para um sistema de geração de vídeos e imagens. A aplicação comunica-se com um backend FastAPI que processa os vídeos usando MoviePy.

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    VidGen Frontend                          │
│  React 18 + TypeScript + Vite 5 + Tailwind CSS 3           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Video Editor │  │ Image Editor │  │  File Management │  │
│  │              │  │              │  │                  │  │
│  │ • Templates  │  │ • Templates  │  │ • Upload         │  │
│  │ • Multi-cena │  │ • Texto      │  │ • Organização    │  │
│  │ • Texto/RGB  │  │ • Fundo      │  │ • Preview        │  │
│  │ • Áudio      │  │ • Decorativos│  │ • Delete         │  │
│  │ • Legendas   │  │ • Geração    │  │                  │  │
│  │ • Transições │  │              │  │                  │  │
│  │ • Decorativos│  │              │  │                  │  │
│  │ • Preview    │  │              │  │                  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
│         │                 │                    │            │
│         └─────────────────┴────────────────────┘            │
│                           │                                 │
│                    ┌──────▼──────┐                           │
│                    │  api.ts     │                           │
│                    │  Fetch API  │                           │
│                    └──────┬──────┘                           │
└───────────────────────────┼─────────────────────────────────┘
                            │ HTTP/JSON
                            ▼
              ┌─────────────────────────┐
              │   FastAPI Backend       │
              │   (Python + MoviePy)    │
              └─────────────────────────┘
```

## ✨ Funcionalidades Detalhadas

### 🎬 Editor de Vídeo

- **Seleção de Template**: 6 templates pré-configurados
  - Instagram Story (1080×1920, 9:16)
  - Instagram Feed (1080×1350, 4:5)
  - Facebook Feed (1200×630, 16:9)
  - YouTube Thumbnail (1280×720, 16:9)
  - TikTok (1080×1920, 9:16)
  - Custom (1920×1080, 16:9)

- **Gerenciamento de Cenas**:
  - Adicionar, remover e duplicar cenas
  - Preview em tempo real de cada cena (debounce 1200ms)
  - Duração configurável por cena
  - Transições entre cenas (fade e outras)
  - Auto-duração quando há narração de áudio

- **Elementos de Texto**:
  - Múltiplos elementos de texto por cena
  - Preenchimento: cor sólida, gradiente (multi-cor com ângulo), textura (upload de imagem)
  - Fonte: fontes do sistema ou upload de fontes customizadas (.ttf/.otf)
  - Tamanho (10-200px), alinhamento (esquerda/centro/direita), altura de linha
  - Posicionamento: grade 3×3 (left/center/right × top/center/bottom) + posição automática
  - Fundo do texto: cor, opacidade, padding, border-radius
  - Contorno: cor e largura
  - Efeitos especiais:
    - **Sombra projetada**: cor, offset X/Y, opacidade, desfoque
    - **Outer Glow**: cor, raio, opacidade
    - **Extrude (3D)**: profundidade, cor, ângulo de direção
    - **Curved Text**: raio, direção (cima/baixo)
  - Animações de entrada/saída
  - Preview individual de texto com debounce de 700ms

- **Áudio**:
  - **Narração**: upload de arquivo de áudio por cena
  - **Efeitos sonoros**: múltiplos efeitos por cena com volume individual
  - **Música global**: trilha sonora para todo o vídeo com controle de volume
  - Preview de áudio com controles de play/pause, seek, volume e mute

- **Legendas**:
  - Configuráveis por cena (ativar/desativar)
  - Fonte, tamanho, cor, contorno e posição
  - Requer narração de áudio ativa

- **Fundos**:
  - Cor sólida (color picker + input hex)
  - Imagem (upload ou seleção da biblioteca)
  - Vídeo (upload ou seleção da biblioteca)

- **Elementos Decorativos**:
  - Upload de imagens para sobreposição
  - Posições: top_left, top_right, bottom_left, bottom_right, top_center
  - Tamanho proporcional (1%-100%)
  - Opacidade (0%-100%)
  - Deslocamento vertical (offset_y)

- **Gerenciamento de Configuração**:
  - Exportar configuração como JSON
  - Copiar configuração para clipboard
  - Importar configuração de arquivo JSON
  - Colar e aplicar JSON diretamente
  - Visualização do payload da API para debug

- **Geração de Vídeo**:
  - Validação mínima (pelo menos 1 cena)
  - Envio da configuração completa para o backend
  - Polling de status a cada 3 segundos
  - Timer de progresso em tempo real
  - Status visual: queued → processing → completed/failed
  - Download direto ao concluir

### 🖼️ Editor de Imagem

- Mesmos recursos de texto e fundo do editor de vídeo
- Geração síncrona (retorna blob diretamente, não task assíncrona)
- Preview da imagem final antes do download
- Configuração simplificada (sem áudio, legendas ou transições)

### 📁 Gerenciamento de Arquivos

- **Upload**:
  - Drag-and-drop ou seleção de arquivo
  - Finalidade configurável (8 tipos):
    - `background_video`, `background_image`, `decorative_element`
    - `narration`, `music`, `audio_effect`, `font`, `texture_image`
  - Feedback visual durante upload

- **Organização**:
  - Abas por tipo: Imagens, Vídeos, Áudios
  - Contadores por categoria
  - Grid de arquivos com preview

- **Preview**:
  - Imagens: thumbnail direta
  - Vídeos: player com controles completos
  - Áudios: player com controles completos

- **Ações**:
  - Visualizar detalhes do arquivo
  - Deletar arquivo e registros associados

### 📺 Vídeos Gerados

- **Lista de Tarefas**:
  - Cards com estatísticas: em processamento, concluídos, com erro
  - Auto-refresh a cada 5 segundos quando há tarefas em andamento
  - Atualização manual

- **Vídeos Concluídos**:
  - Grid com preview em hover (auto-play silencioso)
  - Painel lateral de visualização com player completo
  - Download direto
  - Deletar tarefa e vídeo associado

- **Tarefas com Erro**:
  - Lista expansível com detalhes do erro
  - Opção de deletar

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | [React 18](https://react.dev/) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Build | [Vite 5](https://vitejs.dev/) |
| Estilos | [Tailwind CSS 3](https://tailwindcss.com/) |
| Ícones | [Lucide React](https://lucide.dev/) |
| Linting | [ESLint 9](https://eslint.org/) |
| HTTP | Fetch API (nativa do browser) |

## 📋 Pré-requisitos

- Node.js 18+ (LTS recomendado)
- npm 9+ ou outro gerenciador de pacotes
- Backend FastAPI em execução (projeto VidGen Backend)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env
```

Edite o arquivo `.env` conforme necessário:

```env
# URL base do backend
VITE_API_BASE_URL=http://localhost:8000

# Timeout para requisições da API (ms)
VITE_API_TIMEOUT=900000
```

## 🏃‍♂️ Desenvolvimento

### Servidor de Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

O Vite configura automaticamente um proxy para `/api` → `http://127.0.0.1:8000`, evitando problemas de CORS durante o desenvolvimento.

### Build de Produção

```bash
npm run build
```

Os arquivos otimizados serão gerados em `dist/`.

### Preview de Produção

```bash
npm run preview
```

Visualize o build localmente (serve os arquivos de `dist/`).

### Linting

```bash
npm run lint
```

Verifica o código com ESLint.

## 📁 Estrutura do Projeto

```
FrontEnd/
├── src/
│   ├── components/
│   │   ├── ImageEditor/           # Editor de imagem estática
│   │   │   ├── index.tsx          # Componente principal do editor
│   │   │   ├── ImageEditorTabs.tsx # Abas de navegação
│   │   │   ├── ImagePreview.tsx   # Preview com debounce
│   │   │   ├── GenerateImageButton.tsx # Geração síncrona
│   │   │   └── ImageConfigManager.tsx  # Export/import de config
│   │   ├── VideoEditor/           # Editor de vídeo multi-cena
│   │   │   ├── index.tsx          # Componente principal
│   │   │   ├── EditorTabs.tsx     # Abas de navegação
│   │   │   ├── TemplateSelector.tsx # Seleção de template
│   │   │   ├── SceneEditor.tsx    # Gerenciamento de cenas
│   │   │   ├── ScenePreview.tsx   # Preview com debounce
│   │   │   ├── TextElementEditor.tsx # Texto + efeitos especiais
│   │   │   ├── BackgroundEditor.tsx # Cor/imagem/vídeo de fundo
│   │   │   ├── AudioEditor.tsx    # Música global
│   │   │   ├── SceneAudioEditor.tsx # Narração e efeitos por cena
│   │   │   ├── DecorativeElementsEditor.tsx # Elementos sobrepostos
│   │   │   ├── GenerateButton.tsx # Geração + polling
│   │   │   ├── ConfigManager.tsx  # Export/import de config
│   │   │   ├── VideoPreview.tsx   # Player de vídeo custom
│   │   │   └── AudioPreview.tsx   # Player de áudio custom
│   │   ├── FileManagement.tsx     # Upload e gestão de arquivos
│   │   ├── GeneratedVideos.tsx    # Lista de vídeos gerados
│   │   ├── Header.tsx             # Cabeçalho da aplicação
│   │   ├── MainContent.tsx        # Router de views
│   │   └── Sidebar.tsx            # Navegação lateral
│   ├── config/
│   │   └── api.ts                 # Fetch wrapper + helpers
│   ├── types/
│   │   └── index.ts               # Interfaces e tipos TypeScript
│   ├── App.tsx                    # Componente raiz + state
│   ├── main.tsx                   # Entry point React
│   ├── index.css                  # Estilos globais
│   └── vite-env.d.ts              # Tipos de ambiente Vite
├── Docs/
│   └── openapi (1)_docs.md        # Documentação OpenAPI do backend
├── .env.example                   # Template de variáveis de ambiente
├── .gitignore                     # Arquivos ignorados pelo Git
├── cors_fix.py                    # Helper para configuração CORS
├── package.json                   # Dependências e scripts
├── vite.config.ts                 # Configuração do Vite + proxy
├── tailwind.config.js             # Configuração do Tailwind
├── postcss.config.js              # Configuração do PostCSS
├── eslint.config.js               # Configuração do ESLint
├── tsconfig.json                  # Configuração do TypeScript
├── tsconfig.app.json              # TypeScript (app)
└── tsconfig.node.json             # TypeScript (node)
```

## 🔌 Endpoints da API

### Arquivos
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/files/upload` | POST | Upload de arquivo com finalidade |
| `/api/v1/files/list_uploads` | GET | Listar todos os uploads |
| `/api/v1/files/delete_upload/{filename}` | DELETE | Deletar arquivo |

### Imagens
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/images/generate` | POST | Gerar imagem estática (retorna blob) |
| `/api/v1/images/convert-by-upload` | POST | Converter imagem por upload |
| `/api/v1/images/convert-by-url` | POST | Converter imagem por URL |
| `/api/v1/images/convert-by-base64` | POST | Converter imagem por Base64 |

### Vídeos
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/videos/generate` | POST | Iniciar geração de vídeo (retorna task ID) |

### Previews
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/previews/text` | POST | Preview de elemento de texto |
| `/api/v1/previews/scene` | POST | Preview de cena (frame estático) |

### Tarefas
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/tasks/` | GET | Listar todas as tarefas |
| `/api/v1/tasks/{task_id}` | GET | Status de uma tarefa |
| `/api/v1/tasks/{task_id}` | DELETE | Deletar tarefa e arquivo |

### Utilitários
| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v1/utils/list_fonts` | GET | Fontes disponíveis |
| `/api/v1/utils/list_animations` | GET | Animações disponíveis |
| `/api/v1/utils/list_transitions` | GET | Transições disponíveis |
| `/api/v1/utils/upload_font` | POST | Upload de fonte personalizada |

## 🌐 Proxy de Desenvolvimento

O Vite está configurado (`vite.config.ts`) para fazer proxy de requisições `/api` para o backend:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://127.0.0.1:8000',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

**Nota**: Em produção, o frontend e backend devem estar no mesmo domínio ou o backend deve ter CORS configurado corretamente.

### Configurando CORS no Backend

Se estiver com problemas de CORS, adicione no backend:

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
```

Ou execute o helper:

```bash
python cors_fix.py
```

## 📝 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento (Vite) |
| `npm run build` | Gera build otimada para produção |
| `npm run preview` | Visualiza build de produção localmente |
| `npm run lint` | Executa ESLint |
| `npm run start` | Inicia servidor estático (`serve`) |

## 🎨 Temas e Estilos

### Animações Customizadas (Tailwind)

```js
// tailwind.config.js
animation: {
  'fadeIn': 'fadeIn 0.5s ease-in-out',
  'slideUp': 'slideUp 0.3s ease-out',
}
```

### Tipografia

- Fonte principal: **Inter** (Google Fonts)
- Fallback: system-ui, sans-serif

### Paleta de Cores

A aplicação utiliza a paleta padrão do Tailwind com ênfase em:
- **Blue/Purple** → Ações principais (botões, links)
- **Green** → Sucesso e áudio
- **Red** → Erros e ações destrutivas
- **Slate** → Textos e fundos neutros

## 🔍 Tipos TypeScript Principais

### VideoConfig
Configuração completa de um vídeo com template, FPS, cenas, música global e elementos decorativos.

### Scene
Uma cena individual com duração, fundo, elementos de texto, narração, efeitos sonoros, legendas e transição.

### TextElement
Elemento de texto com conteúdo, fonte, tamanho, preenchimento (sólido/gradiente/textura), posição, animação, alinhamento, fundo, contorno, sombra, glow, extrude e curva.

### ImageConfig
Configuração simplificada para geração de imagem estática (sem áudio, legendas ou transições).

### TaskInfo
Informações de uma tarefa de geração: ID, status (queued/processing/completed/failed), timestamps, URL de download e erro.

### FileUploadRecord
Registro de arquivo enviado: ID, nomes (original/novo), caminho, finalidade, data e tipo.

## ⚙️ Fluxo de Geração de Vídeo

```
1. Usuário configura vídeo no Editor
   ↓
2. Clica em "Gerar Vídeo"
   ↓
3. Frontend converte config → formato API (convertToApiPayload)
   ↓
4. POST /api/v1/videos/generate
   ↓
5. Backend retorna task ID
   ↓
6. Frontend faz polling GET /api/v1/tasks/{task_id} a cada 3s
   ↓
7. Status: queued → processing → completed OU failed
   ↓
8. Vídeo aparece em "Vídeos Gerados" com download URL
```

## ⚙️ Fluxo de Geração de Imagem

```
1. Usuário configura imagem no Editor
   ↓
2. Clica em "Gerar Imagem"
   ↓
3. POST /api/v1/images/generate
   ↓
4. Backend retorna blob da imagem diretamente (síncrono)
   ↓
5. Frontend cria object URL e exibe preview
   ↓
6. Usuário pode baixar a imagem
```

## 🐛 Bugs e Melhorias Conhecidas

Consulte o arquivo [TODO.md](./TODO.md) para lista completa de bugs, duplicações e melhorias identificadas.

### Bugs Críticos
- `video.play()` sem `.catch()` em GeneratedVideos.tsx
- Closure stale no `handleDelete` em FileManagement.tsx
- URLs de upload inconsistentes (relativo vs absoluto)

### Melhorias Planejadas
- Centralizar definições de templates
- Criar hooks customizados para fetch de arquivos
- Unificar tratamento de erros com sistema de toast
- Extrair valores mágicos para constantes

## 🤝 Contribuindo

1. Crie um branch para sua feature:
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. Commit suas alterações:
   ```bash
   git commit -m 'Descrição clara do que foi feito'
   ```

3. Push para o branch:
   ```bash
   git push origin feature/nome-da-feature
   ```

4. Abra um Pull Request

### Convenções de Código

- TypeScript estrito em todos os arquivos
- Componentes funcionais com hooks
- Interfaces nomeadas com sufixo `Props` para props de componentes
- Funções de handler prefixadas com `handle`
- Estados com `useState` tipados
- Efeitos colaterais em `useEffect` com cleanup
- Valores mágicos devem ser extraídos para constantes (em revisão)

## 📄 Licença

Este projeto é de uso privado.

---

Desenvolvido com ⚡ React + Vite + TypeScript + Tailwind CSS
