# Knowledge Base - Índice

Mapa completo de documentación técnica del ecosistema Fluye/Cloudy.

**Última actualización:** 2026-02-11

---

## 📋 Estructura General

```
/Desarrollo/
├── fluye-core/        # Motor BPM privado (próxima generación)
├── fluye-lib/         # SDKs públicos (LGPL v3)
├── fluye/             # Browser SDK
├── DoorsBPM/          # Plataforma BPM legacy (.NET + ASP)
├── Events.v8/         # Servidor de eventos (Node.js)
├── Global/            # Biblioteca modular legacy
├── Node/              # Ambiente para scripts DoorsAPI2
└── [otros repos]/
```

---

## 🎯 Core - Documentación Principal

### CLAUDE.md (Instrucciones para IA)

| Archivo | Descripción |
|---------|-------------|
| `/Desarrollo/CLAUDE.md` | **Root** - Credenciales, patrones universales, estructura de repos |
| `fluye-core/CLAUDE.md` | Motor BPM privado, decisiones técnicas |
| `fluye-lib/CLAUDE.md` | SDKs públicos, módulos cliente, quick starts |
| `DoorsBPM/CLAUDE.md` | Arquitectura legacy, sync events, formularios |
| `Events.v8/CLAUDE.md` | Servidor de eventos Node.js |
| `Events.v8/server/restful/apiCom/CLAUDE.md` | API RESTful |
| `Global/CLAUDE.md` | Biblioteca modular legacy |

### Controles y Formularios

| Archivo | Descripción |
|---------|-------------|
| `/Desarrollo/CONTROLS.md` | **Sistema de controles** - Database-driven UI forms |
| `DoorsBPM/GENERIC3.md` | Formularios ASP + Bootstrap 3 (legacy) |
| `Global/client/generic6.md` | Formularios Bootstrap 5 / Framework7 |
| `Global/client/controls6.md` | API de controles generic6 |
| `fluye-lib/client/liveforms7/README.md` | Formularios dinámicos v7 (web/mobile) |
| `fluye-lib/client/liveforms7/controls7.md` | API de controles v7 |

---

## 🏢 DoorsBPM - Plataforma Legacy

### Arquitectura y Core

| Archivo | Descripción |
|---------|-------------|
| `DoorsBPM/README.md` | Overview de la plataforma |
| `DoorsBPM/CLAUDE.md` | Arquitectura completa, tech stack |
| `DoorsBPM/ACL.md` | Control de acceso y seguridad |
| `DoorsBPM/CONNECTIONS.md` | Gestión de conexiones |
| `DoorsBPM/VIEWS.md` | Sistema de vistas |

### Eventos y Procesamiento

| Archivo | Descripción |
|---------|-------------|
| `DoorsBPM/SYNCEVENTS.md` | **12 eventos sincrónicos** - BeforeSave, AfterSave, Open, etc |
| `DoorsBPM/ASYNCEVENTS.md` | Eventos background - Timer, OnSave, OnDelete |
| `fluye/docs/SSE.md` | **Server-Sent Events** - Tiempo real .NET → Events.v8 → Browser |

### Logs y Troubleshooting

| Archivo | Descripción |
|---------|-------------|
| `DoorsBPM/LOGS.md` | **Sistema de logs** - erYYMMDD.log, dpYYMMDD.log, acYYMMDD.log |
| `DoorsBPM/SYS_DOC_LOG.md` | **Audit log y recovery** - Data recovery scripts |
| `DoorsBPM/SYS_DML_LOG.md` | DML audit log |

---

## 🚀 Fluye - Next Generation

### fluye-core (Motor BPM Privado)

| Archivo | Descripción |
|---------|-------------|
| `fluye-core/README.md` | Overview del motor |
| `fluye-core/CLAUDE.md` | Arquitectura y decisiones técnicas |

#### Design Docs

| Archivo | Descripción |
|---------|-------------|
| `fluye-core/design/CORE.md` | Arquitectura del core |
| `fluye-core/design/EVENTS.md` | Sistema de eventos |
| `fluye-core/design/SECURITY.md` | Seguridad y autenticación |
| `fluye-core/design/SECRETS.md` | Gestión de secretos |
| `fluye-core/design/DNS.md` | DNS y dominios |
| `fluye-core/design/VERCEL.md` | Deploy en Vercel |
| `fluye-core/design/MARKETING.md` | Marketing y branding |
| `fluye-core/design/ROADMAP.md` | Roadmap de desarrollo |

#### Módulos

| Archivo | Descripción |
|---------|-------------|
| `fluye-core/app/README.md` | Aplicación web |
| `fluye-core/app/api/README.md` | API REST |
| `fluye-core/aws/README.md` | Infraestructura AWS |
| `fluye-core/aws/terraform/README.md` | Terraform configs |
| `fluye-core/cdn/README.md` | CDN configuration |
| `fluye-core/db/README.md` | Database layer |
| `fluye-core/cloudflare/README.md` | Cloudflare setup |
| `fluye-core/brand/README.md` | Branding assets |

#### IAM (Identity & Access Management)

| Archivo | Descripción |
|---------|-------------|
| `fluye-core/iam/README.md` | Sistema de IAM |
| `fluye-core/iam/PLAN.md` | Plan de implementación |

#### Ops (Herramientas Operativas)

| Archivo | Descripción |
|---------|-------------|
| `fluye-core/ops/search/README.md` | Code Search - buscar texto en todo el código de una instancia |
| `fluye-core/ops/installers/README.md` | CI Installers - deploy de config entre instancias |
| `fluye-core/ops/syncevents/README.md` | Export de sync events con #includes resueltos |

#### Legacy Migration

| Archivo | Descripción |
|---------|-------------|
| `fluye-core/legacy/apiVb6/README.md` | Legacy VB6 API |

### fluye-lib (SDKs Públicos)

| Archivo | Descripción |
|---------|-------------|
| `fluye-lib/CLAUDE.md` | **Estructura de módulos**, quick starts, patrones |

#### AI - Inteligencia Artificial

| Archivo | Descripción |
|---------|-------------|
| `fluye-lib/ai/README.md` | **Hub de IA** - Claude API, tracking, Wiz |

##### Wiz (Asistente Contextual)

| Archivo | Descripción |
|---------|-------------|
| `fluye-lib/ai/wiz/wiz.md` | **Wiz** - Prompt raíz |
| `fluye-lib/ai/wiz/folder.md` | Prompt carpeta |

#### Client Modules

| Archivo | Descripción |
|---------|-------------|
| `fluye-lib/client/insights/README.md` | **Dashboards** - Grid responsive, cards |
| `fluye-lib/client/pivotable/pivotable.md` | **Grillas con pivot** - DevExtreme |
| `fluye-lib/client/pivotable/REFACTOR_FLUYE.md` | Refactorización |

#### CRM

| Archivo | Descripción |
|---------|-------------|
| `fluye-lib/crm/README.md` | **Template CRM** - Módulos reutilizables (leads, clientes, etc) |
| `fluye-lib/crm/croupier/README.md` | **Distribución de leads** - Weighted round-robin, pools |
| `fluye-lib/crm/desarrollos/README.md` | **Módulo inmobiliario** - Planos KML/GeoJSON/SVG |

#### Connectors

| Archivo | Descripción |
|---------|-------------|
| `fluye-lib/wappcnn/README.md` | **WhatsApp connector** - Twilio/WhatsApp Business API |
| `fluye-lib/wappcnn/CLAUDE_AI_INTEGRATION.md` | Integración con Claude AI |
| `fluye-lib/wappcnn/TWILIO-ALTERNATIVES.md` | Alternativas a Twilio |
| `fluye-lib/wappcnn/client/broadcast.md` | Broadcast masivo |
| `fluye-lib/wappcnn/client/web/masssend.md` | Envío masivo web |

### fluye (Browser SDK)

| Archivo | Descripción |
|---------|-------------|
| `fluye/README.md` | SDK para browser |
| `fluye/browser.md` | API browser |
| `fluye/client.md` | Client SDK |

### fluye-web (Landing/Marketing)

| Archivo | Descripción |
|---------|-------------|
| `fluye-web/README.md` | Website público |
| `fluye-web/src/pages/index.md` | Landing page |

---

## 🌐 Events.v8 - Servidor de Eventos

| Archivo | Descripción |
|---------|-------------|
| `Events.v8/readme.md` | Overview del servidor |
| `Events.v8/CLAUDE.md` | Arquitectura y deployment |
| `Events.v8/server/restful/apiCom/CLAUDE.md` | API RESTful |
| `Events.v8/ecs-deploy/README.md` | Deployment en ECS |

### Tickets / Bug Reports

| Archivo | Descripción |
|---------|-------------|
| `Events.v8/tickets/251010 - Memory issues/README.md` | Memory issues |
| `Events.v8/tickets/251110 - SQL Injection/README.md` | SQL Injection fix |
| `Events.v8/tickets/251110 - SQL Injection/IMPLEMENTATION.md` | Implementación |
| `Events.v8/tickets/260127 - Crash/README.md` | Crash investigation |
| `Events.v8/tickets/260127 - Crash/MONITORING.md` | Monitoring setup |

---

## 📚 Global - Biblioteca Legacy

| Archivo | Descripción |
|---------|-------------|
| `Global/CLAUDE.md` | Arquitectura de la biblioteca |
| `Global/TODO.md` | Tareas pendientes |

### AI (Legacy - migrar a fluye-lib)

| Archivo | Descripción |
|---------|-------------|
| `Global/ai/AI.md` | Sistema de IA legacy |
| `Global/ai/ARCHITECTURE_OVERVIEW.md` | Overview arquitectura |
| `Global/ai/docs/README.md` | Módulo docs |
| `Global/ai/mcp/README.md` | MCP Server |
| `Global/ai/mcp/ARCHITECTURE.md` | Arquitectura MCP |
| `Global/ai/searchwiz/SEARCHWIZ.md` | SearchWiz legacy |
| `Global/ai/searchwiz/USER_GUIDE.md` | Guía usuario |
| `Global/ai/searchwiz/prompts.md` | Prompts |
| `Global/ai/searchwiz/base-knowledge.md` | Base conocimiento |

### Client Modules (Legacy)

| Archivo | Descripción |
|---------|-------------|
| `Global/client/generic6.md` | Formularios Bootstrap 5 / Framework7 |
| `Global/client/controls6.md` | API de controles |
| `Global/client/pivotable.md` | Grillas legacy |
| `Global/client/insights/README.md` | Dashboards legacy |
| `Global/client/insights/proto/Naum/README.md` | Prototipo Naum |
| `Global/client/desarrollos/README.md` | Módulo desarrollos |

### Connectors (Legacy)

| Archivo | Descripción |
|---------|-------------|
| `Global/wappcnn/README.md` | WhatsApp connector legacy |
| `Global/wappcnn/CLAUDE_AI_INTEGRATION.md` | Claude AI integration |
| `Global/wappcnn/TWILIO-ALTERNATIVES.md` | Alternativas Twilio |
| `Global/wappcnn/client/broadcast.md` | Broadcast |
| `Global/wappcnn/client/web/masssend.md` | Mass send |
| `Global/fbcnn/README.md` | Facebook connector |

### Billing & Outbox

| Archivo | Descripción |
|---------|-------------|
| `Global/billing/README.md` | Sistema de facturación |
| `Global/billing/USER_GUIDE.md` | Guía de usuario |
| `Global/dispenser/README.md` | Dispenser module |
| `Global/outbox/readme.md` | Outbox pattern |

### Test & Analysis

| Archivo | Descripción |
|---------|-------------|
| `Global/test/claude/columnasLentas_GrupoEdisur.md` | Análisis columnas lentas |
| `Global/test/claude/tiemposBaseCloudy.md` | Análisis tiempos |

---

## 🛠️ Node - Scripts Environment

| Archivo | Descripción |
|---------|-------------|
| `Node/README.md` | **Ambiente Node.js** - DoorsAPI2 scripts |
| `Node/README_REVERSION_OPP_979374.md` | Data recovery case study |

---

## 🔌 MCP & Integrations

### Google Docs MCP

| Archivo | Descripción |
|---------|-------------|
| `gdocs-mcp/README.md` | MCP server para Google Docs |
| `gdocs-mcp/SAMPLE_TASKS.md` | Tareas de ejemplo |
| `gdocs-mcp/claude.md` | Integración con Claude |
| `gdocs-mcp/vscode.md` | Integración VSCode |
| `gdocs-mcp/pages/pages.md` | API Pages |

---

## 🏗️ Otros Repos

### CRM Desarrollista

| Archivo | Descripción |
|---------|-------------|
| `CRM-Desarrollista/README.md` | CRM para desarrollistas |
| `CRM-Desarrollista/crm_react/README.md` | Versión React |

### Otros

| Archivo | Descripción |
|---------|-------------|
| `lazapada/README.md` | Proyecto Lazapada |
| `Doors-dapihttp/README.md` | Doors HTTP API |
| `Doors-rDCE/README.md` | Doors rDCE |

---

## 📱 Mobile Apps (Legacy)

| Archivo | Descripción |
|---------|-------------|
| `Cloudy-CRM-App/README.md` | App móvil Cordova (legacy) |

---

## 🔍 Cómo Usar Este Índice

### Para Claude Code (trabajo diario)

1. Buscar contexto: `grep -r "keyword" /Users/Jorge/Desarrollo/*/CLAUDE.md`
2. Leer archivo específico: `Read(path)`
3. Actualizar este índice cuando agregues nuevos MDs relevantes

### Para Wiz (asistente en Fluye)

```javascript
// wiz.mjs carga este índice
const kbIndex = await loadMd('fluye/docs/INDEX.md');

// Busca en el índice qué MD cargar según la pregunta del usuario
// Ejemplo: usuario pregunta por "sync events" → carga DoorsBPM/SYNCEVENTS.md
```

### Para Usuarios

- **Pregunta sobre eventos:** Ver `DoorsBPM/SYNCEVENTS.md` o `DoorsBPM/ASYNCEVENTS.md`
- **Problema con logs:** Ver `DoorsBPM/LOGS.md`
- **Recovery de datos:** Ver `DoorsBPM/SYS_DOC_LOG.md` + `Node/README_REVERSION_OPP_979374.md`
- **Formularios:** Ver `CONTROLS.md` + `DoorsBPM/GENERIC3.md` o `fluye-lib/client/liveforms7/`
- **IA y búsquedas:** Ver `fluye-lib/ai/README.md` + `fluye-lib/ai/searchwiz/`

---

## 📝 Notas de Mantenimiento

### Actualizar Este Índice

**Cuándo:**
- Agregas nuevo MD relevante al ecosistema
- Descubrís que un MD es útil para wiz/claude
- Reorganizás estructura de repos

**Cómo:**
```bash
# Re-escanear /Desarrollo
find /Users/Jorge/Desarrollo -name "*.md" -type f -not -path "*/node_modules/*" -not -path "*/.git/*" | sort

# Agregar a sección correspondiente
# Anotar en "Notas de uso" si fue útil
```

### Estado de Migración

- ✅ **fluye-core**: Activo - Motor nuevo
- ✅ **fluye-lib**: Activo - SDKs públicos
- ✅ **fluye**: Activo - Browser SDK
- 🔄 **DoorsBPM**: Legacy - Mantenimiento
- 🔄 **Global**: Legacy - Migrar a fluye-lib
- ⚠️ **Cloudy-CRM-App**: Deprecado - No usar

---

**Ing Jorge Pagano - Cloudy CRM**
**Versión:** 1.1 (2026-02-11)
