# Fluye

**Agentic Organization — Open-source SDKs**

SDKs y herramientas para construir sobre **Doors**, el motor BPM con 25+ años en producción que evoluciona a **Fluye**: workflows operados por chat, IA embebida, multi-cloud.

---

## Qué estamos construyendo

### Motor de ejecución

- **Fluye Compute** — Motor de eventos Node sobre Vercel + Postgres Neon. Endpoints `/api/v9/*` reemplazan gradualmente el backend .NET. Es la dirección que tomamos.
- **Events.v8** — Motor on-premise (Node + MySQL). Sigue disponible como opción **self-hosted** para quienes no van a cloud.

### Toolkit COM x64 (Doors 9)

Para llevar el stack legacy ASP/VBS de 32 a 64 bits sin tocar el código:

- **doorsapi64** — API COM en C++. Reemplaza el stack VB6/.NET COM/WCF de 4 capas con una sola llamada directa al backend REST. ProgIds compatibles.
- **fyjson** — Parser JSON COM basado en yyjson (C, MIT). 5x más rápido que V8, 26.000x más rápido que aspJSON. Disponible desde VBScript.
- **NitroVbx** — Runtime x64 para los eventos VBS síncronos y asíncronos existentes.
- **Reemplazos x64 validados** — aspSmartUpload, ScriptControl, MSXML.

> **`doorsapi64`:** licencia dual — **gratis permanente para instancias single-admin**, o **uso libre sin restricción hasta 2027-11-01**. Después de esa fecha, multi-admin requiere licencia comercial. Binarios via `cdn.fluye.ar`.

### Roadmap de Doors

| Versión | Qué trae | Estado |
|---|---|---|
| Doors 8 (Cloudy CRM) | Base | Producción |
| **Doors 8.5** | Rebrand a Fluye + **Wiz** (asistente IA) | En transición |
| Doors 9 | **Postgres** + **VbX** (toolkit COM x64) | Desarrollo |

---

## SDK JavaScript

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

📖 Referencia completa: [`doorsClient.md`](doorsClient.md) · [`browser.md`](browser.md) · [`client/`](client/README.md)

---

## SDK VBScript

Para programar dentro de eventos y codelibs de Doors. Usa `fyjson` (COM x64) para parsear/serializar JSON desde VBScript a velocidad nativa.

```vbs
NodeInclude "fnode2"

Dim fyj : Set fyj = CreateObject("fyjson")
Dim resp : Set resp = fyj.Parse(httpClient.responseText)

' Acceso a recursos del server Fluye
Set folder = node.Folder(123)
Set docs = folder.Search("ESTADO = 'Abierto'")
```

| Archivo | Para qué |
|---|---|
| [`vbs/fnode2.vbs`](vbs/fnode2.vbs) | Acceso a recursos Fluye via REST (fyjson) |
| [`vbs/node2.vbs`](vbs/node2.vbs) | Versión Cloudy/Doors 8 |
| [`vbs/aspJson.vbs`](vbs/aspJson.vbs) | Parser JSON legacy (fallback sin fyjson) |

---

## Qué hay en este repo

| Carpeta / archivo | Qué es |
|---|---|
| [`doorsClient.mjs`](doorsClient.mjs) / [`doorsClient.md`](doorsClient.md) | SDK JS core — Session, Folder, Document, Form, Directory, db |
| [`browser.js`](browser.js) / [`browser.md`](browser.md) | Utilidades web — loader de Bootstrap, jQuery, upload, helpers |
| [`client/`](client/README.md) | Extensiones lazy del SDK JS (AI, instance) |
| [`vbs/`](vbs/) | SDK VBScript (fnode2, node2, aspJson) |
| [`brand/`](brand/) | Logos e isotipo Fluye (uso público) |
| [`docs/`](docs/) | Notas técnicas — [RELATIONS](docs/RELATIONS.md), [SSE](docs/SSE.md), [INDEX](docs/INDEX.md) |
| [`cdn/`](cdn/) | Script de indexado del CDN |

---

## Licencia

- **SDKs JS y VBScript:** [LGPL v3](LICENSE)
- **`doorsapi64`** (binario propietario): gratis permanente para instancias single-admin · libre sin restricción hasta **2027-11-01** · después de esa fecha, multi-admin pasa a licencia comercial.
- **`fyjson`, `NitroVbx`:** binarios propietarios, uso libre.

---

**Website:** [fluye.ar](https://fluye.ar) · **Email:** info@fluye.ar
