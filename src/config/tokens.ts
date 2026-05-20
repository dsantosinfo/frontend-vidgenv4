// src/config/tokens.ts
// Design tokens centralizados — fonte única de verdade para espaçamentos e larguras.

/** Padding de página responsivo */
export const PAGE_PADDING = 'p-3 sm:p-4';

/** Gap entre seções */
export const SECTION_GAP = 'space-y-3 sm:space-y-4';

/**
 * Larguras máximas padronizadas:
 * - form:  perfil, admin restrito — conteúdo estreito (1 coluna)
 * - wide:  settings com abas, admin — conteúdo médio (2 colunas)
 * - full:  listas, grids — conteúdo largo (3+ colunas)
 */
export const MAX_W = {
  form: 'max-w-2xl',
  wide: 'max-w-3xl',
  full: 'max-w-7xl',
} as const;

/** Containers de página prontos para uso */
export const PAGE_CONTAINER = {
  form: `${PAGE_PADDING} ${MAX_W.form} mx-auto ${SECTION_GAP}`,
  wide: `${PAGE_PADDING} ${MAX_W.wide} mx-auto ${SECTION_GAP}`,
  full: `${PAGE_PADDING} ${MAX_W.full} mx-auto ${SECTION_GAP}`,
} as const;

/** Títulos responsivos */
export const TITLE = {
  page:    'text-base font-bold text-slate-900 sm:text-lg',
  section: 'text-sm font-semibold text-slate-900 sm:text-base',
  label:   'text-xs font-medium text-slate-700 sm:text-sm',
  hint:    'text-xs text-slate-500',
} as const;

/** Botões padronizados */
export const BTN = {
  primary:   'px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors',
  secondary: 'px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors',
  danger:    'px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors',
  icon:      'p-1.5 rounded-lg transition-colors',
} as const;
