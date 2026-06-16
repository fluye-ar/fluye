# Fluye

**Open-source SDKs de Fluye — Agentic Organization**

SDKs JavaScript open-source (LGPL v3) de la plataforma Fluye: workflows operados por chat sobre el motor Doors.

## Quick Start

**Browser:**

```html
<script>
  (async () => {
    await include([{ id: 'fluye-client', src: 'https://cdn.fluye.ar/ghf/fluye/browser.js' }]);
    await fluye.openDoors();
    const fdSession = fluye.doorsSession;
    // ...
  })();
</script>
```

**Node.js:**

```javascript
import { Session } from './doorsClient.mjs';

const fdSession = new Session();
fdSession.serverUrl = 'https://instancia.fluye.ar/restful';
await fdSession.logon('usuario', process.env.PASSWORD, 'instancia');
// ...
await fdSession.logoff();
```

## Qué hay acá

| Carpeta / archivo | Qué es |
|---|---|
| [`doorsClient.mjs`](doorsClient.mjs) / [`doorsClient.md`](doorsClient.md) | SDK core — Session, Folder, Document, Form, Directory, db |
| [`browser.js`](browser.js) / [`browser.md`](browser.md) | Utilidades web — loader de Bootstrap, jQuery, upload, helpers |
| [`client/`](client/README.md) | Extensiones lazy del SDK (AI, instance) |
| [`brand/`](brand/) | Logos e isotipo Fluye (uso público) |
| [`docs/`](docs/) | Notas técnicas — [RELATIONS](docs/RELATIONS.md), [SSE](docs/SSE.md), [INDEX](docs/INDEX.md) |

## Licencia

[LGPL v3](LICENSE)

---

**Website:** [fluye.ar](https://fluye.ar) · **Email:** info@fluye.ar
