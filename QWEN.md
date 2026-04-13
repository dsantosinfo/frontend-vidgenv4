# VidGen Frontend

## Project Overview

VidGen Frontend is a React-based web application for generating videos and images through a visual editor interface. It serves as the frontend for a video generation system, communicating with a FastAPI backend API.

**Key Features:**
- **Video Editor**: Create multi-scene videos with text elements, backgrounds, audio, transitions, and decorative elements
- **Image Editor**: Generate static images with customizable text, backgrounds, and decorative elements
- **File Management**: Upload and manage media files (videos, images, audio, fonts)
- **Task Management**: Monitor video/image generation tasks
- **Preview System**: Generate real-time previews of text elements and scenes

**Tech Stack:**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3 with custom animations
- **Icons**: Lucide React
- **Linting**: ESLint 9
- **API Communication**: Fetch API with custom configuration

## Project Structure

```
FrontEnd/
├── src/
│   ├── components/
│   │   ├── ImageEditor/        # Image editor components
│   │   │   ├── GenerateImageButton.tsx
│   │   │   ├── ImageConfigManager.tsx
│   │   │   ├── ImageEditorTabs.tsx
│   │   │   ├── ImagePreview.tsx
│   │   │   └── index.tsx
│   │   ├── VideoEditor/        # Video editor components
│   │   │   ├── AudioEditor.tsx
│   │   │   ├── AudioPreview.tsx
│   │   │   ├── BackgroundEditor.tsx
│   │   │   ├── ConfigManager.tsx
│   │   │   ├── DecorativeElementsEditor.tsx
│   │   │   ├── EditorTabs.tsx
│   │   │   ├── GenerateButton.tsx
│   │   │   ├── index.tsx
│   │   │   ├── SceneAudioEditor.tsx
│   │   │   ├── SceneEditor.tsx
│   │   │   ├── ScenePreview.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── TextElementEditor.tsx
│   │   │   └── VideoPreview.tsx
│   │   ├── FileManagement.tsx  # File upload/management
│   │   ├── GeneratedVideos.tsx # Generated videos list
│   │   ├── Header.tsx
│   │   ├── MainContent.tsx
│   │   └── Sidebar.tsx
│   ├── config/
│   │   └── api.ts              # API configuration and utilities
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Main application component
│   ├── index.css               # Global styles
│   ├── main.tsx                # Application entry point
│   └── vite-env.d.ts           # Vite environment types
├── Docs/
│   └── openapi (1)_docs.md     # OpenAPI documentation for backend
├── .env.example                # Environment variables template
├── cors_fix.py                 # Helper script for CORS configuration
├── package.json
├── vite.config.ts              # Vite configuration with proxy
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── eslint.config.js            # ESLint configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.app.json           # TypeScript app configuration
└── tsconfig.node.json          # TypeScript node configuration
```

## Building and Running

### Prerequisites
- Node.js (latest LTS version recommended)
- npm or another package manager

### Installation

```bash
npm install
```

### Development

Start the development server (runs on `http://localhost:5173`):

```bash
npm run dev
```

### Build

Create a production build:

```bash
npm run build
```

The output will be in the `dist/` directory.

### Preview

Preview the production build locally:

```bash
npm run preview
```

### Lint

Run ESLint to check for code issues:

```bash
npm run lint
```

## Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL for the FastAPI backend | `http://localhost:8000` |
| `VITE_API_TIMEOUT` | Timeout for API requests (milliseconds) | `900000` (15 minutes) |

## API Integration

The frontend communicates with a FastAPI backend. Key endpoints include:

### Files
- `POST /api/v1/files/upload` - Upload files with specific purposes
- `GET /api/v1/files/list_uploads` - List uploaded files
- `DELETE /api/v1/files/delete_upload/{filename}` - Delete uploaded file

### Images
- `POST /api/v1/images/generate` - Generate static images
- `POST /api/v1/images/convert-by-upload` - Convert uploaded images
- `POST /api/v1/images/convert-by-url` - Convert images from URL
- `POST /api/v1/images/convert-by-base64` - Convert base64 images

### Videos
- `POST /api/v1/videos/generate` - Generate videos

### Previews
- `POST /api/v1/previews/text` - Get text element preview
- `POST /api/v1/previews/scene` - Get scene preview

### Tasks
- `GET /api/v1/tasks/` - List all generation tasks
- `GET /api/v1/tasks/{task_id}` - Get specific task status
- `DELETE /api/v1/tasks/{task_id}` - Delete a task

### Utilities
- `GET /api/v1/utils/list_fonts` - List available fonts
- `GET /api/v1/utils/list_animations` - List available animations
- `GET /api/v1/utils/list_transitions` - List available transitions
- `POST /api/v1/utils/upload_font` - Upload custom font

## Development Conventions

### Code Style
- TypeScript is used throughout the project
- React functional components with hooks
- Strict typing with interfaces defined in `src/types/index.ts`
- ESLint configured for code quality

### Component Organization
- Components are organized by feature (ImageEditor, VideoEditor)
- Each feature folder has an `index.tsx` for clean exports
- Shared components live at the root of `components/`

### State Management
- Local state managed with React `useState` hooks
- Configuration objects (`VideoConfig`, `ImageConfig`) passed through props
- No global state management library currently in use

### API Configuration
- API utilities centralized in `src/config/api.ts`
- `apiRequest()` function handles all HTTP requests with error handling
- `convertToApiPayload()` transforms frontend config to API format

## Backend CORS Setup

If experiencing CORS issues, run the helper script for instructions:

```bash
python cors_fix.py
```

Or manually configure the backend FastAPI app:

```python
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
```

## Vite Development Proxy

The Vite dev server proxies `/api` requests to the backend at `http://127.0.0.1:8000`. This is configured in `vite.config.ts` and includes logging for debugging.

## Key Types

All TypeScript types are defined in `src/types/index.ts`:

- **VideoConfig**: Complete video generation configuration
- **ImageConfig**: Static image generation configuration
- **Scene**: Individual scene with background, text, audio, subtitles
- **TextElement**: Text with styling (fill, shadow, animation, etc.)
- **DecorativeElement**: Overlay elements with position and opacity
- **Background**: Color, image, or video backgrounds
- **FileUploadRecord**: Uploaded file metadata
- **TaskInfo**: Generation task status and results
- **Font, Animation, Transition**: Available options

## Available Templates

The system supports various video templates (configured via backend):
- `instagram_story` - 1080x1920 vertical
- Other templates defined in the backend

## Notes

- The project is part of a larger VidGen system with a Python/FastAPI backend
- Video generation uses MoviePy on the backend
- The frontend handles complex nested configuration objects for scenes and text elements
- All API endpoints support JSON request/response format
- Binary responses (images/videos) are handled separately from JSON
