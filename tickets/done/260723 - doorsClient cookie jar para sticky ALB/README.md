# doorsClient: cookie jar para sticky ALB en calls backend-to-backend

**Estado:** ✅ CERRADO — 2026-07-23 — cookie jar hand-rolled en `RestClient` (Node-only), validado end-to-end contra el ALB de Cloudy (antun/edisur). Test en [`test_cookiejar.mjs`](test_cookiejar.mjs).

## TL;DR

`doorsClient.mjs` usa `fetch()` nativo de Node sin cookie jar. Cada request es una "sesión HTTP nueva" que **no reenvía cookies recibidas** de responses anteriores. En un setup con LB horizontal (ALB con sticky `lb_cookie`), esto rompe el sticky para calls backend-to-backend: **cada request va random** al backend (round-robin) en vez de mantenerse pegado al nodo de la sesión.

Con el fix del sessionCache en Doors 8.0.0.17 (rehidrata cache miss desde master), el problema no rompe funcionalmente, pero **cada cache miss cuesta 1 SELECT al master** — se puede eliminar agregando cookie jar al cliente.

## Contexto

- **doorsClient.mjs** vive en `/Users/jorge/Desarrollo/fluye/doorsClient.mjs`.
- Es usado desde múltiples lugares:
  - **Events.v8 backend** (`node.cloudycrm.net`) para todos los flows async / sync events.
  - Scripts Node de operaciones.
  - CI installers.
  - Sync events VBS/JS en Doors.
- Todos hacen fetch al REST endpoint de Doors — que hoy va vía ALB Cloudy (`cloudy-multisite-lb`) con TG `w2-secure-lb-tg` con **sticky `lb_cookie` 24h enabled**.

## Setup ALB actual (sticky)

El ALB emite en la primera response un `Set-Cookie: AWSALB=<id-cifrado-del-target>; Max-Age=86400`. En requests siguientes, si el cliente envía la cookie de vuelta, el ALB decodifica y enruta al mismo target.

**Comportamiento observado:**
- **Browsers (usuarios humanos)**: guardan AWSALB automáticamente en el cookie store → sticky funciona ✅.
- **doorsClient / fetch() nativo Node**: NO persiste cookies entre calls → cada request es "nuevo cliente" → round-robin → puede caer en cualquier target.

## Consecuencia sin cookie jar

Con LB horizontal + fix Doors 8.0.0.17:

1. Backend call 1 (Events.v8) → ALB round-robin → cae en nodo `A`. Nodo A crea sesión ADO en master.
2. Backend call 2 → sin cookie AWSALB → ALB round-robin → cae en nodo `B`.
3. Nodo B recibe request con `SessionGuid` en `AuthToken`. Cache miss.
4. Nodo B rehidrata desde master (`SELECT SYS_CONNECTIONS WHERE SESSION = @guid`) + poblate cache.
5. Request responde OK.

**Impacto:** cada backend call que salta de nodo dispara 1 SELECT al master. Con ~1000 calls/hora (numero simulado), eso son 1000 SELECTs extra/hora sobre el master compartido — barato pero evitable.

Sin el fix (Doors <8.0.0.17), el mismo escenario devolvía `UserNotLoggedException`. Ver [ticket doors 260722](../../../doors/tickets/260722%20-%20sessionCache%20local%20del%20clon%20no%20resuelve%20sesiones%20creadas%20post-OnStart/).

## Fix propuesto

Agregar cookie jar a `doorsClient.mjs`. Options:

### Opción A — `tough-cookie` + `fetch-cookie` (recomendado)

```js
import { CookieJar } from 'tough-cookie';
import fetchCookie from 'fetch-cookie';

class RestClient {
    constructor() {
        this.cookieJar = new CookieJar();
        this.fetch = fetchCookie(fetch, this.cookieJar);
    }

    async request(...) {
        return this.fetch(url, opts);  // en vez de fetch(url, opts)
    }
}
```

- Cookie jar por instancia de `Session` — cada Session mantiene su propio jar.
- `AWSALB` viene automáticamente en cada call → sticky respeta.

### Opción B — manejo manual del header AWSALB

En vez de dependencias externas, capturar `Set-Cookie` de la primera response y reenviarlo manual:

```js
class RestClient {
    constructor() { this._albCookie = null; }
    async request(url, opts) {
        if (this._albCookie) opts.headers['Cookie'] = this._albCookie;
        const resp = await fetch(url, opts);
        const setCookie = resp.headers.get('set-cookie');
        if (setCookie && setCookie.includes('AWSALB')) {
            this._albCookie = setCookie.split(';')[0];  // solo el "AWSALB=..."
        }
        return resp;
    }
}
```

Menos limpio pero sin dependencias. Puede fallar con múltiples cookies o edge cases.

**Recomendación: A** — tough-cookie es estándar, manejo correcto de todos los edge cases (expiración, path/domain, múltiples cookies).

## Consideraciones

1. **Impacto por-Session vs global**: cada instancia `new Session()` debe tener su propio cookie jar (si el mismo proceso tiene sesiones a instancias distintas, deben ser independientes).
2. **Timeout/expiración**: si un Session vive >24h y la cookie AWSALB expira, el próximo call va a round-robin → OK, empiezan sticky de nuevo con nueva cookie.
3. **Instancia origen**: sticky cookie del ALB es por-hostname. Si Session.serverUrl apunta a URL distinta (ej: acceso directo al IP interno vs al ALB), no aplica cookie del ALB.
4. **Testeo**: verificar que las llamadas Events.v8 y CI installers no se vean afectadas por el cambio (regresión potencial si algún código dependía de "cada call es cliente nuevo").

## Prioridad

**Media.** No bloquea LB horizontal (el fix Doors alcanza). Es optimización de latencia + carga master. Vale hacerlo antes de escalar el farm (Fase 3 con ASG) para no sumar hits al master proporcionales al número de nodos.

## Resultado (2026-07-23)

Implementado **Opción C** (hand-rolled, no A ni B): jar de cookies en `RestClient`, **sin dependencias**.

**Por qué hand-rolled y no `tough-cookie` (Opción A):** se decidió aplicarlo **solo a `RestClient`** (los otros clients —`FluyeClient`, `V8Client`— pegan a `node.config.server`, otro host, y no son el sticky del ticket). Al quedar **un solo host** (`serverUrl`), el scoping por dominio —única razón de `tough-cookie`— no hace falta. `AWSALB`/`AWSALBCORS` son cookies de routing puro; guardar todas las `Set-Cookie` del host y reenviarlas alcanza.

**Diseño:**
- `#cookies` (Map `name -> "name=value"`) por `Session`, en `RestClient`.
- **Solo Node** (`inNode()`): en browser el fetch nativo ya persiste cookies.
- Envía todas las cookies del jar en cada request; captura las `Set-Cookie` de cada response **antes** del check de `response.ok` (funciona aun con errores).
- `RestClient.clearCookies()` lo llama `Session._reset()` → al cambiar `serverUrl`/`authToken`/`apiKey` el jar se vacía.
- `fetch`/`node.exec` propios quedan afuera (no usan `RestClient`).

**Validación end-to-end** (contra el ALB real, sin login — `session/islogged` da 500 pero el ALB setea la cookie):
- call 1 no envía cookie → ALB setea `AWSALB=fih…`
- call 2 envía `AWSALB=fih…` (lo que el ALB seteó en call 1) → ALB setea `AWSALB=ahI…`
- call 3 envía `AWSALB=ahI…`  → **reenvío == lo capturado en la response anterior ✅**
- El valor rota en cada response (la cookie AWS lleva timestamp y se re-encripta) pero rutea al mismo target — comportamiento normal del ALB.
- Cambio de `serverUrl` (edisur) → jar limpio (`_reset`) → recaptura del host nuevo ✅

**Checklist:**
- [x] Cookie jar en `RestClient` (Node-only), clear en `_reset()`
- [x] Test end-to-end contra ALB Cloudy (antun/edisur) → captura/reenvío/clear OK — `test_cookiejar.mjs`
- [x] Sin regresión (captura no bloquea el happy path; browser sin cambios)

## Referencias

- [PoC LB Cloudy](../../../fluye-core/tickets/260721%20-%20Cloudy%20W2b%20LB%20PoC/) — arquitectura del farm.
- [Fix sessionCache Doors 260722](../../../doors/tickets/260722%20-%20sessionCache%20local%20del%20clon%20no%20resuelve%20sesiones%20creadas%20post-OnStart/) — sin el cual esto sería bloqueante.

---

**Jorge Pagano - Fluye Labs**
