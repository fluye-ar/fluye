# KB Desarrollo - Notion

Base de conocimiento interna del equipo de desarrollo Cloudy/Fluye, alojada en Notion.

## Acceso

- **Workspace:** Cloudy Vision
- **Database ID:** `98f0b841-879f-43c3-85eb-fd602931cbae`
- **URL:** https://www.notion.so/7a7b9c3703ba4bdab5d76ef88a742e85
- **MCP:** Configurado como `notionApi` en Claude Code (scope: user)
- **Integration:** Token `ntn_...` en `~/.claude.json` (env `NOTION_TOKEN`)

### Cómo descargar un artículo a local

1. Buscar el `page_id` en el índice de abajo o con `mcp__notionApi__API-post-search` → query: "término"
2. Leer el contenido: `mcp__notionApi__API-get-block-children` → block_id: `<page_id>`
3. Si el resultado supera el límite de tokens, se guarda a disco — parsear con Python para extraer el texto
4. Guardar como `.md` en este directorio (`fluye/docs/kb/`)
5. Marcar en el índice con ✅ y la ruta relativa al archivo local

## Propiedades de la DB

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| Página | title | Título del artículo |
| Etiquetas | multi_select | Categorías (ver abajo) |
| Fecha | date | Fecha relevante |
| Fecha de creación | created_time | Auto |
| Última edición | last_edited_time | Auto |
| Propietario | people | Autor |
| Verificación | verification | Estado de verificación |

## Etiquetas disponibles

Desarrollo, Doors, Controles, Base de datos, Errores, Herramientas, Soporte, Conectores, Whatsapp, AWS, S3, Backups, RDS, Google, Windows2019, Startup, Incorporación, Diseño, Políticas, Visión, Novedades de la empresa

## Índice de artículos (169 total)

### Recientes (2026)

| Artículo | Etiquetas | Fecha | Local |
|----------|-----------|-------|-------|
| Relaciones (JOINS) | — | 2026-03-30 | ✅ `../RELATIONS.md` |
| Doors en Windows 2019 - XML | Doors, Windows2019, Errores | 2026-02-27 | |
| Doors.DbUpdater - Utilidad de actualización de bases | Desarrollo, Doors, Base de datos | 2026-01-21 |
| Obtención de valores anteriores/nuevos de SYS_DOC_LOG como tabla | Desarrollo | 2026-01-15 |

### Desarrollo & Node.js

| Artículo | Etiquetas | Fecha | Local |
|----------|-----------|-------|-------|
| Integrar Doors usando la API Rest | Soporte, Doors, Desarrollo | 2025-09-23 | ✅ `integrar_doors_api_rest.md` |
| doc:change - Evento de documento modificado | Doors, Desarrollo | 2025-09-17 | ✅ `doc_change_evento.md` |
| Js - Server-sent events | — | 2025-09-17 | ✅ `js_server_sent_events.md` |
| Js SDK - Manejo de adjuntos grandes | — | 2025-09-15 | |
| doorsapi2 - Iterar un DoorsMap | — | 2025-09-15 | |
| Procesar eventos asíncronos con Node | Desarrollo, Doors, Herramientas | 2025-08-21 | ✅ `procesar_eventos_async_node.md` |
| Variables globales en Node | — | 2025-07-14 | ✅ `variables_globales_node.md` |
| Estructura del message según el end-point en Node | — | 2025-07-14 | ✅ `estructura_message_endpoint_node.md` |
| VbScript - Emitir eventos del servidor | — | 2025-07-14 | ✅ `vbs_emitir_eventos_servidor.md` |
| VbScript - Llamar código Node desde Vbs | Herramientas, Doors, Desarrollo | 2025-03-27 | ✅ `vbs_llamar_node_desde_vbs.md` |
| Node - Hacer streaming desde eventos node | — | 2024-10-28 | |
| Node - Opciones para hacer response | — | 2024-10-28 | ✅ `node_opciones_response.md` |
| Node - Usar setTimeout y setInterval | — | 2024-10-21 | ✅ `node_settimeout_setinterval.md` |
| Node - Correr un proceso asíncrono desde un evento síncrono | — | 2024-08-30 | ✅ `node_proceso_asincrono_evento_sincrono.md` |
| Node - Agregar adjuntos en el syncEvent BeforeSave | — | 2025-09-05 | ✅ `node_agregar_adjuntos_beforesave.md` |
| Llamada a método no implementado en dapihttp | Desarrollo | 2025-01-28 | |
| dapihttp | Desarrollo | 2023-12-29 | |
| dapihttp - Error La conexión finalizó anormalmente | Errores | 2024-12-26 | |
| Agregar adjuntos con dapihttp | Desarrollo | 2023-12-29 | |
| AgenteCommitNode | — | 2025-02-12 | ✅ `agente_commit_node.md` |
| JS - Abrir una pagina haciendo POST | Desarrollo | 2024-05-02 | |
| Parsear un JSON posteado a una pag ASP | Desarrollo | 2023-12-29 | |

### Controles (generic3/generic6/liveforms7)

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| Búsqueda custom autocomplete personalizada | — | 2025-10-23 |
| Controls6 - Textbox readonly con link | — | 2025-09-15 |
| Control Notas Javascript | Desarrollo, Doors, Controles | 2025-05-21 |
| Generic6 - Usando las validaciones de Bootstrap | — | 2025-04-14 |
| Nuevo: controls6.newControlByDef | — | 2025-02-13 |
| Refrescando el bootstrap-select en generic6 | — | 2025-03-06 |
| generic6 - Mensaje Script error. | — | 2025-09-05 |
| Usar fieldsets invisibles para ordenar los controles | Desarrollo, Doors, Controles | 2024-11-12 |
| Escribir el código de los controles en VS Code + Github | Desarrollo, Doors, Controles | 2025-04-07 |
| Agregar etiqueta correctamente alineada a un control HTMLRaw | Controles | 2024-02-24 |
| Datalist sin permisos | Controles | 2023-12-29 |
| Datalist Extendido | Controles | 2023-12-29 |
| SelectKeywords editable | Controles | 2023-12-29 |
| SearchViewer | Controles | 2023-12-29 |
| Agregar botón en la primera posición en la Toolbar del Generic3 | Controles | 2023-12-29 |
| Modificar un Option de clsSelectFolder o clsSelectKeywords | Controles | 2023-12-29 |
| Cambiar el orden de opciones de un SelectKeywords | Controles | 2023-12-29 |
| Crear un control Select con elementos de una BD externa | Controles | 2023-12-29 |
| Acceso a control Autocomplete desde Javascript | Controles | 2023-08-24 |
| Agregar el botón llamar a un input de teléfono | Controles | 2023-08-24 |
| Setear el valor de un DTPicker con JavaScript | Controles | 2023-08-24 |
| Exportar controles | Controles | 2023-08-22 |
| Val de un inputmask sin mascara | Controles | 2023-08-22 |
| Evitar que HTMLArea remueva atributos del HTML | — | 2025-01-10 |

### Base de datos & SQL

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| Obtención de valores anteriores/nuevos de SYS_DOC_LOG como tabla | Desarrollo | 2026-01-15 |
| Función PerteneceGrupo para SQL | Base de datos | 2024-02-22 |
| SQL Server - Ver tamaño de tablas | Desarrollo, Base de datos, Herramientas | 2024-04-29 |
| Administrar SQL Server en AWS RDS | Base de datos | 2024-04-29 |
| Restaurar backup de DB en entorno de Desarrollo | Base de datos | 2024-04-29 |
| SplitAndGet - SQL Server | Base de datos | 2023-12-29 |
| SQL - Listar usuarios y grupos | Base de datos | 2023-12-29 |
| Obtener último inicio de sesión | Base de datos | 2023-12-29 |
| Ordenar ascendente con los NULL al último | Base de datos | 2023-12-29 |
| Consulta documentos borrados en la papelera | Base de datos | 2023-12-29 |
| Diferencia entre dos fechas en formato HH:MM | Base de datos | 2023-12-29 |
| Campo SEMANA | Base de datos | 2023-12-29 |
| Listar definicion de campos calculados | Base de datos | 2023-12-29 |
| Invalid object name 'dbo.sysproperties' | Base de datos | 2023-12-29 |
| Búsquedas Accent Insensitive en SQL Server | Base de datos | 2023-12-29 |
| Listar las funciones en SQL Server | Base de datos | 2023-12-29 |
| SP para crear índices de texto en SQL Server | Base de datos | 2023-12-29 |
| Manejo de índices de texto mediante T-SQL | Base de datos | 2023-12-29 |
| Indexación de archivos adjuntos en SQL Server | Base de datos | 2023-08-24 |
| Depuración de tablas de log | Base de datos | 2023-08-24 |
| Borrar tablas SYS_FIELDS huérfanas | Base de datos | 2023-08-24 |
| Obtener un atributo de un XML en el mismo SELECT | Base de datos | 2023-08-24 |
| Trazar excepciones de SQL Server con Profiler | Base de datos | 2023-08-24 |
| Issue con campos calculados en SQL Server | Errores | 2023-08-22 |
| Prueba de conexión de Gestar a base de datos externas | Desarrollo | 2024-02-22 |

### Whatsapp & Conectores

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| Actualizaciones de estados de mensajes de Whatsapp | — | 2025-10-04 |
| Whatsapp Connector - Usando las funciones de base de datos | Conectores, Whatsapp, Desarrollo | 2025-05-28 |
| Enviar notificaciones del sistema via Whatsapp | — | 2025-05-21 |
| Whatsapp Cnn - Funciones de BD no devuelven valores actualizados | — | 2024-11-08 |
| Actualización asíncrona de WAPP_RESUME sin SQL Service Broker | — | 2025-04-01 |

### AWS & Infraestructura

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| Cómo levantar entorno nuevo desde Template - Nuevo Cliente | BD, AWS, S3, RDS, Backups, Startup | 2025-09-11 |
| Formas de Descargar Backups de BD desde AWS S3 | BD, AWS, S3, Backups | 2024-06-12 |
| Descargar Backup de BD de cliente desde AWS S3 | AWS, S3, Backups, RDS | 2024-04-29 |
| Manejo ECS desde Node (Ubuntu) | — | 2023-12-29 |

### App7 / Mobile

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| App - Utilizar emojis en el renderer de la vista | — | 2025-09-05 |
| App - Tabbed Views Layout con mas opciones | — | 2025-08-05 |
| !App7 - Propiedades de folder | Desarrollo | 2024-11-12 |
| App7 - Rutas | Desarrollo | 2024-08-23 |

### Doors (configuración, versiones, errores)

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| Doors en Windows 2019 - XML | Doors, Windows2019, Errores | 2026-02-27 |
| Doors.DbUpdater | Desarrollo, Doors, Base de datos | 2026-01-21 |
| Error al enviar notificaciones push | Doors, Soporte, Errores | 2025-09-25 |
| Notificaciones push - Ejemplos de envio | — | 2025-09-25 |
| Error al exportar - Caracter no compatible con XML | — | 2025-09-15 |
| Configuración de Google reCaptcha Enterprise | Doors, Google | 2025-04-17 |
| Nuevo form para Keywords | — | 2025-04-07 |
| Inicio de sesión en Doors con Google | Doors, Google | 2024-11-21 |
| Crear Forms a partir de definiciones en Excel | Desarrollo | 2024-11-19 |
| Error ActiveX MSXML2.DOMDocument40 en Windows 2019 | Errores | 2023-12-11 |
| Doors 7 - Documentación técnica | Doors | 2023-11-29 |
| Personalización pantallas de Inicio de sesión | Doors | 2023-08-24 |
| Restringir acceso al explorer | Doors | 2023-08-24 |
| Remote DCE | Doors | 2023-08-22 |
| Vistas - Estilo de fila | Doors | 2023-12-29 |

### Herramientas & Utilidades

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| Pivotable - El nuevo searchViewer | — | 2025-05-12 |
| Pivotable - Usar estilo de fila al exportar a Excel | — | 2025-01-28 |
| messageFromTemplate - Nuevo parametro | — | 2025-08-07 |
| Enviar emails asíncronos y programados | Desarrollo | 2025-05-21 |
| getAtt - Usar miniaturas de adjuntos en las vistas | Desarrollo | 2025-05-23 |
| Nuevo módulo de Marketing | Desarrollo | 2025-10-08 |
| Ejemplos de prompts para convertir vbscript a javascript | — | 2025-03-10 |
| !Template - Trabajando con el workflow | — | 2025-07-14 |
| Leer datos con REST | Herramientas | 2023-08-24 |
| Analyzer en Chrome | Herramientas | 2023-08-24 |
| Generic Controls Test: Traza de tiempos por controles | Herramientas | 2023-08-24 |
| Conexión a Excel para importación | Herramientas | 2023-08-24 |
| aspSmartUpload.dll | Herramientas | 2023-12-29 |
| !Mail Connector | Herramientas | 2024-08-23 |

### VBScript (legacy)

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| VbScript - Hacer logging en Node Console desde vbs | Desarrollo, Doors, Herramientas | 2024-09-13 |
| Trabajar con JSONs en VbScript | Desarrollo | 2024-04-29 |
| VbScript - Función para días hábiles | Desarrollo | 2024-04-29 |
| VbScript - Hacer include de códigos en Github | — | 2024-08-06 |
| Simular un Try/Catch en VbScript | Desarrollo | 2023-12-29 |

### Otros

| Artículo | Etiquetas | Fecha |
|----------|-----------|-------|
| Todos (índice interno) | — | 2025-12-26 |
| Habilitar el log de cambios para todos los campos | Desarrollo | 2023-12-29 |
| Encabezados de páginas custom al estilo de la aplicación | Desarrollo | 2023-12-29 |
| Caché de Controles | Desarrollo | 2023-12-29 |
| Habilitar la edición de código DCE para un form custom | Desarrollo | 2023-12-29 |
| Save a todos los documentos de un Folder | Desarrollo | 2023-12-29 |
| Configuración de favoritos en el primer logon | Desarrollo | 2023-12-29 |
| Calculo de días de licencia | Desarrollo | 2023-12-29 |
| Join de Searches | Desarrollo | 2023-12-29 |
| Ordenar Dom | Desarrollo | 2023-12-29 |
| Limpiar caché de forms | Desarrollo | 2023-12-29 |
| Registrar componentes WSC en Windows de 64 bits | Desarrollo | 2023-12-29 |
| Filtrar por [MisGrupos] en las vistas | Desarrollo | 2023-12-29 |
| Modificación masiva de documentos a través de Doors Import | Doors | 2023-08-24 |
| Nuevos campos Keywords3 | Desarrollo | 2023-08-08 |
| htmlEncode para JavaScript | Desarrollo | 2023-08-08 |
| Probar el envío de correos desde el servidor | Desarrollo | 2023-08-08 |
| Imprimir sin URLs | Desarrollo | 2023-08-08 |
| Desactivar la ejecución de eventos | Desarrollo | 2023-08-08 |
| Providers OLEDB en servidores de 64 bits | Desarrollo | 2023-08-24 |
| Nuevas ventanas modales en Doors 7 | Doors | 2023-08-24 |
| DER Gestar Doors 5.xx | Doors | 2023-08-24 |
| Extraer datos de Gestar | Doors | 2023-08-24 |
| Doors BPM Version 7.4.26.0 | Doors | 2023-08-24 |
| Doors BPM Version 7.4.0.4 | — | 2023-08-24 |
| Cambios en el esquema de versionado | Doors | 2023-08-24 |
| Personalizar Inicio de sesión para Gestar | Doors | 2023-08-22 |
| showModalDialog deprecada en Chrome v37+ | Errores | 2023-08-24 |
| Error en árbol de carpetas - Actualización Chrome | Errores | 2023-08-08 |
| Error visualización menú de documentos en Safari 14 | Errores | 2023-11-21 |
| Editor de código DCE cambia a mayúsculas palabras JS | Errores | 2023-12-29 |
| generic3.asp no llama a callBackFunction | Errores | 2023-12-29 |
| generic y generic3 - Deshabilitar los botones Guardar | Desarrollo | 2023-12-29 |
| Herramienta de conversión de JSON a XML y viceversa | Herramientas | 2023-08-24 |
| Leer datos con REST (dup) | Desarrollo | 2023-08-08 |
| Actualizar página de cambio de contraseña | — | 2023-08-22 |
| Doors BPM versiones varias (7.1-7.4) | Doors | 2023-08-22 |

---

**Nota:** Los artículos se bajan a `fluye/docs/kb/` a medida que se necesitan. Para descargar uno, usar `mcp__notionApi__API-get-block-children` con el `page_id` del artículo.

Ing Jorge Pagano - Cloudy CRM
