# API — Ejecución Dinámica (`ghx`, `ghxf`)

Endpoints que **ejecutan código versionado en GitHub sin re-deploy**. Reemplazan `ghx` / `ghxcv` del stack Events.v8 (Node en EC2) por handlers Vercel Fluid Compute.

**Casos de uso:** webhooks de terceros (Twilio, MP), eventos async, tareas server-side arbitrarias, hot patches sin deploy.

---

## Variantes

| Endpoint | Path esperado | Owner por default |
|---|---|---|
| `/api/ghx/{owner}/{repo}[@{ref}]/{path}` | `owner/repo[@ref]/dir/file.js` | del path |
| `/api/ghxf/{repo}[@{ref}]/{path}` | `repo[@ref]/dir/file.js` | `fluye-ar` (hardcoded) |
| `/api/v8/ghx/*` | idem `ghx` | del path |
| `/api/v8/ghxf/*` | idem `ghxf` | `fluye-ar` |

`v8/*` son alias legacy — mismo handler, mantenidos por compatibilidad con código que usa el prefijo `/api/v8/`. Preferir `/api/ghx` y `/api/ghxf` en código nuevo.

**Nomenclatura:** `gh` = GitHub fetch, `ghx` = GitHub eXec, `f` = owner `fluye-ar` abreviado. En v8 Events.v8: `ghxcv` (`cv` = `CloudyVisionArg`).

---

## Formato URL

**ghxf** (owner default `fluye-ar`):

```
https://fluye.ar/api/ghxf/wappcnn/server/hook.js
                          └─repo─┘└─────path─────┘

Con ref:
https://fluye.ar/api/ghxf/wappcnn@dev/server/hook.js
                          └repo┘@└ref┘└───path───┘
```

**ghx** (owner explícito):

```
https://fluye.ar/api/ghx/CloudyVisionArg/global/wappcnn/server/hook.js
                         └────owner────┘└repo─┘└─────path─────┘

Con ref (branch/tag/commit SHA):
https://fluye.ar/api/ghx/CloudyVisionArg/global@main/wappcnn/server/hook.js
```

**Ref:**
- Branch: `@main`, `@dev`, `@feature-xxx`
- Tag: `@v1.2.3`
- Commit corto: `@a1b2c3d`
- Commit largo (recomendado para pinning en prod): `@a1b2c3d4e5f6...`
- Sin ref → `main`.

---

## Query params

| Param | Valor | Efecto |
|---|---|---|
| `?_fresh=1` | `1` \| `true` | Bypass del cache CDN. Fuerza a R2 a re-pullear de GitHub. Usar tras un push cuando querés que el próximo request traiga el código nuevo. |
| `?_debug=1` | `1` | Corre el script **sin VM sandbox** — permite breakpoints en Chrome DevTools (`chrome://inspect` sobre el proceso). |
| `?msg={json}` | JSON encodeado | Message auth+contexto en GET (equivalente al body de POST). Ver [Auth + Message](#auth--message) abajo. |

---

## POST body (opcional)

Aplica a POST. Body opcional — sin body, el endpoint corre igual el script.

```json
{
  "serverUrl":  "https://ormay.cloudycrm.net/restful",
  "authToken":  "<sesion Doors>",
  "apiKey":     "<api key Doors>",
  "doc":        { "DOC_ID": 12345, ... },
  "folder":     123,
  "payload":    { "cualquier": "cosa" }
}
```

Cualquier body con `serverUrl` + (`authToken` o `apiKey`) inicializa `fdSession` / `dSession` autenticadas. Sin esos campos, las sessions vienen unconnected — el script tiene que hacer login manual o dejarlas así (webhooks públicos, health checks).

`doc`/`folder` son opcionales — usados por scripts que corren en el contexto de un documento (sync events, botones).

---

## Resolución del script

```
1. parseCode(pathSegments, defaultOwner)
   → { owner, repo, ref?, path }

2. gitFetch({owner, repo, ref, path})
   → GET https://cdn.fluye.ar/gh/{owner}/{repo}[@{ref}]/{path}
      + header If-Modified-Since si hay copia en /tmp/mod-cache
   → 200: content nuevo | 304: usar cached

3. CDN R2 (edge cache) sirve
   - Cache hit  → response inmediato
   - Cache miss → R2 pulls from GitHub (raw.githubusercontent.com)
   - Con ?_fresh=1 → force pull

4. Cache local /tmp/mod-cache/
   - File name: {timestamp}@{owner}@{repo}[@{ref}]@{path}
   - Escrito por gitImport() para poder hacer import() dinámico ES6
   - Persiste con Fluid Compute (mismo /tmp entre requests del mismo worker)
```

Runtime: Vercel Fluid Compute (Node.js 24, `--experimental-vm-modules`). Timezone del proceso: `America/Argentina/Buenos_Aires` (seteado en `worker.js:8`).

---

## Contexto del script

El script se evalúa dentro de una VM sandbox (`evalCodeVm`) con estos globales disponibles:

### Objetos principales

| Nombre | Tipo | Descripción |
|---|---|---|
| `ctx` | Object | Contenedor del contexto completo (ver estructura abajo) |
| `console` | Object | Override de `dbConsole` — logs van a `fluye_master.node_console` (PG Neon) con `tag1 = "{repo}/{path}"` |
| `fluye` | Object | `globalThis.fluye` — `{ gitFetch, gitImport, cache, asyncStore, doorsClient, engine: 'fluyeV8' }` |
| `fdSession` | Session | Cliente Fluye Doors — autenticado si el message trajo `serverUrl` + auth |
| `dSession` | Session | Idem, backward-compat con Events.v8. `import()` defaultea a owner `CloudyVisionArg` |
| `mlib` | Object | `{ gitCdn: gitFetch, gitImport, userCache(key, value, ttl) }` |
| `mainlib` | Object | Alias de `mlib` (compat con `Events.v8/mainlib.mjs`) |
| `res` | Object | Response de Vercel + shims Express: `res.set()`, `res.type()`, `res.cookie()` |
| `doc` | Document | Presente si `message.doc` — instancia lista de `fluyeDoorsClient.Document` |
| `folder` | Folder | Presente si `message.folder` o si vino un `doc` (parent) |

### Estructura de `ctx`

```javascript
ctx = {
    // Sessions
    doorsapi2:         fluyeDoorsClient,     // referencia a la clase
    fluyeDoorsClient:  fluyeDoorsClient,     // idem
    dSession, fdSession,

    // Utils
    mlib, mainlib,     // ver arriba

    // Request / event actual
    message,           // el body/msg del request (o { events: [code] } si vino desnudo)
    req: message.request || { body, query, headers, method },
    res,
    code,              // evento actual: { owner, repo, ref?, path, fresh? }
    codeIndex,         // index (0) — soporte a múltiples eventos por request
    _consTags,         // tags para dbConsole: { consoleTag1: 'repo/path' }

    // Contexto Doors (si el message lo trajo)
    doc, folder,

    // Return value acumulable
    return             // lo que devuelva el script (después de execEvents)
}
```

### `mlib.userCache`

Wrapper del Vercel Runtime Cache — compat con `Events.v8/mainlib:userCache`.

```javascript
// GET
let val = await mlib.userCache('mi-key');

// SET
await mlib.userCache('mi-key', valor);           // TTL default 10 min
await mlib.userCache('mi-key', valor, 3600);     // TTL 1h
await mlib.userCache('mi-key', valor, 0);        // sin TTL (LRU eviction)
```

### Import dinámico

Dentro del script podés hacer `import()` de otros módulos:

```javascript
// Path relativo → busca en el mismo repo/ref
let helpers = await import('./helpers.mjs');

// Package npm → resuelve de node_modules del propio Vercel
let axios = await import('axios');
```

Los relativos usan `gitImport()` internamente — bajan del CDN, cachean en `/tmp/mod-cache/`, y hacen `import()` real. Los absolutos van al `node_modules/` del deployment.

---

## Response

El script puede devolver 3 formas:

**1. Response HTTP raw (recomendado para webhooks / APIs):**

```javascript
return {
    responseStatus:  200,
    responseText:    JSON.stringify({ ok: true }),
    responseHeaders: { 'Content-Type': 'application/json' }
};
// o para binario:
return { responseStatus: 200, responseBuffer: pdfBuffer, responseHeaders: {...} };
```

**2. Escribir directo a `res` desde el script:**

```javascript
res.set('Content-Type', 'text/html');
res.status(200).send('<h1>ok</h1>');
// no hace falta return
```

**3. Valor plano (compat v8, no recomendado):**

```javascript
return { alguna: 'cosa' };
// → responde 200 { "__value__": { "alguna": "cosa" }, "__type__": "object" }
```

**4. Code re-eval (compat attachments.mjs):**

```javascript
return { code: '...string de código...' };
// → el server evalúa ese code con acceso a res para servir binarios con Content-Type dinámico
```

---

## Auth + Message

El endpoint `ghx*` en sí **no valida auth** — es un ejecutor. La auth (si aplica) la impone el propio script.

Los datos de sesión Doors se pasan al script en `message`:

**GET:** query `?msg={"serverUrl":"...","authToken":"..."}` (JSON URL-encoded).
**POST:** body con `{ serverUrl, authToken?, apiKey?, doc?, folder?, payload? }`.

Sin esos campos, `fdSession` y `dSession` existen pero unconnected — para el script son inutilizables hasta que llame `logon()` o setee `serverUrl`+`authToken` manualmente.

Un webhook público (Twilio, MP) NO trae message auth — el script decide si valida signature, IP, HMAC o lo que corresponda.

---

## Logs

Cada ejecución genera 2 tipos de logs en PG Neon (schema `fluye_master`):

| Tabla | Contenido | Populado por |
|---|---|---|
| `node_console` | Cada `console.log/warn/error` interceptado con NBSP-serialization | `dbConsole.js` override |
| `node_execlog` | Metadata de la ejecución: `starttime`, `duration_ms`, `exitcode` (0/1), `error`, `serverurl`, `instance`, `login`, `docid`, `folder`, `gitowner`, `gitrepo`, `gitpath`, `gitref`, `fresh` | `worker.js:logExec()` |

**Console tags:** el override arma automáticamente `tag1 = "{repo}/{path}"` para cada log. Podés agregar tags custom pasando un objeto como último arg:

```javascript
console.log('procesando', { consoleTag2: 'ormay', consoleTag3: docId });
```

**Consultar logs:**

```sql
SELECT time, method, tag1, tag2, tag3, LEFT(data::text, 500) AS data
FROM fluye_master.node_console
WHERE tag1 = 'wappcnn/server/hook.js'
ORDER BY id DESC LIMIT 50;
```

```sql
SELECT starttime, duration_ms, exitcode, error, instance, gitrepo, gitpath
FROM fluye_master.node_execlog
WHERE gitrepo = 'wappcnn' AND exitcode = 1
ORDER BY starttime DESC LIMIT 20;
```

---

## Debug

`?_debug=1` corre el script **sin VM sandbox** — permite:

- Breakpoints en Chrome DevTools (`chrome://inspect` apuntando al proceso Node).
- `debugger` statement.
- Step-in, step-over.

Trade-off: sin sandbox, un error del script tira el proceso Node del worker Vercel (drop de otras requests concurrentes). Usar **solo para debug local** o durante desarrollo.

---

## Diferencias vs `ghxcv` de Events.v8 (legacy)

Los endpoints Fluye son un port funcional de `ghxcv` / `ghx` del stack Events.v8 (Node en EC2). API idéntica desde el punto de vista del script — código legacy corre sin cambios.

| Aspecto | Events.v8 (`node.cloudycrm.net`) | Fluye Compute (`fluye.ar`) |
|---|---|---|
| Nombre corto | `ghxcv` (`cv` = CloudyVisionArg) | `ghxf` (`f` = fluye-ar) |
| Runtime | Node.js + poolMgr en EC2 (`t2.medium`) | Vercel Fluid Compute (managed) |
| Escalado | Manual (upgrade EC2) | Automático (multi-region) |
| CDN de scripts | `cdn.cloudycrm.net` (S3) | `cdn.fluye.ar` (R2) |
| Cache local | disco + Redis local | `/tmp/mod-cache` + CDN edge |
| `console` overridado | MySQL `console` table | PG Neon `fluye_master.node_console` |
| `execlog` | MySQL `execlog` table | PG Neon `fluye_master.node_execlog` |
| `userCache` | Redis | Vercel Runtime Cache |
| Timezone | Server local (ART) | Seteado en runtime a `America/Argentina/Buenos_Aires` |
| Auth model | Idéntico | Idéntico |
| Return protocol | Idéntico | Idéntico |
| Import dinámico | `gitImport()` a disco local | `gitImport()` a `/tmp/mod-cache` |

**Migración de un script `ghxcv` → `ghxf`:** cambiar la URL. Nada más. El `ctx`, `fdSession`, `mlib`, `console` son los mismos.

---

## Ejemplos

### Webhook público (Twilio status)

```
POST https://fluye.ar/api/ghxf/wappcnn/server/hookStat.js
```

El script recibe el POST en `ctx.req.body`, valida la signature Twilio y actualiza el estado del mensaje. Sin `serverUrl`/`authToken` — hace el login internamente con creds del env.

### Ejecutar como sesión Doors

```
GET https://fluye.ar/api/ghxf/wappcnn/server/status.js?msg=%7B%22serverUrl%22%3A%22https%3A%2F%2Formay.cloudycrm.net%2Frestful%22%2C%22authToken%22%3A%22abc123%22%7D
```

El script arranca con `fdSession` ya autenticada — puede hacer `folder(fldId).search(...)` sin más setup.

### Force re-fetch tras un push

```
GET https://fluye.ar/api/ghxf/wappcnn/server/hook.js?_fresh=1
```

Bypass del cache CDN — trae la versión actual de main.

### Pin a un commit específico (prod estable)

```
GET https://fluye.ar/api/ghxf/wappcnn@a1b2c3d4e5f6/server/hook.js
```

La URL se mantiene consumiendo esa versión del código hasta que el caller cambie el `@ref`.

---

Jorge Pagano - Fluye Labs
