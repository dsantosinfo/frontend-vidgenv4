// src/config/branding.ts
export const BRAND = {
  name: 'VidGen',
  tagline: 'Estúdio de Mídia Profissional',
  shortName: 'VG',

  colorFrom: '#3B82F6',
  colorTo: '#9333EA',

  viewTitles: {
    editor:           { title: 'Editor de Vídeo',       description: 'Crie vídeos com ferramentas avançadas' },
    imageEditor:      { title: 'Gerador de Imagens',     description: 'Crie imagens estáticas com textos e efeitos' },
    videos:           { title: 'Vídeos Gerados',         description: 'Gerencie e baixe seus vídeos' },
    'company-settings': { title: 'Configurações',        description: 'Empresa, membros, arquivos e presets' },
    admin:            { title: 'Administração',          description: 'Empresas, usuários e branding global' },
    profile:          { title: 'Meu Perfil',             description: 'Edite suas informações e senha' },
  } as Record<string, { title: string; description: string }>,
} as const;
