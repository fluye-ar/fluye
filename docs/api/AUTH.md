# API — Autenticación

Los endpoints de Fluye Compute aceptan **4 sources de autenticación**. Cada endpoint declara qué sources acepta — no hay un default global.

**Helper server-side:** [`_lib/auth.js`](https://github.com/fluye-ar/fluye-core/blob/main/app/api/_lib/auth.js) (código privado). Endpoints invocan:

```javascript
let auth = await authenticate(req, res, { accept: ['portal-apikey'] });
if (!auth) return;   // ya respondió 401
```

Sin `opts` = `{ accept: ['portal-jwt', 'portal-apikey'] }` (backward-compat con endpoints históricos).

---

## Sources

| # | Source | Header | Retorna | Consumer típico |
|---|---|---|---|---|
| 1 | `portal-jwt` | `Authorization: Bearer <JWT Cognito>` | `{ user }` | UI del portal Fluye (browser tras login social) |
| 2 | `portal-apikey` | `x-api-key: <api key>` | `{ user }` | Server-to-server (workers, billing) |
| 3 | `doors-authtoken` | `AuthToken: <hex token>` | `{ session }` | Cliente Doors (browser tras `openDoors()`) |
| 4 | `doors-apikey` | `ApiKey: <base64 key>` | `{ session }` | Scripts server-side con sesión Doors pre-autorizada |

**Regla del owner:** cada endpoint elige explícitamente qué sources acepta. Cada source es una superficie de ataque — no aceptar todo por defecto.

---

## Source 1 — `portal-jwt`

**Consumer:** UI del portal `fluye.ar` (React, Vite, Amplify + Cognito).

**Header:**
```
Authorization: Bearer <access_token>
```

Obtenido tras login social (Google OAuth2 via Cognito). El SDK del portal setea el header automáticamente en `fetch` interceptor. Cognito valida el JWT contra el issuer + audience configurados en el pool `us-east-1_D0vwLDaTp`.

**Response del helper:** `{ user, source: 'portal-jwt' }`. `user` contiene la fila de `fluye_master.users` correspondiente al `cognito_sub` del token. Primer login: se crea automáticamente.

**Ejemplo:**
```javascript
let token = (await Auth.currentSession()).getAccessToken().getJwtToken();
fetch('https://fluye.ar/api/v9/instances', {
    headers: { 'Authorization': 'Bearer ' + token }
})
    .then(r => r.json())
    .then(({ data, error }) => { ... });
```

---

## Source 2 — `portal-apikey`

**Consumer:** procesos server-to-server. Billing worker, CI, integraciones externas.

**Header:**
```
x-api-key: <api key>
```

Las keys viven en `fluye_master.api_keys` — ligadas a un user (que hereda los permisos). Se rota deshabilitando la vieja y creando nueva:

```sql
UPDATE fluye_master.api_keys SET active = false WHERE key = '<vieja>';
INSERT INTO fluye_master.api_keys (user_id, key, name, active)
VALUES ('<user_id>', '<nueva>', '<propósito>', true);
```

**Ejemplo (facturar.mjs → `/instance/info`):**
```javascript
let res = await fetch(
    `https://fluye.ar/api/v9/instance/info?guid=${guid}`,
    { headers: { 'x-api-key': process.env.FLUYE_BILLING_KEY } }
);
let { data, error } = await res.json();
```

**Cómo obtener una key:** pedirla al owner del endpoint que la vas a consumir. La key vive server-side (env var, `SYS_SETTINGS`, secret manager) — nunca en código público.

---

## Source 3 — `doors-authtoken`

**Consumer:** cliente Doors legacy (browser + liveforms7) tras autenticación via `openDoors()`.

**Header:**
```
AuthToken: <hex>
```

El token se obtiene del stack Doors clásico (`fluye.doorsClient` en `openDoors()`) y viaja al backend Fluye. El helper descifra el token (AES-128-CBC con clave hardcoded), resuelve la sesión buscando en los `doors_masters` registrados (Neon `fluye_master.doors_masters` + cache de sesiones in-memory).

**Response del helper:** `{ session, source: 'doors-authtoken' }`. `session` incluye:
- `instanceGuid`, `instanceName`, `insId`, `login`, `accId`
- `user`: `{ isAdmin, parentAccountList }` (resolvido desde la propia DB de la instancia)
- `masterDb`, `db` (drivers listos para queries)

**Ejemplo (desde `openDoors()`):**
```javascript
const fdSession = fluye.doorsSession;
let res = await fetch('https://fluye.ar/api/v9/folders/children?fldId=1234', {
    headers: { 'AuthToken': fdSession.authToken }
});
```

---

## Source 4 — `doors-apikey`

**Consumer:** scripts server-side con sesión Doors pre-autorizada (workers Events.v8 legacy, jobs).

**Header:**
```
ApiKey: <base64>
```

El apikey se genera desde el stack Doors clásico y encapsula `guid|login|instanceName`. Se descifra internamente (AES-128-CBC) y sigue el mismo flow que `doors-authtoken` para resolver la sesión.

**Ejemplo (script Node con `doorsClient`):**
```javascript
import { Session } from '/Users/jorge/Desarrollo/fluye/doorsClient.mjs';
const fdSession = new Session();
fdSession.serverUrl = 'https://ormay.cloudycrm.net/restful';
await fdSession.logon('admin', process.env.PWD, 'ormay');
// fdSession.apiKey ya seteado tras logon

let res = await fetch('https://fluye.ar/api/v9/folders/documents?fldId=1234', {
    headers: { 'ApiKey': fdSession.apiKey }
});
```

---

## Respuestas de auth

**Sin credenciales o inválidas:**
```
HTTP 401
{ "error": "No credentials", "accepted": ["portal-apikey"] }
```

Salvo endpoints históricos que retornan formato legacy propio.

**Con credenciales OK:** el endpoint sigue con su lógica. Nunca hay 403 por default — un source aceptada es permiso completo. Autorización granular vive dentro de cada endpoint (ej. `/instances` filtra por `user_instances`).

---

## Sources especiales (no `authenticate()`)

Algunos endpoints tienen auth custom por razones históricas o de propósito específico:

### `X-Pricing-Key`

Endpoint `/api/v9/vendors/pricing` (y su shim `/ai/pricing`) usa una clave fija en Vercel env (`AI_PRICING_KEY`). Consumida por un único bot ([`fluye-lib/tickets/260519 - AI Pricing Bot`](../../tickets/260519%20-%20AI%20Pricing%20Bot/)).

```
X-Pricing-Key: <clave>
```

No hay múltiples keys ni ligadas a users — es identidad de bot.

### `x-console-token`

Endpoint `/api/console` acepta un token propio o cualquier `doors-*` — se documenta en su propio contrato.

### `ghx*` — Sin auth propia

Endpoints `/api/ghx/*`, `/api/ghxf/*` **no validan auth**. El código ejecutado dentro del sandbox decide si valida el request (webhook público) o si consume una sesión Doors traída en el `message`. Ver [`EXEC.md`](EXEC.md).

---

**Jorge Pagano - Fluye Labs**
