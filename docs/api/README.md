# API — Fluye Compute

Documentación de la API pública de **Fluye Compute** — el motor cloud sobre Vercel + Postgres Neon que reemplaza gradualmente el backend `.NET` de Doors.

**Base URL:** `https://fluye.ar/api/`

---

## Índice

| Área | Doc |
|---|---|
| **Auth** — 4 sources aceptadas, cómo obtener credenciales, ejemplos curl | [`AUTH.md`](AUTH.md) |
| **Ejecución Dinámica** — `ghx`, `ghxf`, `v8/ghx`, `v8/ghxf` | [`EXEC.md`](EXEC.md) |
| **Endpoints v9** — inventario + contratos por endpoint | secciones abajo |
| **Convenciones** — envelope, logging, errores | secciones abajo |

---

## Envelope estándar (endpoints v9)

```json
// Éxito
{ "data": { ... }, "error": null }

// Error controlado
{ "data": null, "error": { "message": "descripción humana" } }
```

HTTP status refleja la naturaleza real:

| Status | Significado |
|---|---|
| `200` | OK con `data` populado y `error: null` |
| `400` | Request malformado (parámetros faltantes, formato inválido) |
| `401` | Auth ausente o inválida |
| `403` | Auth OK pero sin permisos suficientes |
| `404` | Recurso pedido no existe |
| `405` | Método HTTP no soportado |
| `500` | Error del server (incluye traza en logs, no en response) |

Endpoints legacy v8 y `ghx*` tienen formatos propios — ver doc específica.

---

## Versionado

- **v8** — proxies al stack Doors clásico (`/api/v8/*`). Congelado, solo mantenimiento.
- **v9** — APIs Fluye nativas (`/api/v9/*`). Superficie activa.
- **Sin prefijo** — endpoints globales (`/api/console`, `/api/health`, `/api/ghx*`).

Bump de major (`v10`) solo ante breaking change de contrato en un grupo — no por refactor interno.

---

## Endpoints — Portal Fluye

Auth default: `portal-jwt` (browser autenticado con Cognito) o `portal-apikey` (server-to-server). Ver [`AUTH.md`](AUTH.md).

### Instancias

| Método | Path | Auth extra | Descripción |
|---|---|---|---|
| GET | `/api/v9/instances` | — | Lista instancias visibles al usuario |
| GET | `/api/v9/instance/info?guid=<uuid>` | `portal-apikey` only | DB size + S3 bucket (billing worker) |
| GET | `/api/v9/instance/usage?guid=<uuid>&from=YYYY-MM-DD&to=YYYY-MM-DD` | `portal-apikey` only | Gasto agregado por vendor/feature/login |
| GET | `/api/v9/instance/config` | `doors-authtoken` \| `doors-apikey` | Config runtime de la instancia |

**Response `/instance/info`:**
```json
{
  "data": {
    "name": "ORMAY",
    "guid": "4D2B4BDD059D4ED29BB839951E1BF735",
    "db":   { "size": 12.34 },
    "s3":   { "provider": "s3", "bucket": "att-ormay", "size": null }
  }, "error": null
}
```

**Response `/instance/usage`:**
```json
{
  "data": {
    "guid": "...", "name": "ORMAY", "from": "2026-07-01", "to": "2026-07-31",
    "total_cost_usd": 12.34,
    "by_vendor":  [{ "vendor": "anthropic-claude", "cost_usd": 8.20, "calls": 42 }],
    "by_feature": [{ "feature": "wiz-chat",        "cost_usd": 7.00, "calls": 30 }],
    "by_login":   [{ "login":   "jperez",          "cost_usd": 9.10, "calls": 55 }]
  }, "error": null
}
```

### Session / User

| Método | Path | Descripción |
|---|---|---|
| POST | `/api/v9/session/openregdoors` | Abre sesión Doors registrada para portal-jwt |
| GET/PUT | `/api/v9/session/data` | JSONB `sessions.data` por `cognito_sub` |
| GET/PUT | `/api/v9/user/data` | JSONB `users.data` por user id |

---

## Endpoints — Doors runtime

Auth: `doors-authtoken` (sesión desde `openDoors()`) o `doors-apikey` (scripts server-side). Ver [`AUTH.md`](AUTH.md).

### Folders

| Método | Path | Descripción |
|---|---|---|
| GET | `/api/v9/folders/children?fldId=<int>` | Hijos de una folder |
| GET | `/api/v9/folders/documents?fldId=<int>&...` | Búsqueda de docs con ACL |
| GET | `/api/v9/folders/grouped?fldId=<int>&...` | Búsqueda agrupada |
| GET | `/api/v9/folders/fields?fldId=<int>` | Metadata de campos del form asociado |
| GET | `/api/v9/folders/relfields?fldId=<int>&...` | Campos vía relación |

### Documents

| Método | Path | Descripción |
|---|---|---|
| GET | `/api/v9/documents/relfields?docId=<int>&...` | Campos relacionados de un doc |

### AI Calls (vía adapter Anthropic hoy)

| Método | Path | Descripción |
|---|---|---|
| POST | `/api/v9/ai/call` | Llamada a modelo (proxy multi-provider, cobra budget, registra en `vendor_usage`) |
| POST | `/api/v9/ai/request` | Ejecuta prompt-template AI |
| GET | `/api/v9/ai/models` | Lista modelos disponibles |
| GET | `/api/v9/ai/budget` | Consulta budget de la instancia |
| GET | `/api/v9/ai/cdn/find` | Busca archivos en CDN |
| GET | `/api/v9/ai/cdn/get` | Descarga archivo del CDN |

---

## Endpoints administrativos (bots dedicados)

Auth: **X-Pricing-Key** (fija). NO usar `authenticate()` — bot único con clave hardcoded en Vercel env.

| Método | Path | Descripción |
|---|---|---|
| GET/PUT | `/api/v9/vendors/pricing` | Gestión de precios de vendors (LLM, TTS, STT, WhatsApp…) |
| GET/PUT | `/api/v9/ai/pricing` | Shim del anterior. Se elimina cuando todos migren. |

**Body PUT `/vendors/pricing`:**
```json
[
  { "model": "claude-haiku-4-5", "vendor": "anthropic-claude", "input_price": 1.0, "output_price": 5.0 },
  { "model": "gemini-2.5-flash", "vendor": "google-gemini",    "input_price": 0.3, "output_price": 2.5 },
  { "model": "gpt-4o",           "vendor": "openai-gpt",       "input_price": 2.5, "output_price": 10.0 },
  { "model": "modelo-viejo",     "vendor": "anthropic-claude", "active": false }
]
```

`active: false` borra el modelo del catálogo (semántica "si está, está activo"). Nuevos modelos requieren `input_price + output_price`. Ver [`fluye-lib/tickets/260519 - AI Pricing Bot`](../../tickets/260519%20-%20AI%20Pricing%20Bot/) para el charter del bot.

---

## Endpoints globales (sin versión)

| Método | Path | Auth | Descripción |
|---|---|---|---|
| POST | `/api/console` | `x-console-token` \| `doors-authtoken` \| `doors-apikey` | Escribe log en `node_console` (Neon) |
| GET | `/api/health` | — | Healthcheck (DB ping) |
| ANY | `/api/ghx/{owner}/{repo}[@{ref}]/{path}` | — | Ejecuta código GH sandboxeado. Ver [`EXEC.md`](EXEC.md) |
| ANY | `/api/ghxf/{repo}[@{ref}]/{path}` | — | Alias `ghx` para org `fluye-ar` |

---

## Endpoints legacy v8 (deprecados, no usar en código nuevo)

Proxies al stack Doors clásico. Congelado — solo mantenimiento.

| Método | Path | Descripción |
|---|---|---|
| ANY | `/api/v8/restful` | Proxy hacia RESTful Doors |
| POST | `/api/v8/exec` | Ejecuta código server-side legacy |
| ANY | `/api/v8/ghx/*`, `/api/v8/ghxf/*` | Alias v8 de `ghx`/`ghxf` |

---

## Convenciones internas

### Logging

Cada endpoint escribe a `fluye_master.node_console` en Neon con tags. Query típica:

```sql
SELECT time, method, tag1, tag2, tag3, LEFT(data::text, 500) AS data
FROM fluye_master.node_console
WHERE tag1 = 'v9/instance/info'
ORDER BY id DESC LIMIT 50;
```

### Vendor metering

Todas las llamadas a servicios externos medidos (LLM, TTS, STT, WhatsApp, etc.) pasan por `vendorCall` internamente y se registran en `fluye_master.vendor_usage` con snapshot completo de precio en `details.units`. Reporting via `/api/v9/instance/usage`.

Los precios viven en `fluye_master.vendors.pricing` (JSONB nativo por vendor) — un bot los sincroniza semanalmente contra las páginas oficiales de cada provider.

---

## Charter interno

El agente owner del API (decisiones, deuda técnica, cómo se trabaja) vive en el charter privado [`fluye-core/agents/API.md`](https://github.com/fluye-ar/fluye-core/blob/main/agents/API.md) (solo accesible al equipo). Esta doc pública es la **spec real** para consumidores.

**Regla dura del owner:** ningún endpoint se considera terminado hasta que su contrato esté acá.

---

**Jorge Pagano - Fluye Labs**
