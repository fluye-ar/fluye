# API — Fluye Compute

Documentación de la API pública de **Fluye Compute** — el motor cloud sobre Vercel + Postgres Neon que reemplaza gradualmente el backend `.NET` de Doors.

**Base URL:** `https://fluye.ar/api/`

**Estado de la doc:** en construcción. Este archivo va creciendo por área a medida que se documenta.

---

## Índice

| Área | Doc | Estado |
|---|---|---|
| **Ejecución Dinámica** — `ghx`, `ghxf`, `v8/ghx`, `v8/ghxf` | [`EXEC.md`](EXEC.md) | ✅ |
| **Auth** — sources aceptadas (`portal-jwt`, `portal-apikey`, `doors-authtoken`, `doors-apikey`) | `AUTH.md` | ⏸️ pendiente |
| **Endpoints v9** — inventario + contratos | secciones abajo | ⏸️ pendiente |
| **Convenciones** — envelope `{data,error}`, logging `dbConsole`, error handling, versionado | secciones abajo | ⏸️ pendiente |

---

## Versionado

- **v8** — proxies al stack Doors clásico (`/api/v8/*`). Congelado, solo mantenimiento.
- **v9** — APIs Fluye nativas (`/api/v9/*`). Superficie activa.
- **sin prefijo** — endpoints globales (ej. `/api/console`, `/api/health`, `/api/ghx*`).

Bump de major (`v10`, etc.) solo ante breaking change de contrato en un grupo — no por refactor interno.

---

## Envelope estándar (endpoints v9)

```json
{ "data": { ... }, "error": null }
```

```json
{ "data": null, "error": { "message": "..." } }
```

HTTP status refleja la naturaleza real (200 / 400 / 401 / 404 / 500). Endpoints legacy (v8, `ghx*`) tienen formatos propios — ver doc específica.

---

## Owner + charter interno

El owner del API vive en el charter privado [`fluye-core/agents/API.md`](https://github.com/fluye-ar/fluye-core/blob/main/agents/API.md) (solo accesible para el equipo). Ahí van las decisiones, deuda técnica y ownership. Esta doc pública es la **spec real** para consumidores.

---

Jorge Pagano - Fluye Labs
