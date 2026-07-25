# Crash reporting — errores del cliente a la consola del server

**Estado:** ✅ Pattern activo — SDK ya expone `fdSession.sconsole` desde ticket `260630`.

## Qué resuelve

Que cuando la app del cliente peta (uncaught JS error, promise rejected, fetch fail), el crash **llegue solo** a `node_console` en Neon — sin que el usuario abra devtools, copie la consola y te la mande. Se debuggea con un SELECT.

Aplica a cualquier app que consuma el SDK: Wiz, broadcast, pivotable, insights, liveforms7, etc.

## Piezas

| Pieza | Dónde vive | Rol |
|---|---|---|
| `fdSession.sconsole.{log,warn,error}` | [`fluye/doorsClient.mjs:1024`](../doorsClient.mjs) | API — POST a `/api/console` |
| Endpoint `/api/console` | `fluye-core/app/api/console.js` | Recibe y escribe en `node_console` |
| Tabla `node_console` | Neon PG `fluye_master` | Store — cols: `id, time, method, data, tag1, tag2, tag3` |
| Método `fdSession.sconsole.wire(appName)` | [`fluye/doorsClient.mjs:1095`](../doorsClient.mjs) | Hook de la app — 1 línea en el bootstrap |

Sin `wire()`, `sconsole` sólo captura lo que el dev llamó a mano. Los crashes reales del cliente se pierden.

## Setup — 1 línea

Una vez, al arrancar la app (después de que la sesión esté lista):

```js
// Browser
await fluye.openDoors();
fdSession.sconsole.wire('wiz');

// Node
await session.logon(user, pwd, instance);
session.sconsole.wire('mi-script');
```

Eso alcanza. `wire()` es idempotente (segunda llamada = no-op) y detecta entorno solo:
- **Browser:** hookea `window.error` + `window.unhandledrejection`.
- **Node:** hookea `process.on('uncaughtException')` + `process.on('unhandledRejection')`.

Opciones (defaults razonables, sólo pasar si querés cambiar):

```js
fdSession.sconsole.wire('wiz', { maxPerMin: 20, dedupMs: 60_000 });
```

**Después de `wire()`** la app puede seguir logueando a mano donde tenga sentido negocio:

```js
try { await folder.save(); }
catch (e) { fdSession.sconsole.error('save falló', e, { consoleTag1: 'wiz' }); throw e; }
```

## Convención de tags

- **`consoleTag1`** — **app name**. Fijo, lo elige la app: `wiz`, `broadcast`, `pivotable`, `insights`, `liveforms7`, `import`, etc. **Obligatorio** para poder filtrar por app.
- **`consoleTag2`** — **instancia**. Se autocompleta desde `session.instance.Name` (no requiere pasar).
- **`consoleTag3`** — **login**. Se autocompleta desde `session.currentUser.login`.

Si la app quiere sub-módulo, va en el data (no en tag2): `{ module: 'chat-core' }`.

## Cómo consultar

Neon PG (`fluye_master`) — timeouts obligatorios:

```sql
-- todos los crashes de wiz en Amatista, últimas 24h
SELECT time AT TIME ZONE 'America/Argentina/Buenos_Aires' as ts,
       method, tag3 as login, LEFT(data, 500) as data
FROM fluye_master.node_console
WHERE tag1 = 'wiz' AND tag2 = 'AMATISTA'
  AND method = 'error'
  AND time > NOW() - INTERVAL '24 hours'
ORDER BY time DESC LIMIT 100;

-- solo errores de un usuario específico
SELECT * FROM fluye_master.node_console
WHERE tag1 = 'wiz' AND tag3 = 'FER'
  AND time > NOW() - INTERVAL '7 days'
ORDER BY time DESC;
```

Timeout Node pg: `statement_timeout: 60000` — regla dura del proyecto ([`fluye-core/CLAUDE.md`](../../fluye-core/CLAUDE.md#queries-a-producción--regla-dura)).

## Qué se captura / qué no

**Se captura:**
- Errores JS no capturados (throw sin catch, TypeError, ReferenceError, etc.)
- Promises rejected sin `.catch()` — el 90% de los "clavados" al esperar respuesta.
- Errores en scripts del propio origen y CDN de Fluye/Cloudy.

**NO se captura (a propósito):**
- Errores de assets externos con CORS (`Script error.` opaco de un CDN de terceros).
- Errores dentro de un `try/catch` — si la app decide silenciarlos, no los ve.
- Fetch/XHR con response no-2xx — el `fetch` no "tira" por default. Si querés capturar 5xx del server, la app debe llamar `sconsole.error` en el catch/response check. Se puede agregar interceptor global en una v2 del pattern.
- Errores del propio `sconsole` (`fetch('/api/console')` que falla) — fire-and-forget, para no loop.

## De-dup y rate limit

El snippet incluye:
- **Dedup por línea 1 del stack** con TTL 60s → un mismo error en loop no manda 1000 filas.
- **Máx 20 por minuto por app** → cap duro. Si algo dispara catarata, se pierde el resto (es preferible a saturar Neon).

Si necesitás ajustar por app, pasá los números al `wireCrashReporting`.

## Kill switch

```js
fdSession.sconsole.disabled = true;   // corta envío al server (nativa sigue)
```

Útil para debugging local sin ensuciar `node_console`.

## Roadmap corto

- **v1 (hoy):** window.error + unhandledrejection + dedup + rate limit. Es lo mínimo útil.
- **v2:** interceptor global `fetch` que capture responses ≥ 500 (opt-in por app).
- **v3:** breadcrumbs — buffer circular de los últimos N `sconsole.log` y adjuntarlos al crash. Para reconstruir qué hizo el usuario antes.
- **v4:** UI en Fluye Admin para ver crashes por app/instancia/usuario, con filtros y timeline. Hoy se consulta por SQL.

Ir sumando por evidencia de necesidad, no por especulación.

## Ver también

- SDK: [`fluye/doorsClient.md`](../doorsClient.md) — sección "sconsole — consola server-side"
- Ticket original: [`fluye/tickets/done/260630 - sconsole - logging server-side desde SDK/`](../tickets/done/260630%20-%20sconsole%20-%20logging%20server-side%20desde%20SDK/)
- Convención tags MySQL Events.v8 (legacy): [`Desarrollo/CLAUDE.md`](../../CLAUDE.md#eventsv8-console-logs) — mismo patrón `tag1/tag2/tag3`.
- Charter agente: [`fluye/agents/JS-SDK.md`](../agents/JS-SDK.md)

---

**Jorge Pagano - Fluye Labs**
