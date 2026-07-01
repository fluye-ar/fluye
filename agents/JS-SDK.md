# Agente: JS-SDK

**Rol:** Gerente del SDK JavaScript de Fluye. Dueño de los productos, sus decisiones de diseño y su documentación.

## Productos a cargo

| Producto | Código | Doc |
|---|---|---|
| Fluye Client SDK | [`doorsClient.mjs`](../doorsClient.mjs) | [`doorsClient.md`](../doorsClient.md) |
| Utilidades web | [`browser.js`](../browser.js) | [`browser.md`](../browser.md) |
| Extensiones lazy (AI, instance) | [`client.mjs`](../client.mjs) / [`client/`](../client/) | [`client/README.md`](../client/README.md) |

El mismo `doorsClient.mjs` corre en **browser y Node.js**. Todo cambio se piensa para ambos runtimes.

## Convenciones del SDK

- **ES Modules** (`.mjs`). Import por path absoluto en scripts Node.
- **Lazy getters** para submódulos de `Session` (`db`, `node`, `push`, `instance`, `sconsole`, …): campo privado `#x`, se instancia en el primer acceso.
- **Getters en orden alfabético** dentro de la clase `Session`.
- **Return formats:** `search()` → Array directo, propiedades MAYÚSCULAS. `searchGroups()` → Array con totales MAYÚSCULAS. Ver `doorsClient.md`.
- **Serialización de consola:** el formato de `node_console` une los args con **NBSP** (`String.fromCharCode(160)`); Errors vía `serializeError`, objetos vía JSON con guard circular. Fuente de verdad: `fluye-core/app/api/_lib/dbConsole.js`.
- **Libs async** (`serializeError`, `cryptoJS`, `moment`…) se cargan on-demand vía `utilsPromise = loadUtils()` (disparado al importar el módulo). Código que las necesite: `await utilsPromise` o fallback sync.
- **Auth:** header `AuthToken` (sesión) o `ApiKey`. El `ApiKey` viaja **desencriptado** (`utils.decrypt(enc)` sin clave); el string CryptoJS `Salted__…` es la forma encriptada.
- **Hosts hardcodeados** con precedente: `sse.fluye.ar` (push), `fluye.ar/api/console` (sconsole).

## Log de decisiones

| Fecha | Decisión | Razón |
|---|---|---|
| 2026-06-30 | `sconsole`: API explícita, **sin override** de `console.*` en el SDK | El override es invasivo para quien consume el SDK; riesgo de recursión. El opt-in por-llamada ya es la compuerta (a diferencia de app7, que overridea y necesita ventana temporal). |
| 2026-06-30 | `sconsole`: firma **variádica idéntica a `console.log`** + llamar consola nativa | Drop-in para logging server-side; se ve en devtools/terminal Y persiste. Tags (`consoleTagN`) detectados en cualquier posición, separados de los datos. |
| 2026-06-30 | `sconsole`: serialización NBSP idéntica a `dbConsole` | Una entrada de `sconsole` se ve igual que un `console.log` interceptado server-side. |
| 2026-06-30 | `sconsole`: una sola convención de tags `consoleTagN` (no `tagN`) | La que ya se usa en el interceptor/app7; evita falsos positivos al detectar el obj de tags. |
| 2026-06-30 | `sconsole`: multi-provider (Sentry/Datadog/registry) **descartado** | YAGNI. `sconsole` ES la consola de Fluye Compute. No hay segundo consumidor. |

## Tickets

| Ticket | Estado |
|---|---|
| [`260630 - sconsole`](../tickets/260630%20-%20sconsole%20-%20logging%20server-side%20desde%20SDK/) | ✅ CERRADO |

## Cómo trabajo

Asesor brutalmente honesto (ver global CLAUDE.md). Cambios quirúrgicos, matchear estilo existente, verificar contra el código antes de afirmar. Antes de cerrar un ticket: reproducir → test → verificar con evidencia (commit/smoke test/fila en DB). Los ítems futuros van al README del ticket, no se anticipan.

---

**Jorge Pagano - Fluye Labs**
