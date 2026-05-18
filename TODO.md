# TODO — Atualização para nova API VidGen

## Status Legend
- [ ] Pendente
- [x] Concluído

---

## Análise EDITOR_TEMPLATES.md vs. Editor Atual

### Checklist do documento

- [x] Estado central espelhando `VideoConfig`
- [x] Seletor de template com atualização do canvas
- [x] Upload de assets com `new_filename`
- [x] Editor de fundo por cena (cor, imagem, vídeo)
- [x] Editor de `TextElement` com todos os campos
- [x] Preview de texto via `/previews/text` — debounce corrigido para **400ms**
- [x] Preview de cena via `/previews/scene` — debounce corrigido para **600ms**
- [x] `max_width` no preview de texto baseado na largura real do template (`getTemplateWidth`)
- [x] Seletor visual de posição (grid 3×3 + coordenadas numéricas)
- [x] Efeitos de texto (shadow, glow, extrude, curve)
- [x] Seletor de animação por texto
- [x] Gerenciador de cenas (adicionar, remover, duplicar)
- [x] **Reordenação de cenas** (botões ↑↓ na lista lateral) — **NOVO**
- [x] Seletor de transição entre cenas
- [x] Elementos decorativos globais
- [x] Trilha sonora global
- [x] Modal "Salvar como Template" com campo de nome
- [x] **Botão "Atualizar Template"** (PUT quando template já foi salvo) — **NOVO**
- [x] Salvar template **sem text_elements**
- [x] Botão "Gerar Vídeo" com polling de status
- [x] Download ao completar

---

## Outros recursos implementados

- [x] Autenticação JWT (login/register/logout)
- [x] Gestão de usuários (admin)
- [x] User Templates (CRUD + simplified generation)
- [x] Palette Extractor integrado no BackgroundEditor e TextElementEditor
- [x] `getTemplateWidth` exportado de `templates.ts`
