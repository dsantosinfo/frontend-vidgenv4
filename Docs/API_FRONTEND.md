# VidGenPyV4 — Documentação da API para Frontend

**Base URL:** `https://vidgen.dsantosinfo.com.br/api/v1`  
**Documentação interativa:** `https://vidgen.dsantosinfo.com.br/docs`  
**Versão:** 4.2.0

---

## Autenticação

A API usa **JWT Bearer Token**. Após o login, inclua o token em todas as requisições protegidas:

```
Authorization: Bearer <access_token>
```

O token expira em **60 minutos**. Após expirar, o usuário deve fazer login novamente.

| Ícone | Significado |
|---|---|
| 🔒 | Token obrigatório |
| 🔓 | Token opcional (comportamento muda se autenticado) |
| 👑 | Exclusivo para `owner` ou `superadmin` |
| sem ícone | Público |

---

## RBAC — Papéis de Usuário

| Role | Descrição |
|---|---|
| `owner` | Proprietário da plataforma. Acesso total, pode promover qualquer usuário |
| `superadmin` | Administrador. Pode gerenciar usuários, mas não pode atribuir roles administrativos |
| `user` | Cliente padrão da plataforma |

---

## 1. Autenticação (`/auth`)

### `POST /auth/register`
Cria uma nova conta. Envia e-mail de boas-vindas automaticamente.

**Body (JSON):**
```json
{
  "email": "usuario@exemplo.com",
  "password": "Senha@123",
  "full_name": "Nome Completo",
  "phone": "+5511999999999"
}
```

| Campo | Tipo | Obrigatório | Regras |
|---|---|---|---|
| `email` | string | ✅ | Formato de e-mail válido |
| `password` | string | ✅ | Mín. 8 chars, maiúscula, minúscula, número e caractere especial |
| `full_name` | string | ❌ | — |
| `phone` | string | ❌ | Formato E.164 (ex: `+5511999999999`) |

**Regras de senha — todos os critérios são obrigatórios:**
- Mínimo 8 caracteres
- Ao menos 1 letra maiúscula
- Ao menos 1 letra minúscula
- Ao menos 1 número
- Ao menos 1 caractere especial (`!@#$%^&*` etc.)

**Resposta `201`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@exemplo.com",
  "full_name": "Nome Completo",
  "phone": "+5511999999999",
  "role": "user",
  "is_active": true,
  "created_at": "2026-04-19T12:00:00"
}
```

**Erros:**
| Status | Motivo |
|---|---|
| `409` | E-mail já cadastrado |
| `422` | Campos inválidos (senha fraca, telefone mal formatado, etc.) |

---

### `POST /auth/login`
Autentica o usuário e retorna o token JWT.

> ⚠️ Este endpoint usa `application/x-www-form-urlencoded`, **não JSON**.

**Body (form-data):**
| Campo | Valor |
|---|---|
| `username` | e-mail do usuário |
| `password` | senha |

**Exemplo com fetch:**
```javascript
const form = new URLSearchParams();
form.append('username', 'usuario@exemplo.com');
form.append('password', 'Senha@123');

const res = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: form
});
const { access_token } = await res.json();
```

**Resposta `200`:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Erros:**
| Status | Motivo |
|---|---|
| `401` | E-mail ou senha incorretos |
| `403` | Usuário inativo |

---

### 🔒 `GET /auth/me`
Retorna os dados do usuário autenticado.

**Resposta `200`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@exemplo.com",
  "full_name": "Nome Completo",
  "phone": "+5511999999999",
  "role": "user",
  "is_active": true,
  "created_at": "2026-04-19T12:00:00"
}
```

---

### 🔒 `PUT /auth/me`
Atualiza os dados do próprio perfil. Usuários comuns **não podem** alterar o próprio `role`.

**Body (JSON) — todos os campos são opcionais:**
```json
{
  "full_name": "Novo Nome",
  "phone": "+5511988887777"
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `full_name` | string | — |
| `phone` | string | Formato E.164 |

**Resposta `200`:** objeto `UserResponse` atualizado

---

### 🔒 `POST /auth/change-password`
Altera a senha do usuário autenticado.

**Body (JSON):**
```json
{
  "current_password": "SenhaAtual@123",
  "new_password": "NovaSenha@456"
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `current_password` | string | Senha atual correta |
| `new_password` | string | Mesmas regras de força do registro |

**Resposta `204`:** sem corpo

**Erros:**
| Status | Motivo |
|---|---|
| `401` | Senha atual incorreta |
| `422` | Nova senha não atende aos critérios |

---

### `POST /auth/forgot-password`
Solicita recuperação de senha. Envia e-mail com link de redefinição válido por **30 minutos**.

> A resposta é sempre `202` independente de o e-mail existir ou não (segurança contra enumeração).

**Body (JSON):**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Resposta `202`:**
```json
{
  "detail": "Se o e-mail estiver cadastrado, você receberá as instruções em breve"
}
```

---

### `POST /auth/reset-password`
Redefine a senha usando o token recebido por e-mail.

**Body (JSON):**
```json
{
  "token": "token-recebido-no-email",
  "new_password": "NovaSenha@789"
}
```

| Campo | Tipo | Regras |
|---|---|---|
| `token` | string | Token do link recebido por e-mail |
| `new_password` | string | Mesmas regras de força do registro |

**Resposta `204`:** sem corpo

**Erros:**
| Status | Motivo |
|---|---|
| `400` | Token inválido ou expirado |
| `422` | Nova senha não atende aos critérios |

**Fluxo de recuperação de senha:**
```
1. POST /auth/forgot-password   → usuário informa o e-mail
2. Usuário recebe e-mail com link: https://frontend.com/reset-password?token=xxx
3. Frontend extrai o token da URL e exibe formulário de nova senha
4. POST /auth/reset-password    → envia token + nova senha
5. Redirecionar para login
```

---

## 2. Administração (`/admin`) 👑

Todos os endpoints desta seção exigem role `owner` ou `superadmin`.

### 👑 `GET /admin/users`
Lista todos os usuários da plataforma.

**Query params:**
| Param | Tipo | Default |
|---|---|---|
| `skip` | int | `0` |
| `limit` | int | `100` |

**Resposta `200`:** array de `UserResponse`

---

### 👑 `GET /admin/users/{user_id}`
Busca um usuário específico pelo ID.

**Resposta `200`:** objeto `UserResponse`  
**Erro `404`:** Usuário não encontrado

---

### 👑 `PUT /admin/users/{user_id}`
Edita qualquer campo de um usuário, incluindo `role` e `is_active`.

**Body (JSON) — todos os campos são opcionais:**
```json
{
  "full_name": "Nome Atualizado",
  "phone": "+5511999990000",
  "is_active": true,
  "role": "superadmin"
}
```

| Campo | Tipo | Restrição |
|---|---|---|
| `full_name` | string | — |
| `phone` | string | Formato E.164 |
| `is_active` | boolean | — |
| `role` | `"owner"` \| `"superadmin"` \| `"user"` | Apenas `owner` pode atribuir `owner` ou `superadmin` |

**Resposta `200`:** objeto `UserResponse` atualizado

**Erros:**
| Status | Motivo |
|---|---|
| `403` | `superadmin` tentando atribuir role administrativo |
| `404` | Usuário não encontrado |

---

### 👑 `DELETE /admin/users/{user_id}`
Desativa um usuário (soft delete — `is_active = false`). Não remove do banco.

**Resposta `204`:** sem corpo

**Erros:**
| Status | Motivo |
|---|---|
| `400` | Tentativa de desativar a própria conta |
| `404` | Usuário não encontrado |

---

## 3. Templates de Usuário (`/user-templates`)

### 🔒 `GET /user-templates/`
Lista todos os templates do usuário autenticado.

**Resposta `200`:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Story Instagram Padrão",
    "config": { "template": "instagram_story", "fps": 24, "scenes": [...] },
    "created_at": "2026-04-19T12:00:00",
    "updated_at": "2026-04-19T12:00:00"
  }
]
```

---

### 🔒 `POST /user-templates/`
Cria um novo template.

**Body (JSON):**
```json
{
  "name": "Story Instagram Padrão",
  "config": {
    "template": "instagram_story",
    "fps": 24,
    "scenes": [
      {
        "duration": 5.0,
        "background": { "type": "color", "color": "#FF6B35" },
        "text_elements": [
          {
            "text": "Seu texto aqui",
            "font_size": 60,
            "fill": { "type": "solid", "color": "#FFFFFF" },
            "position": { "x": "center", "y": "center" }
          }
        ]
      }
    ]
  }
}
```

**Resposta `201`:** objeto `UserTemplateResponse`

---

### 🔒 `GET /user-templates/{template_id}`
Busca um template pelo ID.

**Resposta `200`:** objeto `UserTemplateResponse`  
**Erro `404`:** Template não encontrado

---

### 🔒 `PUT /user-templates/{template_id}`
Atualiza um template. Todos os campos são opcionais.

**Body (JSON):**
```json
{ "name": "Novo Nome", "config": { ... } }
```

**Resposta `200`:** objeto `UserTemplateResponse` atualizado

---

### 🔒 `DELETE /user-templates/{template_id}`
Remove um template.

**Resposta `204`:** sem corpo

---

## 4. Geração Simplificada (`/generate-simplified`)

### 🔒 `POST /generate-simplified/video`
Enfileira geração de vídeo usando um template salvo.

**Body (JSON):**
```json
{
  "template_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "content_type": "video",
  "overrides": {
    "scenes": [
      {
        "duration": 8.0,
        "background": { "type": "color", "color": "#000000" },
        "text_elements": [
          {
            "text": "Texto personalizado",
            "font_size": 50,
            "fill": { "type": "solid", "color": "#FFFFFF" },
            "position": { "x": "center", "y": "center" }
          }
        ]
      }
    ]
  }
}
```

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `template_id` | UUID | ✅ | ID do template salvo |
| `content_type` | `"video"` \| `"image"` | ✅ | Tipo de conteúdo |
| `overrides` | object | ❌ | Sobrescreve campos do config do template |

**Resposta `202`:** objeto `TaskResponse`

---

### 🔒 `POST /generate-simplified/image`
Gera imagem estática usando um template salvo. Retorna PNG diretamente.

**Body (JSON):** mesmo formato do endpoint de vídeo.

**Resposta `200`:** `image/png` (bytes)

---

## 5. Tarefas (`/tasks`)

> Cada usuário vê apenas suas próprias tarefas.

### 🔒 `GET /tasks/`
Lista as tarefas do usuário autenticado.

**Query params:** `skip` (default `0`), `limit` (default `100`)

**Resposta `200`:**
```json
[
  {
    "id": "a1b2c3d4e5f6...",
    "status": "completed",
    "start_time": "2026-04-19T12:00:00",
    "end_time": "2026-04-19T12:01:30",
    "output_file": "a1b2c3d4e5f6_output.mp4",
    "error": null,
    "download_url": "https://vidgen.dsantosinfo.com.br/api/v1/videos/download/a1b2c3d4e5f6",
    "request_config": { ... },
    "user_id": "550e8400-e29b-41d4-a716-446655440000"
  }
]
```

**Valores de `status`:**
| Status | Descrição |
|---|---|
| `queued` | Na fila |
| `processing` | Em processamento |
| `completed` | Concluído — `download_url` disponível |
| `failed` | Falhou — campo `error` contém o motivo |

---

### 🔒 `GET /tasks/{task_id}`
Busca uma tarefa específica.

**Resposta `200`:** objeto `TaskResponse`  
**Erro `404`:** Não encontrada ou pertence a outro usuário

---

### 🔒 `DELETE /tasks/{task_id}`
Remove uma tarefa e seus arquivos.

**Resposta `204`:** sem corpo

---

## 6. Geração de Vídeo Direta (`/videos`)

### 🔓 `POST /videos/generate`
Enfileira geração com configuração completa. Token opcional — se autenticado, a tarefa fica associada ao usuário.

**Body (JSON):**
```json
{
  "config": {
    "template": "instagram_story",
    "fps": 24,
    "scenes": [
      {
        "duration": 5.0,
        "background": { "type": "color", "color": "#FF6B35" },
        "text_elements": [
          {
            "text": "Olá Mundo!",
            "font_size": 60,
            "fill": { "type": "solid", "color": "#FFFFFF" },
            "position": { "x": "center", "y": "center" }
          }
        ]
      }
    ],
    "musica": { "enabled": false }
  }
}
```

**Templates disponíveis:**
| Valor | Resolução |
|---|---|
| `instagram_story` | 1080×1920 |
| `instagram_feed` | 1080×1080 |
| `facebook_feed` | 1200×630 |
| `youtube_thumbnail` | 1280×720 |
| `tiktok` | 1080×1920 |
| `custom` | Definida pelo config |

**Resposta `202`:** objeto `TaskResponse`

---

### `GET /videos/download/{task_id}`
Download do vídeo. Disponível apenas quando `status === "completed"`.

**Resposta `200`:** `video/mp4`  
**Erro `404`:** Tarefa não encontrada ou vídeo não pronto

---

## 7. Upload de Arquivos (`/files`)

### `POST /files/upload`
Faz upload de um ativo para uso nas gerações.

**Body (multipart/form-data):**
| Campo | Tipo | Obrigatório |
|---|---|---|
| `file` | File | ✅ |
| `purpose` | string | ✅ |

**Valores de `purpose`:**
| Valor | Uso |
|---|---|
| `background_image` | Imagem de fundo |
| `background_video` | Vídeo de fundo |
| `decorative_element` | Logo, ícone |
| `narration` | Áudio de narração por cena |
| `music` | Música de fundo global |
| `audio_effect` | Efeito sonoro por cena |
| `font` | Fonte `.ttf` customizada |
| `texture_image` | Textura para preenchimento de texto |

**Extensões aceitas:**
- Imagem: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`, `.svg`
- Vídeo: `.mp4`, `.avi`, `.mov`, `.wmv`, `.flv`, `.webm`, `.mkv`
- Áudio: `.mp3`, `.wav`, `.aac`, `.ogg`, `.m4a`, `.flac`

**Resposta `201`:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "original_filename": "minha_foto.jpg",
  "new_filename": "a1b2c3d4_minha_foto.jpg",
  "file_path": "a1b2c3d4_minha_foto.jpg",
  "purpose": "background_image",
  "file_type": "image",
  "uploaded_at": "2026-04-19T12:00:00"
}
```

> Use o valor de `new_filename` nos campos `path` da configuração de vídeo/imagem.

---

### `GET /files/list_uploads`
Lista todos os arquivos enviados.

**Query params:** `skip` (default `0`), `limit` (default `100`)

**Resposta `200`:** array de `FileUploadRecord`

---

### `DELETE /files/delete_upload/{filename}`
Remove um arquivo pelo `new_filename`.

**Resposta `200`:**
```json
{
  "message": "Arquivo e registro deletados com sucesso",
  "filename": "a1b2c3d4_minha_foto.jpg"
}
```

---

## 8. Geração de Imagem Estática (`/images`)

### `POST /images/generate`
Gera uma imagem PNG a partir de uma configuração de cena.

**Body (JSON):**
```json
{
  "config": {
    "template": "instagram_story",
    "scene": {
      "background": { "type": "color", "color": "#1A1A2E" },
      "text_elements": [
        {
          "text": "Preview",
          "font_size": 80,
          "fill": { "type": "solid", "color": "#FFFFFF" },
          "position": { "x": "center", "y": "center" }
        }
      ]
    },
    "decorative_elements": []
  }
}
```

**Resposta `200`:** `image/png`

---

## 9. Fluxos Completos

### Fluxo 1 — Cadastro e primeira geração com template
```
1. POST /auth/register              → cria conta (recebe e-mail de boas-vindas)
2. POST /auth/login                 → obtém access_token
3. POST /files/upload               → faz upload de assets (se necessário)
4. POST /user-templates/            → salva configuração como template
5. POST /generate-simplified/video  → enfileira geração
6. GET  /tasks/{task_id}            → polling até status = "completed"
7. GET  /videos/download/{id}       → baixa o vídeo
```

---

### Fluxo 2 — Criar e usar um template (passo a passo detalhado)

Este é o fluxo principal da plataforma. Siga cada etapa em ordem.

#### Etapa 1 — Login
```javascript
const form = new URLSearchParams();
form.append('username', 'usuario@exemplo.com');
form.append('password', 'Senha@123');

const { access_token } = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: form
}).then(r => r.json());

// Guarde o token para todas as próximas requisições
const headers = {
  'Authorization': `Bearer ${access_token}`,
  'Content-Type': 'application/json'
};
```

#### Etapa 2 — (Opcional) Upload de assets
Necessário apenas se o template usar imagem/vídeo/áudio de fundo ou fonte customizada.

```javascript
const formData = new FormData();
formData.append('file', arquivoSelecionado);  // File do input
formData.append('purpose', 'background_image');

const { new_filename } = await fetch('/api/v1/files/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${access_token}` },
  body: formData
}).then(r => r.json());

// Use new_filename no campo "path" do background
```

**Valores de `purpose` disponíveis:**
| Valor | Quando usar |
|---|---|
| `background_image` | Imagem de fundo da cena |
| `background_video` | Vídeo de fundo da cena |
| `decorative_element` | Logo ou ícone sobreposto |
| `narration` | Áudio de narração por cena |
| `music` | Música de fundo global |
| `audio_effect` | Efeito sonoro por cena |
| `font` | Fonte `.ttf` customizada |
| `texture_image` | Textura para preenchimento de texto |

#### Etapa 3 — Criar o template

```javascript
const template = await fetch('/api/v1/user-templates/', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: 'Story Padrão',
    config: {
      template: 'instagram_story',  // define resolução 1080x1920
      fps: 24,
      scenes: [
        {
          duration: 5.0,
          background: {
            type: 'color',
            color: '#1A1A2E'
            // Para imagem: type: 'image', path: new_filename
            // Para vídeo:  type: 'video', path: new_filename
          },
          text_elements: [
            {
              text: 'Seu título aqui',
              font_size: 70,
              fill: { type: 'solid', color: '#FFFFFF' },
              position: { x: 'center', y: 'center' },
              alignment: 'center',
              shadow: {
                color: '#000000',
                offset_x: 3,
                offset_y: 3,
                opacity: 0.6,
                blur_radius: 5
              }
            }
          ]
        }
      ],
      musica: { enabled: false }
    }
  })
}).then(r => r.json());

const templateId = template.id;  // guarde este ID
```

**Templates (resoluções) disponíveis:**
| Valor | Resolução | Uso |
|---|---|---|
| `instagram_story` | 1080×1920 | Stories, Reels |
| `instagram_feed` | 1080×1080 | Feed quadrado |
| `facebook_feed` | 1200×630 | Posts Facebook |
| `youtube_thumbnail` | 1280×720 | Thumbnails |
| `tiktok` | 1080×1920 | TikTok |
| `custom` | Definida pelo config | Livre |

#### Etapa 4 — Gerar preview como imagem (recomendado antes do vídeo)

```javascript
const imageBlob = await fetch('/api/v1/generate-simplified/image', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    template_id: templateId,
    content_type: 'image'
  })
}).then(r => r.blob());

// Exibir preview no frontend
const previewUrl = URL.createObjectURL(imageBlob);
document.getElementById('preview').src = previewUrl;
```

#### Etapa 5 — Gerar o vídeo

```javascript
// Geração simples (usa o config do template)
const task = await fetch('/api/v1/generate-simplified/video', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    template_id: templateId,
    content_type: 'video'
  })
}).then(r => r.json());

// Geração com texto diferente (override)
const taskComOverride = await fetch('/api/v1/generate-simplified/video', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    template_id: templateId,
    content_type: 'video',
    overrides: {
      scenes: [
        {
          duration: 8.0,
          background: { type: 'color', color: '#FF6B35' },
          text_elements: [
            {
              text: 'Texto específico para esta geração',
              font_size: 60,
              fill: { type: 'solid', color: '#FFFFFF' },
              position: { x: 'center', y: 'center' }
            }
          ]
        }
      ]
    }
  })
}).then(r => r.json());

const taskId = task.id;
```

#### Etapa 6 — Polling até completar

```javascript
async function aguardarVideo(taskId, token) {
  const headers = { 'Authorization': `Bearer ${token}` };

  while (true) {
    const task = await fetch(`/api/v1/tasks/${taskId}`, { headers })
      .then(r => r.json());

    if (task.status === 'completed') return task.download_url;
    if (task.status === 'failed')    throw new Error(task.error);

    // Aguarda 3 segundos antes da próxima verificação
    await new Promise(r => setTimeout(r, 3000));
  }
}

const downloadUrl = await aguardarVideo(taskId, access_token);
```

#### Etapa 7 — Download

```javascript
// Opção A: abrir em nova aba
window.open(downloadUrl, '_blank');

// Opção B: download automático
const a = document.createElement('a');
a.href = downloadUrl;
a.download = 'video.mp4';
a.click();
```

---

### Fluxo 3 — Recuperação de senha
```
1. POST /auth/forgot-password       → informa e-mail
2. Usuário recebe e-mail com link:
   https://frontend.com/reset-password?token=TOKEN
3. Frontend extrai token da URL e exibe formulário
4. POST /auth/reset-password        → envia token + nova senha
5. Redirecionar para /login
```

---

### Fluxo 4 — Geração direta sem conta (legado)
```
1. POST /files/upload           → faz upload de assets
2. POST /videos/generate        → enfileira sem token (user_id = null)
3. GET  /videos/download/{id}   → polling direto (sem auth)
```

> ⚠️ Neste fluxo as tarefas **não aparecem** em `GET /tasks/`. Use `GET /videos/download/{task_id}` para verificar se está pronto.

---

## 10. Tratamento de Erros

Todos os erros seguem o formato:
```json
{ "detail": "Mensagem descritiva do erro" }
```

| Status | Significado |
|---|---|
| `400` | Requisição inválida (token expirado, auto-desativação, etc.) |
| `401` | Token ausente, inválido ou senha incorreta |
| `403` | Sem permissão (role insuficiente, usuário inativo) |
| `404` | Recurso não encontrado |
| `409` | Conflito (e-mail já cadastrado) |
| `415` | Tipo de arquivo não suportado |
| `422` | Erro de validação (senha fraca, telefone inválido, campo obrigatório ausente) |
| `429` | Rate limit excedido |
| `500` | Erro interno do servidor |

---

## 11. Referência de Tipos TypeScript

```typescript
type UserRole = 'owner' | 'superadmin' | 'user';

interface UserResponse {
  id: string;                     // UUID
  email: string;
  full_name: string | null;
  phone: string | null;           // formato E.164
  role: UserRole;
  is_active: boolean;
  created_at: string;             // ISO 8601
}

interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
}

interface TaskResponse {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  start_time: string;             // ISO 8601
  end_time: string | null;
  output_file: string | null;
  error: string | null;
  download_url: string | null;    // preenchido quando status=completed
  request_config: object | null;
  user_id: string | null;         // UUID do usuário (se autenticado)
}

interface UserTemplateResponse {
  id: string;                     // UUID
  user_id: string;                // UUID
  name: string;
  config: VideoConfig;
  created_at: string;
  updated_at: string;
}

interface VideoConfig {
  template: 'instagram_story' | 'instagram_feed' | 'facebook_feed' |
            'youtube_thumbnail' | 'tiktok' | 'custom';
  fps: number;                    // default: 24
  scenes: Scene[];
  musica?: Musica;
  decorative_elements?: DecorativeElement[];
}

interface Scene {
  duration?: number;              // segundos (null = duração do áudio)
  background: Background;
  text_elements?: TextElement[];
  narration?: AudioTrack;
  effects_audio?: AudioTrack[];
  subtitles?: SubtitleConfig;
  transition_from_previous?: Transition;
}

interface Background {
  type: 'color' | 'image' | 'video';
  color?: string;                 // hex — obrigatório se type=color
  path?: string;                  // new_filename — obrigatório se type=image|video
}

interface TextElement {
  text: string;
  font_size?: number;             // default: 50
  fill?: TextFill;
  font?: string;                  // new_filename de fonte .ttf
  position?: { x: string | number; y: string | number | 'auto' };
  alignment?: 'left' | 'center' | 'right';
  animation?: Animation;
  shadow?: Shadow;
  stroke_color?: string;
  stroke_width?: number;
  outer_glow?: OuterGlow;
  extrude?: Extrude;
  curve?: Curve;
}

interface TextFill {
  type: 'solid' | 'gradient' | 'texture';
  color?: string;                 // hex (type=solid)
  gradient_colors?: string[];     // array de hex (type=gradient)
  gradient_angle?: number;        // graus (type=gradient)
  image_path?: string;            // new_filename (type=texture)
}
```
