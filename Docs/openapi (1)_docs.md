---
title: Video Generation API v0.1.0
language_tabs:
  - "'shell": cURL'
language_clients:
  - "'shell": ""
toc_footers: []
includes: []
search: true
highlight_theme: darkula
headingLevel: 2

---

<!-- Generator: Widdershins v4.0.1 -->

<h1 id="video-generation-api">Video Generation API v0.1.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

<h1 id="video-generation-api-files">Files</h1>

## upload_file_with_purpose_api_v1_files_upload_post

<a id="opIdupload_file_with_purpose_api_v1_files_upload_post"></a>

`POST /api/v1/files/upload`

*Upload File With Purpose*

> Body parameter

```yaml
file: string
purpose: background_video

```

<h3 id="upload_file_with_purpose_api_v1_files_upload_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[Body_upload_file_with_purpose_api_v1_files_upload_post](#schemabody_upload_file_with_purpose_api_v1_files_upload_post)|true|none|

> Example responses

> 201 Response

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "original_filename": "string",
  "new_filename": "string",
  "file_path": "string",
  "purpose": "background_video",
  "uploaded_at": "2019-08-24T14:15:22Z",
  "file_type": "string"
}
```

<h3 id="upload_file_with_purpose_api_v1_files_upload_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Successful Response|[FileUploadRecord](#schemafileuploadrecord)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="success">
This operation does not require authentication
</aside>

## list_uploads_api_v1_files_list_uploads_get

<a id="opIdlist_uploads_api_v1_files_list_uploads_get"></a>

`GET /api/v1/files/list_uploads`

*List Uploads*

Lista todos os arquivos enviados, buscando as informações do banco de dados.

<h3 id="list_uploads_api_v1_files_list_uploads_get-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|skip|query|integer|false|none|
|limit|query|integer|false|none|

> Example responses

> 200 Response

```json
[
  {
    "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
    "original_filename": "string",
    "new_filename": "string",
    "file_path": "string",
    "purpose": "background_video",
    "uploaded_at": "2019-08-24T14:15:22Z",
    "file_type": "string"
  }
]
```

<h3 id="list_uploads_api_v1_files_list_uploads_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="list_uploads_api_v1_files_list_uploads_get-responseschema">Response Schema</h3>

Status Code **200**

*Response List Uploads Api V1 Files List Uploads Get*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response List Uploads Api V1 Files List Uploads Get|[[FileUploadRecord](#schemafileuploadrecord)]|false|none|none|
|» FileUploadRecord|[FileUploadRecord](#schemafileuploadrecord)|false|none|none|
|»» id|string(uuid)|false|none|none|
|»» original_filename|string|true|none|none|
|»» new_filename|string|true|none|none|
|»» file_path|string|true|none|none|
|»» purpose|[FilePurpose](#schemafilepurpose)|true|none|none|
|»» uploaded_at|string(date-time)|false|none|none|
|»» file_type|string|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|purpose|background_video|
|purpose|background_image|
|purpose|decorative_element|
|purpose|narration|
|purpose|music|
|purpose|audio_effect|
|purpose|font|
|purpose|texture_image|

<aside class="success">
This operation does not require authentication
</aside>

## delete_upload_api_v1_files_delete_upload__filename__delete

<a id="opIddelete_upload_api_v1_files_delete_upload__filename__delete"></a>

`DELETE /api/v1/files/delete_upload/{filename}`

*Delete Upload*

<h3 id="delete_upload_api_v1_files_delete_upload__filename__delete-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|filename|path|string|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="delete_upload_api_v1_files_delete_upload__filename__delete-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="delete_upload_api_v1_files_delete_upload__filename__delete-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="video-generation-api-images">Images</h1>

## generate_image_api_v1_images_generate_post

<a id="opIdgenerate_image_api_v1_images_generate_post"></a>

`POST /api/v1/images/generate`

*Generate Image*

Gera uma única imagem estática com base na configuração fornecida.
(Funcionalidade de geração de vídeo/cena existente)

> Body parameter

```json
{
  "config": {
    "template": "instagram_story",
    "scene": {
      "duration": 0,
      "background": {
        "type": "color",
        "path": "string",
        "color": "#000000"
      },
      "text_elements": [],
      "narration": {
        "path": "string",
        "volume": 1
      },
      "subtitles": {
        "enabled": false,
        "font": "Arial",
        "font_size": 48,
        "color": "#FFFFFF",
        "stroke_color": "#000000",
        "stroke_width": 2,
        "position": [
          "center",
          "bottom"
        ]
      },
      "effects_audio": [],
      "transition_from_previous": {
        "type": "fade",
        "duration": 1
      }
    },
    "decorative_elements": []
  }
}
```

<h3 id="generate_image_api_v1_images_generate_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ImageGenerationRequest](#schemaimagegenerationrequest)|true|none|

> Example responses

> 422 Response

```json
{
  "detail": [
    {
      "loc": [
        "string"
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

<h3 id="generate_image_api_v1_images_generate_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Retorna a imagem gerada em formato PNG.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Erro interno do servidor durante a geração da imagem.|None|

<h3 id="generate_image_api_v1_images_generate_post-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## convert_image_by_upload_api_v1_images_convert_by_upload_post

<a id="opIdconvert_image_by_upload_api_v1_images_convert_by_upload_post"></a>

`POST /api/v1/images/convert-by-upload`

*Converte uma imagem via upload de arquivo*

Faz upload de um arquivo de imagem (JPG, PNG, AVIF, etc.) e o converte para o formato de saída especificado (jpeg, png, ou webp).

> Body parameter

```yaml
output_format: jpeg
file: string

```

<h3 id="convert_image_by_upload_api_v1_images_convert_by_upload_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[Body_convert_image_by_upload_api_v1_images_convert_by_upload_post](#schemabody_convert_image_by_upload_api_v1_images_convert_by_upload_post)|true|none|

> Example responses

> 422 Response

```json
{
  "detail": [
    {
      "loc": [
        "string"
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

<h3 id="convert_image_by_upload_api_v1_images_convert_by_upload_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Retorna a imagem convertida no formato solicitado.|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Nenhum arquivo enviado ou formato de saída inválido.|None|
|415|[Unsupported Media Type](https://tools.ietf.org/html/rfc7231#section-6.5.13)|O arquivo enviado não é um tipo de imagem suportado.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Erro interno durante a conversão.|None|

<aside class="success">
This operation does not require authentication
</aside>

## convert_image_by_url_api_v1_images_convert_by_url_post

<a id="opIdconvert_image_by_url_api_v1_images_convert_by_url_post"></a>

`POST /api/v1/images/convert-by-url`

*Converte uma imagem a partir de uma URL*

Faz o download de uma imagem de uma URL pública e a converte para o formato de saída especificado (jpeg, png, ou webp).

> Body parameter

```json
{
  "url": "http://example.com",
  "output_format": "jpeg"
}
```

<h3 id="convert_image_by_url_api_v1_images_convert_by_url_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ImageConvertByUrlRequest](#schemaimageconvertbyurlrequest)|true|none|

<h3 id="convert_image_by_url_api_v1_images_convert_by_url_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Retorna a imagem convertida no formato solicitado.|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|O conteúdo da URL não é uma imagem válida.|None|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Erro interno do servidor ou falha no download da imagem.|None|
|4XX|Unknown|Erro ao baixar a imagem (ex: 404 Não Encontrado, 403 Proibido).|None|

<aside class="success">
This operation does not require authentication
</aside>

## convert_image_by_base64_api_v1_images_convert_by_base64_post

<a id="opIdconvert_image_by_base64_api_v1_images_convert_by_base64_post"></a>

`POST /api/v1/images/convert-by-base64`

*Converte uma imagem a partir de uma string Base64*

Recebe uma string Base64 (sem o prefixo 'data:image/...') e a converte para o formato de saída especificado (jpeg, png, ou webp).

> Body parameter

```json
{
  "data": "string",
  "output_format": "jpeg"
}
```

<h3 id="convert_image_by_base64_api_v1_images_convert_by_base64_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ImageConvertByBase64Request](#schemaimageconvertbybase64request)|true|none|

> Example responses

> 422 Response

```json
{
  "detail": [
    {
      "loc": [
        "string"
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

<h3 id="convert_image_by_base64_api_v1_images_convert_by_base64_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Retorna a imagem convertida no formato solicitado.|None|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|String Base64 inválida ou dados não são uma imagem.|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Erro interno durante a conversão.|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="video-generation-api-previews">Previews</h1>

## get_text_preview_api_v1_previews_text_post

<a id="opIdget_text_preview_api_v1_previews_text_post"></a>

`POST /api/v1/previews/text`

*Get Text Preview*

Gera um preview de imagem para um elemento de texto.
Este endpoint suporta todos os novos efeitos de texto (outer_glow, extrude, curve, etc.),
pois o `request.model_dump()` passa todas as configurações do schema para a função de renderização.

> Body parameter

```json
{
  "text": "string",
  "font_size": 50,
  "fill": {
    "type": "solid",
    "color": "#FFFFFF",
    "gradient_colors": [
      "string"
    ],
    "gradient_angle": 90,
    "image_path": "string"
  },
  "font": "string",
  "background_color": "string",
  "background_opacity": 0.5,
  "alignment": "left",
  "max_width": 1080,
  "border_color": "string",
  "border_width": 0,
  "stroke_color": "string",
  "stroke_width": 0,
  "line_height": 1.2,
  "background_padding": 20,
  "background_border_radius": 0,
  "shadow": {
    "color": "#000000",
    "offset_x": 3,
    "offset_y": 3,
    "opacity": 0.6,
    "blur_radius": 5
  },
  "animation": {
    "type": "fade_in",
    "duration": 1,
    "on_duration": 0.5,
    "off_duration": 0.5
  },
  "outer_glow": {
    "color": "#FFFF00",
    "radius": 10,
    "opacity": 0.8
  },
  "extrude": {
    "depth": 5,
    "color": "#333333",
    "direction_angle": 135
  },
  "curve": {
    "radius": 0,
    "direction": "up"
  }
}
```

<h3 id="get_text_preview_api_v1_previews_text_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[TextPreviewRequest](#schematextpreviewrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_text_preview_api_v1_previews_text_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_text_preview_api_v1_previews_text_post-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## get_scene_preview_api_v1_previews_scene_post

<a id="opIdget_scene_preview_api_v1_previews_scene_post"></a>

`POST /api/v1/previews/scene`

*Get Scene Preview*

Gera um preview de IMAGEM (frame estático) para uma única cena.
Este endpoint também suporta todos os novos efeitos de texto, pois a
configuração completa da cena (request.scene) é passada para o gerador de vídeo.

> Body parameter

```json
{
  "template": "instagram_story",
  "fps": 10,
  "scene": {
    "duration": 0,
    "background": {
      "type": "color",
      "path": "string",
      "color": "#000000"
    },
    "text_elements": [],
    "narration": {
      "path": "string",
      "volume": 1
    },
    "subtitles": {
      "enabled": false,
      "font": "Arial",
      "font_size": 48,
      "color": "#FFFFFF",
      "stroke_color": "#000000",
      "stroke_width": 2,
      "position": [
        "center",
        "bottom"
      ]
    },
    "effects_audio": [],
    "transition_from_previous": {
      "type": "fade",
      "duration": 1
    }
  },
  "decorative_elements": []
}
```

<h3 id="get_scene_preview_api_v1_previews_scene_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[ScenePreviewRequest](#schemascenepreviewrequest)|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="get_scene_preview_api_v1_previews_scene_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="get_scene_preview_api_v1_previews_scene_post-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="video-generation-api-tasks">Tasks</h1>

## read_tasks_api_v1_tasks__get

<a id="opIdread_tasks_api_v1_tasks__get"></a>

`GET /api/v1/tasks/`

*Read Tasks*

<h3 id="read_tasks_api_v1_tasks__get-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|skip|query|integer|false|none|
|limit|query|integer|false|none|

> Example responses

> 200 Response

```json
[
  {
    "id": "string",
    "status": "string",
    "start_time": "2019-08-24T14:15:22Z",
    "end_time": "2019-08-24T14:15:22Z",
    "output_file": "string",
    "error": "string",
    "download_url": "string",
    "request_config": {}
  }
]
```

<h3 id="read_tasks_api_v1_tasks__get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="read_tasks_api_v1_tasks__get-responseschema">Response Schema</h3>

Status Code **200**

*Response Read Tasks Api V1 Tasks  Get*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|Response Read Tasks Api V1 Tasks  Get|[[TaskResponse](#schemataskresponse)]|false|none|none|
|» TaskResponse|[TaskResponse](#schemataskresponse)|false|none|none|
|»» id|string|true|none|none|
|»» status|string|true|none|none|
|»» start_time|string(date-time)|true|none|none|
|»» end_time|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string(date-time)|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» output_file|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» error|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» download_url|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|string|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

*continued*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»» request_config|any|false|none|none|

*anyOf*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|object|false|none|none|

*or*

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|»»» *anonymous*|null|false|none|none|

<aside class="success">
This operation does not require authentication
</aside>

## read_task_api_v1_tasks__task_id__get

<a id="opIdread_task_api_v1_tasks__task_id__get"></a>

`GET /api/v1/tasks/{task_id}`

*Read Task*

<h3 id="read_task_api_v1_tasks__task_id__get-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|task_id|path|string|true|none|

> Example responses

> 200 Response

```json
{
  "id": "string",
  "status": "string",
  "start_time": "2019-08-24T14:15:22Z",
  "end_time": "2019-08-24T14:15:22Z",
  "output_file": "string",
  "error": "string",
  "download_url": "string",
  "request_config": {}
}
```

<h3 id="read_task_api_v1_tasks__task_id__get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|[TaskResponse](#schemataskresponse)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="success">
This operation does not require authentication
</aside>

## delete_task_endpoint_api_v1_tasks__task_id__delete

<a id="opIddelete_task_endpoint_api_v1_tasks__task_id__delete"></a>

`DELETE /api/v1/tasks/{task_id}`

*Delete Task Endpoint*

<h3 id="delete_task_endpoint_api_v1_tasks__task_id__delete-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|task_id|path|string|true|none|

> Example responses

> 422 Response

```json
{
  "detail": [
    {
      "loc": [
        "string"
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

<h3 id="delete_task_endpoint_api_v1_tasks__task_id__delete-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|204|[No Content](https://tools.ietf.org/html/rfc7231#section-6.3.5)|Successful Response|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="video-generation-api-utilities">Utilities</h1>

## list_fonts_api_v1_utils_list_fonts_get

<a id="opIdlist_fonts_api_v1_utils_list_fonts_get"></a>

`GET /api/v1/utils/list_fonts`

*List Fonts*

Lista as fontes personalizadas e de sistema disponíveis.

> Example responses

> 200 Response

```json
null
```

<h3 id="list_fonts_api_v1_utils_list_fonts_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="list_fonts_api_v1_utils_list_fonts_get-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## list_animations_api_v1_utils_list_animations_get

<a id="opIdlist_animations_api_v1_utils_list_animations_get"></a>

`GET /api/v1/utils/list_animations`

*List Animations*

Retorna uma lista completa das animações disponíveis para elementos.

> Example responses

> 200 Response

```json
null
```

<h3 id="list_animations_api_v1_utils_list_animations_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="list_animations_api_v1_utils_list_animations_get-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## list_transitions_api_v1_utils_list_transitions_get

<a id="opIdlist_transitions_api_v1_utils_list_transitions_get"></a>

`GET /api/v1/utils/list_transitions`

*List Transitions*

Retorna uma lista completa das transições disponíveis entre cenas.

> Example responses

> 200 Response

```json
null
```

<h3 id="list_transitions_api_v1_utils_list_transitions_get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="list_transitions_api_v1_utils_list_transitions_get-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

## upload_font_api_v1_utils_upload_font_post

<a id="opIdupload_font_api_v1_utils_upload_font_post"></a>

`POST /api/v1/utils/upload_font`

*Upload Font*

Faz o upload de um arquivo de fonte (.ttf ou .otf) para o servidor.
A fonte ficará disponível para ser usada na geração de vídeos.

> Body parameter

```yaml
file: string

```

<h3 id="upload_font_api_v1_utils_upload_font_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[Body_upload_font_api_v1_utils_upload_font_post](#schemabody_upload_font_api_v1_utils_upload_font_post)|true|none|

> Example responses

> 201 Response

```json
null
```

<h3 id="upload_font_api_v1_utils_upload_font_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|201|[Created](https://tools.ietf.org/html/rfc7231#section-6.3.2)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="upload_font_api_v1_utils_upload_font_post-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="video-generation-api-videos">Videos</h1>

## generate_video_endpoint_api_v1_videos_generate_post

<a id="opIdgenerate_video_endpoint_api_v1_videos_generate_post"></a>

`POST /api/v1/videos/generate`

*Generate Video Endpoint*

> Body parameter

```json
{
  "config": {
    "template": "instagram_story",
    "fps": 24,
    "scenes": [
      {
        "duration": 0,
        "background": {
          "type": "color",
          "path": "string",
          "color": "#000000"
        },
        "text_elements": [],
        "narration": {
          "path": "string",
          "volume": 1
        },
        "subtitles": {
          "enabled": false,
          "font": "Arial",
          "font_size": 48,
          "color": "#FFFFFF",
          "stroke_color": "#000000",
          "stroke_width": 2,
          "position": [
            "center",
            "bottom"
          ]
        },
        "effects_audio": [],
        "transition_from_previous": {
          "type": "fade",
          "duration": 1
        }
      }
    ],
    "musica": {
      "enabled": false,
      "path": "string",
      "volume": 0.8
    },
    "decorative_elements": []
  }
}
```

<h3 id="generate_video_endpoint_api_v1_videos_generate_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[VideoGenerationRequest](#schemavideogenerationrequest)|true|none|

> Example responses

> 202 Response

```json
{
  "id": "string",
  "status": "string",
  "start_time": "2019-08-24T14:15:22Z",
  "end_time": "2019-08-24T14:15:22Z",
  "output_file": "string",
  "error": "string",
  "download_url": "string",
  "request_config": {}
}
```

<h3 id="generate_video_endpoint_api_v1_videos_generate_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|202|[Accepted](https://tools.ietf.org/html/rfc7231#section-6.3.3)|Successful Response|[TaskResponse](#schemataskresponse)|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<aside class="success">
This operation does not require authentication
</aside>

## download_video_api_v1_videos_download__task_id__get

<a id="opIddownload_video_api_v1_videos_download__task_id__get"></a>

`GET /api/v1/videos/download/{task_id}`

*Download Video*

<h3 id="download_video_api_v1_videos_download__task_id__get-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|task_id|path|string|true|none|

> Example responses

> 200 Response

```json
null
```

<h3 id="download_video_api_v1_videos_download__task_id__get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|

<h3 id="download_video_api_v1_videos_download__task_id__get-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="video-generation-api-palette-extractor">Palette Extractor</h1>

## extract_palette_from_image_api_v1_palette_extract_post

<a id="opIdextract_palette_from_image_api_v1_palette_extract_post"></a>

`POST /api/v1/palette/extract`

*Extrai a paleta de cores dominante de uma imagem*

Faz o upload de uma imagem e aplica o algoritmo K-means para identificar
as cores mais dominantes.

**Funcionalidades:**
- **Rate Limiting:** Protegido contra abuso (20 reqs/minuto por IP).
- **Validação Segura:** Verifica o conteúdo do arquivo (magic bytes),
não apenas a extensão.
- **Filtros:** Permite customizar o número de cores (K), a porcentagem
mínima de relevância e a tolerância de similaridade.
- **Formatos de Resposta:** 'full' (com HEX, RGB, %) ou 'simplified' (apenas HEX).

> Body parameter

```yaml
num_colors: 8
min_percent: 5
tolerance: 40
palette_type: full
file: string

```

<h3 id="extract_palette_from_image_api_v1_palette_extract_post-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[Body_extract_palette_from_image_api_v1_palette_extract_post](#schemabody_extract_palette_from_image_api_v1_palette_extract_post)|true|none|

> Example responses

> 200 Response

```json
{
  "palette": [
    {
      "hex": "#FF5733",
      "rgb": [
        255,
        87,
        51
      ],
      "percentage": 28.5
    }
  ],
  "metadata": {
    "source_filename": "string",
    "palette_type": "full",
    "algorithm": "K-means (OpenCV + Scikit-learn)",
    "requested_color_count": 0,
    "final_color_count": 0,
    "min_percent_filter": 0,
    "color_similarity_tolerance": 0,
    "processing_time_seconds": 0
  }
}
```

<h3 id="extract_palette_from_image_api_v1_palette_extract_post-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Paleta extraída com sucesso.|[PaletteExtractionResponse](#schemapaletteextractionresponse)|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|Parâmetros inválidos ou imagem corrompida.|None|
|415|[Unsupported Media Type](https://tools.ietf.org/html/rfc7231#section-6.5.13)|Tipo de mídia não suportado (não é uma imagem válida).|None|
|422|[Unprocessable Entity](https://tools.ietf.org/html/rfc2518#section-10.3)|Validation Error|[HTTPValidationError](#schemahttpvalidationerror)|
|429|[Too Many Requests](https://tools.ietf.org/html/rfc6585#section-4)|Limite de requisições (Rate Limit) excedido.|None|
|500|[Internal Server Error](https://tools.ietf.org/html/rfc7231#section-6.6.1)|Erro interno no processamento (ex: falha no K-means).|None|

<aside class="success">
This operation does not require authentication
</aside>

<h1 id="video-generation-api-root">Root</h1>

## read_root__get

<a id="opIdread_root__get"></a>

`GET /`

*Read Root*

> Example responses

> 200 Response

```json
null
```

<h3 id="read_root__get-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|Successful Response|Inline|

<h3 id="read_root__get-responseschema">Response Schema</h3>

<aside class="success">
This operation does not require authentication
</aside>

# Schemas

<h2 id="tocS_Animation">Animation</h2>
<!-- backwards compatibility -->
<a id="schemaanimation"></a>
<a id="schema_Animation"></a>
<a id="tocSanimation"></a>
<a id="tocsanimation"></a>

```json
{
  "type": "fade_in",
  "duration": 1,
  "on_duration": 0.5,
  "off_duration": 0.5
}

```

Animation

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|string|true|none|none|
|duration|number|false|none|none|
|on_duration|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|number|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|off_duration|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|number|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|type|fade_in|
|type|fade_out|
|type|slide_in_from_top|
|type|slide_in_from_bottom|
|type|slide_in_from_left|
|type|slide_in_from_right|
|type|slide_out_to_top|
|type|slide_out_to_bottom|
|type|slide_out_to_left|
|type|slide_out_to_right|
|type|zoom_in|
|type|zoom_out|
|type|rotate|
|type|blink|

<h2 id="tocS_AudioTrack">AudioTrack</h2>
<!-- backwards compatibility -->
<a id="schemaaudiotrack"></a>
<a id="schema_AudioTrack"></a>
<a id="tocSaudiotrack"></a>
<a id="tocsaudiotrack"></a>

```json
{
  "path": "string",
  "volume": 1
}

```

AudioTrack

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|path|string|true|none|none|
|volume|number|false|none|none|

<h2 id="tocS_Background">Background</h2>
<!-- backwards compatibility -->
<a id="schemabackground"></a>
<a id="schema_Background"></a>
<a id="tocSbackground"></a>
<a id="tocsbackground"></a>

```json
{
  "type": "color",
  "path": "string",
  "color": "#000000"
}

```

Background

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|string|false|none|none|
|path|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|color|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|type|color|
|type|image|
|type|video|

<h2 id="tocS_Body_convert_image_by_upload_api_v1_images_convert_by_upload_post">Body_convert_image_by_upload_api_v1_images_convert_by_upload_post</h2>
<!-- backwards compatibility -->
<a id="schemabody_convert_image_by_upload_api_v1_images_convert_by_upload_post"></a>
<a id="schema_Body_convert_image_by_upload_api_v1_images_convert_by_upload_post"></a>
<a id="tocSbody_convert_image_by_upload_api_v1_images_convert_by_upload_post"></a>
<a id="tocsbody_convert_image_by_upload_api_v1_images_convert_by_upload_post"></a>

```json
{
  "output_format": "jpeg",
  "file": "string"
}

```

Body_convert_image_by_upload_api_v1_images_convert_by_upload_post

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|output_format|string|false|none|Formato de saída desejado (jpeg, png, webp)|
|file|string(binary)|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|output_format|jpeg|
|output_format|png|
|output_format|webp|

<h2 id="tocS_Body_extract_palette_from_image_api_v1_palette_extract_post">Body_extract_palette_from_image_api_v1_palette_extract_post</h2>
<!-- backwards compatibility -->
<a id="schemabody_extract_palette_from_image_api_v1_palette_extract_post"></a>
<a id="schema_Body_extract_palette_from_image_api_v1_palette_extract_post"></a>
<a id="tocSbody_extract_palette_from_image_api_v1_palette_extract_post"></a>
<a id="tocsbody_extract_palette_from_image_api_v1_palette_extract_post"></a>

```json
{
  "num_colors": 8,
  "min_percent": 5,
  "tolerance": 40,
  "palette_type": "full",
  "file": "string"
}

```

Body_extract_palette_from_image_api_v1_palette_extract_post

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|num_colors|integer|false|none|Número de clusters (K) para o K-means.|
|min_percent|number|false|none|Porcentagem mínima (0-100) para uma cor ser incluída.|
|tolerance|integer|false|none|Tolerância para agrupar cores similares (distância RGB). Valores maiores = menos cores.|
|palette_type|string|false|none|Formato da resposta: 'full' (detalhado) ou 'simplified' (só HEX).|
|file|string(binary)|true|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|palette_type|full|
|palette_type|simplified|

<h2 id="tocS_Body_upload_file_with_purpose_api_v1_files_upload_post">Body_upload_file_with_purpose_api_v1_files_upload_post</h2>
<!-- backwards compatibility -->
<a id="schemabody_upload_file_with_purpose_api_v1_files_upload_post"></a>
<a id="schema_Body_upload_file_with_purpose_api_v1_files_upload_post"></a>
<a id="tocSbody_upload_file_with_purpose_api_v1_files_upload_post"></a>
<a id="tocsbody_upload_file_with_purpose_api_v1_files_upload_post"></a>

```json
{
  "file": "string",
  "purpose": "background_video"
}

```

Body_upload_file_with_purpose_api_v1_files_upload_post

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|file|string(binary)|true|none|O arquivo a ser enviado.|
|purpose|[FilePurpose](#schemafilepurpose)|true|none|A finalidade do arquivo.|

<h2 id="tocS_Body_upload_font_api_v1_utils_upload_font_post">Body_upload_font_api_v1_utils_upload_font_post</h2>
<!-- backwards compatibility -->
<a id="schemabody_upload_font_api_v1_utils_upload_font_post"></a>
<a id="schema_Body_upload_font_api_v1_utils_upload_font_post"></a>
<a id="tocSbody_upload_font_api_v1_utils_upload_font_post"></a>
<a id="tocsbody_upload_font_api_v1_utils_upload_font_post"></a>

```json
{
  "file": "string"
}

```

Body_upload_font_api_v1_utils_upload_font_post

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|file|string(binary)|true|none|none|

<h2 id="tocS_Curve">Curve</h2>
<!-- backwards compatibility -->
<a id="schemacurve"></a>
<a id="schema_Curve"></a>
<a id="tocScurve"></a>
<a id="tocscurve"></a>

```json
{
  "radius": 0,
  "direction": "up"
}

```

Curve

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|radius|number|true|none|none|
|direction|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|direction|up|
|direction|down|

<h2 id="tocS_DecorativeElement">DecorativeElement</h2>
<!-- backwards compatibility -->
<a id="schemadecorativeelement"></a>
<a id="schema_DecorativeElement"></a>
<a id="tocSdecorativeelement"></a>
<a id="tocsdecorativeelement"></a>

```json
{
  "path": "string",
  "base64": "string",
  "position": "top_left",
  "width_ratio": 0,
  "size_ratio": 0.15,
  "offset_y": 0,
  "opacity": 1
}

```

DecorativeElement

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|path|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|base64|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|position|string|false|none|none|
|width_ratio|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|number|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|size_ratio|number|false|none|none|
|offset_y|integer|false|none|none|
|opacity|number|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|position|top_left|
|position|top_right|
|position|bottom_left|
|position|bottom_right|
|position|top_center|

<h2 id="tocS_Extrude">Extrude</h2>
<!-- backwards compatibility -->
<a id="schemaextrude"></a>
<a id="schema_Extrude"></a>
<a id="tocSextrude"></a>
<a id="tocsextrude"></a>

```json
{
  "depth": 5,
  "color": "#333333",
  "direction_angle": 135
}

```

Extrude

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|depth|integer|false|none|none|
|color|string|false|none|none|
|direction_angle|number|false|none|none|

<h2 id="tocS_FilePurpose">FilePurpose</h2>
<!-- backwards compatibility -->
<a id="schemafilepurpose"></a>
<a id="schema_FilePurpose"></a>
<a id="tocSfilepurpose"></a>
<a id="tocsfilepurpose"></a>

```json
"background_video"

```

FilePurpose

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|FilePurpose|string|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|FilePurpose|background_video|
|FilePurpose|background_image|
|FilePurpose|decorative_element|
|FilePurpose|narration|
|FilePurpose|music|
|FilePurpose|audio_effect|
|FilePurpose|font|
|FilePurpose|texture_image|

<h2 id="tocS_FileUploadRecord">FileUploadRecord</h2>
<!-- backwards compatibility -->
<a id="schemafileuploadrecord"></a>
<a id="schema_FileUploadRecord"></a>
<a id="tocSfileuploadrecord"></a>
<a id="tocsfileuploadrecord"></a>

```json
{
  "id": "497f6eca-6276-4993-bfeb-53cbbbba6f08",
  "original_filename": "string",
  "new_filename": "string",
  "file_path": "string",
  "purpose": "background_video",
  "uploaded_at": "2019-08-24T14:15:22Z",
  "file_type": "string"
}

```

FileUploadRecord

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|string(uuid)|false|none|none|
|original_filename|string|true|none|none|
|new_filename|string|true|none|none|
|file_path|string|true|none|none|
|purpose|[FilePurpose](#schemafilepurpose)|true|none|none|
|uploaded_at|string(date-time)|false|none|none|
|file_type|string|true|none|none|

<h2 id="tocS_HTTPValidationError">HTTPValidationError</h2>
<!-- backwards compatibility -->
<a id="schemahttpvalidationerror"></a>
<a id="schema_HTTPValidationError"></a>
<a id="tocShttpvalidationerror"></a>
<a id="tocshttpvalidationerror"></a>

```json
{
  "detail": [
    {
      "loc": [
        "string"
      ],
      "msg": "string",
      "type": "string"
    }
  ]
}

```

HTTPValidationError

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|detail|[[ValidationError](#schemavalidationerror)]|false|none|none|

<h2 id="tocS_ImageConvertByBase64Request">ImageConvertByBase64Request</h2>
<!-- backwards compatibility -->
<a id="schemaimageconvertbybase64request"></a>
<a id="schema_ImageConvertByBase64Request"></a>
<a id="tocSimageconvertbybase64request"></a>
<a id="tocsimageconvertbybase64request"></a>

```json
{
  "data": "string",
  "output_format": "jpeg"
}

```

ImageConvertByBase64Request

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|data|string|true|none|A imagem codificada como uma string Base64. Não inclua o prefixo 'data:image/...', apenas os dados.|
|output_format|string|false|none|O formato de saída desejado (jpeg, png, ou webp).|

#### Enumerated Values

|Property|Value|
|---|---|
|output_format|jpeg|
|output_format|png|
|output_format|webp|

<h2 id="tocS_ImageConvertByUrlRequest">ImageConvertByUrlRequest</h2>
<!-- backwards compatibility -->
<a id="schemaimageconvertbyurlrequest"></a>
<a id="schema_ImageConvertByUrlRequest"></a>
<a id="tocSimageconvertbyurlrequest"></a>
<a id="tocsimageconvertbyurlrequest"></a>

```json
{
  "url": "http://example.com",
  "output_format": "jpeg"
}

```

ImageConvertByUrlRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|url|string(uri)|true|none|A URL pública da imagem a ser convertida.|
|output_format|string|false|none|O formato de saída desejado (jpeg, png, ou webp).|

#### Enumerated Values

|Property|Value|
|---|---|
|output_format|jpeg|
|output_format|png|
|output_format|webp|

<h2 id="tocS_ImageGenerationConfig">ImageGenerationConfig</h2>
<!-- backwards compatibility -->
<a id="schemaimagegenerationconfig"></a>
<a id="schema_ImageGenerationConfig"></a>
<a id="tocSimagegenerationconfig"></a>
<a id="tocsimagegenerationconfig"></a>

```json
{
  "template": "instagram_story",
  "scene": {
    "duration": 0,
    "background": {
      "type": "color",
      "path": "string",
      "color": "#000000"
    },
    "text_elements": [],
    "narration": {
      "path": "string",
      "volume": 1
    },
    "subtitles": {
      "enabled": false,
      "font": "Arial",
      "font_size": 48,
      "color": "#FFFFFF",
      "stroke_color": "#000000",
      "stroke_width": 2,
      "position": [
        "center",
        "bottom"
      ]
    },
    "effects_audio": [],
    "transition_from_previous": {
      "type": "fade",
      "duration": 1
    }
  },
  "decorative_elements": []
}

```

ImageGenerationConfig

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|template|string|false|none|none|
|scene|[Scene](#schemascene)|true|none|none|
|decorative_elements|[[DecorativeElement](#schemadecorativeelement)]|false|none|none|

<h2 id="tocS_ImageGenerationRequest">ImageGenerationRequest</h2>
<!-- backwards compatibility -->
<a id="schemaimagegenerationrequest"></a>
<a id="schema_ImageGenerationRequest"></a>
<a id="tocSimagegenerationrequest"></a>
<a id="tocsimagegenerationrequest"></a>

```json
{
  "config": {
    "template": "instagram_story",
    "scene": {
      "duration": 0,
      "background": {
        "type": "color",
        "path": "string",
        "color": "#000000"
      },
      "text_elements": [],
      "narration": {
        "path": "string",
        "volume": 1
      },
      "subtitles": {
        "enabled": false,
        "font": "Arial",
        "font_size": 48,
        "color": "#FFFFFF",
        "stroke_color": "#000000",
        "stroke_width": 2,
        "position": [
          "center",
          "bottom"
        ]
      },
      "effects_audio": [],
      "transition_from_previous": {
        "type": "fade",
        "duration": 1
      }
    },
    "decorative_elements": []
  }
}

```

ImageGenerationRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|config|[ImageGenerationConfig](#schemaimagegenerationconfig)|true|none|none|

<h2 id="tocS_Musica">Musica</h2>
<!-- backwards compatibility -->
<a id="schemamusica"></a>
<a id="schema_Musica"></a>
<a id="tocSmusica"></a>
<a id="tocsmusica"></a>

```json
{
  "enabled": false,
  "path": "string",
  "volume": 0.8
}

```

Musica

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|enabled|boolean|false|none|none|
|path|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|volume|number|false|none|none|

<h2 id="tocS_OuterGlow">OuterGlow</h2>
<!-- backwards compatibility -->
<a id="schemaouterglow"></a>
<a id="schema_OuterGlow"></a>
<a id="tocSouterglow"></a>
<a id="tocsouterglow"></a>

```json
{
  "color": "#FFFF00",
  "radius": 10,
  "opacity": 0.8
}

```

OuterGlow

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|color|string|false|none|none|
|radius|integer|false|none|none|
|opacity|number|false|none|none|

<h2 id="tocS_PaletteColorItem">PaletteColorItem</h2>
<!-- backwards compatibility -->
<a id="schemapalettecoloritem"></a>
<a id="schema_PaletteColorItem"></a>
<a id="tocSpalettecoloritem"></a>
<a id="tocspalettecoloritem"></a>

```json
{
  "hex": "#FF5733",
  "rgb": [
    255,
    87,
    51
  ],
  "percentage": 28.5
}

```

PaletteColorItem

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|hex|string|true|none|Código HEX da cor (ex: #FF5733)|
|rgb|[integer]|true|none|Valores RGB da cor (ex: [255, 87, 51])|
|percentage|number|true|none|Porcentagem da cor na imagem (ex: 28.5)|

<h2 id="tocS_PaletteExtractionMetadata">PaletteExtractionMetadata</h2>
<!-- backwards compatibility -->
<a id="schemapaletteextractionmetadata"></a>
<a id="schema_PaletteExtractionMetadata"></a>
<a id="tocSpaletteextractionmetadata"></a>
<a id="tocspaletteextractionmetadata"></a>

```json
{
  "source_filename": "string",
  "palette_type": "full",
  "algorithm": "K-means (OpenCV + Scikit-learn)",
  "requested_color_count": 0,
  "final_color_count": 0,
  "min_percent_filter": 0,
  "color_similarity_tolerance": 0,
  "processing_time_seconds": 0
}

```

PaletteExtractionMetadata

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|source_filename|string|true|none|Nome do arquivo de origem|
|palette_type|string|true|none|Tipo de paleta solicitada|
|algorithm|string|false|none|Algoritmo utilizado|
|requested_color_count|integer|true|none|Número de clusters (K) solicitado para o K-means|
|final_color_count|integer|true|none|Número de cores na paleta final (após filtragem)|
|min_percent_filter|number|true|none|Filtro de porcentagem mínima aplicado|
|color_similarity_tolerance|integer|true|none|Filtro de tolerância de similaridade aplicado|
|processing_time_seconds|number|true|none|Tempo de processamento em segundos|

#### Enumerated Values

|Property|Value|
|---|---|
|palette_type|full|
|palette_type|simplified|

<h2 id="tocS_PaletteExtractionResponse">PaletteExtractionResponse</h2>
<!-- backwards compatibility -->
<a id="schemapaletteextractionresponse"></a>
<a id="schema_PaletteExtractionResponse"></a>
<a id="tocSpaletteextractionresponse"></a>
<a id="tocspaletteextractionresponse"></a>

```json
{
  "palette": [
    {
      "hex": "#FF5733",
      "rgb": [
        255,
        87,
        51
      ],
      "percentage": 28.5
    }
  ],
  "metadata": {
    "source_filename": "string",
    "palette_type": "full",
    "algorithm": "K-means (OpenCV + Scikit-learn)",
    "requested_color_count": 0,
    "final_color_count": 0,
    "min_percent_filter": 0,
    "color_similarity_tolerance": 0,
    "processing_time_seconds": 0
  }
}

```

PaletteExtractionResponse

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|palette|any|true|none|A paleta de cores extraída (lista de objetos 'full' ou lista de strings 'simplified')|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[[PaletteColorItem](#schemapalettecoloritem)]|false|none|[Schema para um item individual da paleta de cores (modo 'full').<br>Define a estrutura de dados para uma única cor dominante.]|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[string]|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|metadata|[PaletteExtractionMetadata](#schemapaletteextractionmetadata)|true|none|Metadados do processo de extração|

<h2 id="tocS_Scene">Scene</h2>
<!-- backwards compatibility -->
<a id="schemascene"></a>
<a id="schema_Scene"></a>
<a id="tocSscene"></a>
<a id="tocsscene"></a>

```json
{
  "duration": 0,
  "background": {
    "type": "color",
    "path": "string",
    "color": "#000000"
  },
  "text_elements": [],
  "narration": {
    "path": "string",
    "volume": 1
  },
  "subtitles": {
    "enabled": false,
    "font": "Arial",
    "font_size": 48,
    "color": "#FFFFFF",
    "stroke_color": "#000000",
    "stroke_width": 2,
    "position": [
      "center",
      "bottom"
    ]
  },
  "effects_audio": [],
  "transition_from_previous": {
    "type": "fade",
    "duration": 1
  }
}

```

Scene

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|duration|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|number|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|background|[Background](#schemabackground)|false|none|none|
|text_elements|[[TextElement](#schematextelement)]|false|none|none|
|narration|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[AudioTrack](#schemaaudiotrack)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|subtitles|[SubtitleConfig](#schemasubtitleconfig)|false|none|none|
|effects_audio|[[AudioTrack](#schemaaudiotrack)]|false|none|none|
|transition_from_previous|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Transition](#schematransition)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

<h2 id="tocS_ScenePreviewRequest">ScenePreviewRequest</h2>
<!-- backwards compatibility -->
<a id="schemascenepreviewrequest"></a>
<a id="schema_ScenePreviewRequest"></a>
<a id="tocSscenepreviewrequest"></a>
<a id="tocsscenepreviewrequest"></a>

```json
{
  "template": "instagram_story",
  "fps": 10,
  "scene": {
    "duration": 0,
    "background": {
      "type": "color",
      "path": "string",
      "color": "#000000"
    },
    "text_elements": [],
    "narration": {
      "path": "string",
      "volume": 1
    },
    "subtitles": {
      "enabled": false,
      "font": "Arial",
      "font_size": 48,
      "color": "#FFFFFF",
      "stroke_color": "#000000",
      "stroke_width": 2,
      "position": [
        "center",
        "bottom"
      ]
    },
    "effects_audio": [],
    "transition_from_previous": {
      "type": "fade",
      "duration": 1
    }
  },
  "decorative_elements": []
}

```

ScenePreviewRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|template|string|false|none|none|
|fps|integer|false|none|none|
|scene|[Scene](#schemascene)|true|none|none|
|decorative_elements|[[DecorativeElement](#schemadecorativeelement)]|false|none|none|

<h2 id="tocS_Shadow">Shadow</h2>
<!-- backwards compatibility -->
<a id="schemashadow"></a>
<a id="schema_Shadow"></a>
<a id="tocSshadow"></a>
<a id="tocsshadow"></a>

```json
{
  "color": "#000000",
  "offset_x": 3,
  "offset_y": 3,
  "opacity": 0.6,
  "blur_radius": 5
}

```

Shadow

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|color|string|false|none|none|
|offset_x|integer|false|none|none|
|offset_y|integer|false|none|none|
|opacity|number|false|none|none|
|blur_radius|integer|false|none|none|

<h2 id="tocS_SubtitleConfig">SubtitleConfig</h2>
<!-- backwards compatibility -->
<a id="schemasubtitleconfig"></a>
<a id="schema_SubtitleConfig"></a>
<a id="tocSsubtitleconfig"></a>
<a id="tocssubtitleconfig"></a>

```json
{
  "enabled": false,
  "font": "Arial",
  "font_size": 48,
  "color": "#FFFFFF",
  "stroke_color": "#000000",
  "stroke_width": 2,
  "position": [
    "center",
    "bottom"
  ]
}

```

SubtitleConfig

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|enabled|boolean|false|none|none|
|font|string|false|none|none|
|font_size|integer|false|none|none|
|color|string|false|none|none|
|stroke_color|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|stroke_width|integer|false|none|none|
|position|array|false|none|none|

<h2 id="tocS_TaskResponse">TaskResponse</h2>
<!-- backwards compatibility -->
<a id="schemataskresponse"></a>
<a id="schema_TaskResponse"></a>
<a id="tocStaskresponse"></a>
<a id="tocstaskresponse"></a>

```json
{
  "id": "string",
  "status": "string",
  "start_time": "2019-08-24T14:15:22Z",
  "end_time": "2019-08-24T14:15:22Z",
  "output_file": "string",
  "error": "string",
  "download_url": "string",
  "request_config": {}
}

```

TaskResponse

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|id|string|true|none|none|
|status|string|true|none|none|
|start_time|string(date-time)|true|none|none|
|end_time|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string(date-time)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|output_file|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|error|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|download_url|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|request_config|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|object|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

<h2 id="tocS_TextElement">TextElement</h2>
<!-- backwards compatibility -->
<a id="schematextelement"></a>
<a id="schema_TextElement"></a>
<a id="tocStextelement"></a>
<a id="tocstextelement"></a>

```json
{
  "text": "string",
  "font_size": 50,
  "fill": {
    "type": "solid",
    "color": "#FFFFFF",
    "gradient_colors": [
      "string"
    ],
    "gradient_angle": 90,
    "image_path": "string"
  },
  "font": "string",
  "position": {
    "x": "center",
    "y": "center"
  },
  "animation": {
    "type": "fade_in",
    "duration": 1,
    "on_duration": 0.5,
    "off_duration": 0.5
  },
  "alignment": "left",
  "line_height": 1.2,
  "background_color": "string",
  "background_opacity": 0.5,
  "border_color": "string",
  "border_width": 0,
  "background_padding": 20,
  "background_border_radius": 0,
  "stroke_color": "string",
  "stroke_width": 0,
  "shadow": {
    "color": "#000000",
    "offset_x": 3,
    "offset_y": 3,
    "opacity": 0.6,
    "blur_radius": 5
  },
  "margin_bottom": 20,
  "outer_glow": {
    "color": "#FFFF00",
    "radius": 10,
    "opacity": 0.8
  },
  "extrude": {
    "depth": 5,
    "color": "#333333",
    "direction_angle": 135
  },
  "curve": {
    "radius": 0,
    "direction": "up"
  }
}

```

TextElement

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|text|string|true|none|none|
|font_size|integer|false|none|none|
|fill|[TextFill](#schematextfill)|false|none|none|
|font|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|position|[TextPosition](#schematextposition)|false|none|none|
|animation|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Animation](#schemaanimation)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|alignment|string|false|none|none|
|line_height|number|false|none|none|
|background_color|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|background_opacity|number|false|none|none|
|border_color|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|border_width|integer|false|none|none|
|background_padding|integer|false|none|none|
|background_border_radius|integer|false|none|none|
|stroke_color|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|stroke_width|integer|false|none|none|
|shadow|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Shadow](#schemashadow)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|margin_bottom|integer|false|none|none|
|outer_glow|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[OuterGlow](#schemaouterglow)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|extrude|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Extrude](#schemaextrude)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|curve|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Curve](#schemacurve)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|alignment|left|
|alignment|center|
|alignment|right|

<h2 id="tocS_TextFill">TextFill</h2>
<!-- backwards compatibility -->
<a id="schematextfill"></a>
<a id="schema_TextFill"></a>
<a id="tocStextfill"></a>
<a id="tocstextfill"></a>

```json
{
  "type": "solid",
  "color": "#FFFFFF",
  "gradient_colors": [
    "string"
  ],
  "gradient_angle": 90,
  "image_path": "string"
}

```

TextFill

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|string|false|none|none|
|color|string|false|none|none|
|gradient_colors|[string]|false|none|none|
|gradient_angle|integer|false|none|none|
|image_path|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|type|solid|
|type|gradient|
|type|texture|

<h2 id="tocS_TextPosition">TextPosition</h2>
<!-- backwards compatibility -->
<a id="schematextposition"></a>
<a id="schema_TextPosition"></a>
<a id="tocStextposition"></a>
<a id="tocstextposition"></a>

```json
{
  "x": "center",
  "y": "center"
}

```

TextPosition

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|x|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|y|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

<h2 id="tocS_TextPreviewRequest">TextPreviewRequest</h2>
<!-- backwards compatibility -->
<a id="schematextpreviewrequest"></a>
<a id="schema_TextPreviewRequest"></a>
<a id="tocStextpreviewrequest"></a>
<a id="tocstextpreviewrequest"></a>

```json
{
  "text": "string",
  "font_size": 50,
  "fill": {
    "type": "solid",
    "color": "#FFFFFF",
    "gradient_colors": [
      "string"
    ],
    "gradient_angle": 90,
    "image_path": "string"
  },
  "font": "string",
  "background_color": "string",
  "background_opacity": 0.5,
  "alignment": "left",
  "max_width": 1080,
  "border_color": "string",
  "border_width": 0,
  "stroke_color": "string",
  "stroke_width": 0,
  "line_height": 1.2,
  "background_padding": 20,
  "background_border_radius": 0,
  "shadow": {
    "color": "#000000",
    "offset_x": 3,
    "offset_y": 3,
    "opacity": 0.6,
    "blur_radius": 5
  },
  "animation": {
    "type": "fade_in",
    "duration": 1,
    "on_duration": 0.5,
    "off_duration": 0.5
  },
  "outer_glow": {
    "color": "#FFFF00",
    "radius": 10,
    "opacity": 0.8
  },
  "extrude": {
    "depth": 5,
    "color": "#333333",
    "direction_angle": 135
  },
  "curve": {
    "radius": 0,
    "direction": "up"
  }
}

```

TextPreviewRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|text|string|true|none|none|
|font_size|integer|false|none|none|
|fill|[TextFill](#schematextfill)|false|none|none|
|font|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|background_color|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|background_opacity|number|false|none|none|
|alignment|string|false|none|none|
|max_width|integer|false|none|none|
|border_color|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|border_width|integer|false|none|none|
|stroke_color|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|stroke_width|integer|false|none|none|
|line_height|number|false|none|none|
|background_padding|integer|false|none|none|
|background_border_radius|integer|false|none|none|
|shadow|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Shadow](#schemashadow)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|animation|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Animation](#schemaanimation)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|outer_glow|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[OuterGlow](#schemaouterglow)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|extrude|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Extrude](#schemaextrude)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|curve|any|false|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|[Curve](#schemacurve)|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|null|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|alignment|left|
|alignment|center|
|alignment|right|

<h2 id="tocS_Transition">Transition</h2>
<!-- backwards compatibility -->
<a id="schematransition"></a>
<a id="schema_Transition"></a>
<a id="tocStransition"></a>
<a id="tocstransition"></a>

```json
{
  "type": "fade",
  "duration": 1
}

```

Transition

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|type|string|false|none|none|
|duration|number|false|none|none|

#### Enumerated Values

|Property|Value|
|---|---|
|type|fade|
|type|slide_in_out|
|type|wipe_right|
|type|wipe_left|
|type|wipe_up|
|type|wipe_down|
|type|circle_open|
|type|circle_close|

<h2 id="tocS_ValidationError">ValidationError</h2>
<!-- backwards compatibility -->
<a id="schemavalidationerror"></a>
<a id="schema_ValidationError"></a>
<a id="tocSvalidationerror"></a>
<a id="tocsvalidationerror"></a>

```json
{
  "loc": [
    "string"
  ],
  "msg": "string",
  "type": "string"
}

```

ValidationError

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|loc|[anyOf]|true|none|none|

anyOf

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|string|false|none|none|

or

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|» *anonymous*|integer|false|none|none|

continued

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|msg|string|true|none|none|
|type|string|true|none|none|

<h2 id="tocS_VideoConfig">VideoConfig</h2>
<!-- backwards compatibility -->
<a id="schemavideoconfig"></a>
<a id="schema_VideoConfig"></a>
<a id="tocSvideoconfig"></a>
<a id="tocsvideoconfig"></a>

```json
{
  "template": "instagram_story",
  "fps": 24,
  "scenes": [
    {
      "duration": 0,
      "background": {
        "type": "color",
        "path": "string",
        "color": "#000000"
      },
      "text_elements": [],
      "narration": {
        "path": "string",
        "volume": 1
      },
      "subtitles": {
        "enabled": false,
        "font": "Arial",
        "font_size": 48,
        "color": "#FFFFFF",
        "stroke_color": "#000000",
        "stroke_width": 2,
        "position": [
          "center",
          "bottom"
        ]
      },
      "effects_audio": [],
      "transition_from_previous": {
        "type": "fade",
        "duration": 1
      }
    }
  ],
  "musica": {
    "enabled": false,
    "path": "string",
    "volume": 0.8
  },
  "decorative_elements": []
}

```

VideoConfig

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|template|string|false|none|none|
|fps|integer|false|none|none|
|scenes|[[Scene](#schemascene)]|true|none|none|
|musica|[Musica](#schemamusica)|false|none|none|
|decorative_elements|[[DecorativeElement](#schemadecorativeelement)]|false|none|none|

<h2 id="tocS_VideoGenerationRequest">VideoGenerationRequest</h2>
<!-- backwards compatibility -->
<a id="schemavideogenerationrequest"></a>
<a id="schema_VideoGenerationRequest"></a>
<a id="tocSvideogenerationrequest"></a>
<a id="tocsvideogenerationrequest"></a>

```json
{
  "config": {
    "template": "instagram_story",
    "fps": 24,
    "scenes": [
      {
        "duration": 0,
        "background": {
          "type": "color",
          "path": "string",
          "color": "#000000"
        },
        "text_elements": [],
        "narration": {
          "path": "string",
          "volume": 1
        },
        "subtitles": {
          "enabled": false,
          "font": "Arial",
          "font_size": 48,
          "color": "#FFFFFF",
          "stroke_color": "#000000",
          "stroke_width": 2,
          "position": [
            "center",
            "bottom"
          ]
        },
        "effects_audio": [],
        "transition_from_previous": {
          "type": "fade",
          "duration": 1
        }
      }
    ],
    "musica": {
      "enabled": false,
      "path": "string",
      "volume": 0.8
    },
    "decorative_elements": []
  }
}

```

VideoGenerationRequest

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|config|[VideoConfig](#schemavideoconfig)|true|none|none|

