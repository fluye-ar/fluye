# 260630 - sconsole: acceso a la consola de Fluye Compute desde el SDK

**Estado:** ✅ CERRADO — 2026-07-01 — `get sconsole()` en `doorsClient.mjs`, doc en `doorsClient.md`, smoke tests OK (AuthToken + ApiKey) contra ormay → filas en `node_console`
**Repos:** fluye (SDK) · fluye-core (endpoint ya pusheado)
**Origen:** necesidad de escribir en la consola de Fluye Compute desde browser (y scripts Node standalone) sin abrir `dSession.node.exec({code: 'console.log(...)'})` que es indirecto.

## Contexto

**Fluye Compute** (el runtime backend de Fluye que ejecuta `.mjs` server-side) tiene una **consola** persistente: tabla `node_console` en Neon PG, accesible desde el dashboard. Es el equivalente a los logs de Vercel/Lambda pero queryable, indexada por tags (`tag1/tag2/tag3`) y retenida por más tiempo.

Hoy hay dos formas de escribirla:

1. **Desde código que corre en Fluye Compute** (worker.js): `console.log/warn/error` está interceptado por `app/api/_lib/dbConsole.js`. Cualquier `.mjs` que corre en una function loguea automáticamente. ✓
2. **Desde browser / Node standalone**: no hay método directo. Se puede usar `dSession.node.exec({code: '...'})` pero es indirecto, pesado (carga el worker) y verboso.

Falta un método del SDK para que el cliente escriba en la consola de Fluye Compute **directamente** desde browser/scripts.

## API del lado del server (ya pusheado)

**Endpoint:** `POST https://fluye.ar/api/console`

**Auth (acepta cualquiera de los 3):**

| Header | Para |
|---|---|
| `x-console-token: <CONSOLE_TOKEN>` | Scripts externos / .NET (CONSOLE_TOKEN es env var del server) |
| `AuthToken: <session token>` | Browser logueado / instancia Doors |
| `ApiKey: <api key>` | Scripts con API key |

Si ninguno valida → `401`.

**Body:**
```json
{
    "method": "log",     // "log" | "warn" | "error" — opcional, default "log"
    "data": "msg",       // requerido — string o object (se serializa)
    "tag1": "app",       // opcional
    "tag2": "page",      // opcional
    "tag3": "event"      // opcional
}
```

**Response:** `200 { ok: true }` | `400 { error: 'data is required' }` | `401 { error: '...' }` | `405 POST only`

**Tabla destino:** `node_console` en Neon PG (esquema `fluye_master`).

📖 **Implementación:** [`fluye-core/app/api/console.js`](../../../fluye-core/app/api/console.js) (commit `c09a389f` agregó el path AuthToken/ApiKey al path original `x-console-token`).

## Propuesta de API SDK (a revisar/decidir)

Naming sugerido: **`sconsole`** (s = server) — discutido con Jorge (descartados: `serverConsole`, `srvCons`, `sCons`, `sConsole`, `fConsole`).

```javascript
fdSession.sconsole.log(data, tags?)
fdSession.sconsole.warn(data, tags?)
fdSession.sconsole.error(data, tags?)
```

- `data`: lo que loguear (string, object).
- `tags`: opcional. `{ tag1, tag2, tag3 }` (1:1 con el endpoint).
- Devuelve la `Promise` del fetch — caller puede `await` o no.

### Implementación esbozada (lazy getter, patrón existente en Session)

```javascript
// Private field (junto a #push, #node, etc.)
#sconsole;

get sconsole() {
    if (!this.#sconsole) {
        let me = this;
        let send = (method, data, tags = {}) => {
            let headers = { 'Content-Type': 'application/json' };
            if (me.authToken) headers['AuthToken'] = me.authToken;
            else if (me.apiKey) headers['ApiKey'] = me.apiKey;
            return fetch('https://fluye.ar/api/console', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    method, data,
                    tag1: tags.tag1, tag2: tags.tag2, tag3: tags.tag3,
                }),
            }).catch(() => {});  // fire-and-forget
        };
        this.#sconsole = {
            log:   (data, tags) => send('log',   data, tags),
            warn:  (data, tags) => send('warn',  data, tags),
            error: (data, tags) => send('error', data, tags),
        };
    }
    return this.#sconsole;
}
```

### Decisiones abiertas (para el equipo SDK)

1. **URL hardcoded `https://fluye.ar/api/console`** vs configurable. Hoy `sse.fluye.ar` se hardcodea (línea 4899 de `doorsClient.mjs`), así que hay precedente. Pero si mañana hay otro host (dev/staging/preview) puede molestar.
2. **Error handling**: `.catch(() => {})` silencioso (fire-and-forget) vs propagar al caller. Trade-off: silencioso evita unhandled rejections pero pierde visibilidad si el endpoint está roto.
3. **Formato tags**: `{tag1, tag2, tag3}` (1:1 con endpoint) vs `{consoleTag1, consoleTag2, consoleTag3}` (lo que usa `console.log` interceptado en server). Posible: aceptar ambos.
4. **`method` como argumento separado** vs el patrón actual (3 métodos: log/warn/error). El endpoint acepta `method` en el body, el SDK puede simplificarlo.

## Sugerencia opcional: multi-provider (nice-to-have, evaluación del equipo SDK)

`sconsole` **ES la consola de Fluye Compute** — eso es lo que define el ticket. Pero si el SDK quiere exponer un patrón consistente para que el cliente loguee a OTROS destinos (Sentry, Datadog, console nativo del browser, etc.) bajo la misma firma, puede haber lugar para algo como:

```javascript
// Default y caso principal: Fluye Compute console (este ticket)
fdSession.sconsole.log('msg', { tag1: 'app' });

// Hipotético, si se decide soportar otros backends:
fdSession.console.add('sentry', sentryAdapter);
fdSession.console.log('msg', { ... });   // dispara a TODOS los registrados (sconsole + sentry)
```

**Decisión del equipo SDK.** Del lado del server, el ticket cubre el endpoint actual (`/api/console` → `node_console` PG). Otros providers serían configuración del SDK (URLs, keys, adapters) — el server no necesita cambios.

## Resultado (2026-07-01)

**API final** — variádica idéntica a `console.log`, además llama a la consola nativa:

```javascript
fdSession.sconsole.log('caso creado', doc, { consoleTag1: 'ventas' });
fdSession.sconsole.warn('reintentando', intento);
fdSession.sconsole.error('sync fallo', err, { consoleTag1: 'sync' });
fdSession.sconsole.disabled = true;   // kill-switch (corta el envío, no la nativa)
```

- **Firma variádica** (`...args`): el objeto de tags (`consoleTagN`) se detecta en cualquier posición y se separa; el resto son datos. Convención única `consoleTagN` (no `tagN`).
- **Consola nativa** primero (inmediata, sin el obj de tags), luego el envío al server.
- **Serialización NBSP** idéntica a `dbConsole` (Errors → `serializeError` full, objetos → JSON con guard circular). Se espera `utilsPromise` + `instance`/`currentUser` sin bloquear al caller (try/catch).
- **`consoleTag2`/`consoleTag3`** autocompletan instancia/usuario de la sesión si no se pasan.
- **Fire-and-forget** (`.catch(()=>{})`), awaitable (resuelve la Response).
- **Multi-provider descartado** — YAGNI.

**Decisiones tomadas** (las 4 abiertas): URL hardcoded `fluye.ar/api/console`; fire-and-forget con nativa como respaldo; tags `consoleTagN`; 3 métodos `log/warn/error`.

**Implementación:** `get sconsole()` en `doorsClient.mjs` (getter alfabético, entre `s3Bucket` y `serverUrl`).

**Checklist:**
- [x] `get sconsole()` en `doorsClient.mjs`
- [x] Doc en `fluye/doorsClient.md` (sección propia + Object Model + tabla Session)
- [x] Smoke test Node standalone (AuthToken, tras `logon()`) → HTTP 200, fila en `node_console`, NBSP OK, `serializeError` full, default tags ORMAY/ADMIN
- [x] Smoke test path ApiKey (sin logon, `utils.decrypt` del ApiKey) → HTTP 200, tag3=SYSAGENTS (identidad de la apiKey)
- [ ] Smoke test browser puro (mismo `Session`, mismo path — no re-testeado en browser)

---

Jorge Pagano - Fluye Labs
