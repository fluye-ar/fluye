# Fluye Labs

**Agentic Organization**

SDKs y herramientas para **Doors** — el motor BPM con 25+ años en producción que evoluciona hacia workflows agénticos.

---

## Mundo JavaScript

### Motor de ejecución

- **Fluye Compute** — Motor cloud sobre Vercel + Postgres Neon. Endpoints `/api/v9/*` reemplazan gradualmente el backend .NET. Es la evolución.
- **Events.v8** — Motor self-hosted (Node.js + MySQL). Sigue disponible para quienes no van a cloud.

### SDK

- **doorsClient** — Cliente JS para Doors. Mismo módulo en browser y Node.js. Session, Folder, Document, Form, Directory, db. → [`doorsClient.md`](doorsClient.md)
- **browser.js** — Utilidades para apps web: loader Bootstrap/jQuery, upload, helpers. → [`browser.md`](browser.md)
- **client/** — Extensiones lazy (AI, instance). → [`client/`](client/README.md)

### LiveForms 7

Sistema de formularios database-driven que renderiza el mismo control en **web** (Bootstrap 5.3) y **mobile** (Framework7). Evolución de los `generic*` ASP: saca el rendering del server y lo lleva al cliente, con extensiones business por repo.

Distribuido vía `cdn.fluye.ar`.

---

## Mundo VBScript

### Server-Side Rendering

- **generic1** / **generic3** — Runtimes ASP Classic que renderizan formularios desde la definición DB. Stack legacy todavía en producción; convive con LiveForms 7 (cliente).

### Toolkit COM x64 (VbX)

Para llevar el stack ASP/VBS de 32 a 64 bits sin tocar el código existente. Todos los componentes mantienen los `ProgIds` originales — se cambia el Application Pool a x64 nativo y listo.

> 📦 **Pack de instalación + instructivo:** [`vbx/`](vbx/) — Binarios en [GitHub Releases](https://github.com/fluye-ar/fluye/releases) (prefijo `vbx-`).

- **doorsapi64** — API COM en C++. Reemplaza el stack VB6 / .NET COM / WCF de 4 capas con una sola llamada directa al backend REST.
  > **Licencia:** gratis permanente para instancias **admin-only** (solo el usuario admin builtin, ID=0) · libre sin restricción hasta **2027-11-01** · después de esa fecha, instancias multi-usuario requieren licencia comercial.

- **fyjson** — Parser JSON COM en C (basado en `yyjson`, MIT). 5x más rápido que V8, 26.000x más rápido que `aspJSON`. Disponible desde VBScript.
  → Repo: [fluye-ar/fyjson](https://github.com/fluye-ar/fyjson) (open source)

- **NitroVbx** — Runtime x64 de eventos VBS síncronos y asíncronos. Los eventos legacy corren acá sin cambios.

- **aspSmartUpload64** — Reemplazo x64 de `aspSmartUpload` (upload de archivos en ASP).

- **ScriptControl64** — Reemplazo x64 de `msscript.ocx` (eval de VBScript desde COM).

### SDK VBScript

Para programar dentro de eventos y codelibs de Doors.

```vbs
NodeInclude "fnode2"

Dim fyj : Set fyj = CreateObject("fyjson")
Dim resp : Set resp = fyj.Parse(httpClient.responseText)

Set folder = node.Folder(123)
Set docs = folder.Search("ESTADO = 'Abierto'")
```

| Archivo | Para qué |
|---|---|
| [`vbs/fnode2.vbs`](vbs/fnode2.vbs) | Acceso a recursos Fluye via REST (fyjson) |
| [`vbs/node2.vbs`](vbs/node2.vbs) | Versión Cloudy / Doors 8 |
| [`vbs/aspJson.vbs`](vbs/aspJson.vbs) | Parser JSON legacy (fallback sin fyjson) |

---

## Wiz

Asistente IA contextual embebido en Fluye. Responde sobre la instancia (datos, procesos, configuración), busca en código y docs, y ejecuta acciones por chat. El primer feature visible de la organización agéntica.

- Backend sobre Fluye Compute (`/api/v9/ai/*`)
- Llega con **Doors 8.5**

## Agentes WhatsApp

Agentes IA que atienden WhatsApp como **pre-filtro**: responden FAQs con contexto del CRM, derivan a un humano lo que no les corresponde, y se prenden/apagan por agenda. Cada agente vive como un doc editable desde el CRM (prompt + modelo + cronograma + acciones de clock-in).

- Editor visual en LiveForms 7
- En producción: Antun / Chexa (Administración de Planes de Ahorro)

---

## Doors: roadmap

| Versión | Qué trae | Estado |
|---|---|---|
| Doors 8 (Cloudy CRM) | Base | Producción |
| **Doors 8.5** | Rebrand a Fluye + **Wiz** (asistente IA) | En transición |
| Doors 9 | **Postgres** + **Toolkit COM x64** | Desarrollo |

---

## Quick Start — JavaScript

**Browser:**

```html
<script>
  (async () => {
    await include([{ id: 'fluye-client', src: 'https://cdn.fluye.ar/ghf/fluye/browser.js' }]);
    await fluye.openDoors();
    const fdSession = fluye.doorsSession;
  })();
</script>
```

**Node.js:**

```javascript
import { Session } from './doorsClient.mjs';

const fdSession = new Session();
fdSession.serverUrl = 'https://instancia.fluye.ar/restful';
await fdSession.logon('usuario', process.env.PASSWORD, 'instancia');
```

---

## Qué hay en este repo

| Carpeta / archivo | Qué es |
|---|---|
| [`doorsClient.mjs`](doorsClient.mjs) / [`doorsClient.md`](doorsClient.md) | SDK JS core |
| [`browser.js`](browser.js) / [`browser.md`](browser.md) | Utilidades web |
| [`vbs/`](vbs/) | SDK VBScript |
| [`vbx/`](vbx/) | Toolkit COM x64 — binarios, instalación, ProgIds |
| [`brand/`](brand/) | Logos e isotipo Fluye |

---

## Licencia

- **SDKs JavaScript y VBScript:** [LGPL v3](LICENSE)
- **fyjson:** open source — ver [repo propio](https://github.com/fluye-ar/fyjson)
- **doorsapi64** (binario propietario): gratis permanente para instancias **admin-only** (solo el usuario admin builtin, ID=0) · libre sin restricción hasta **2027-11-01** · después: instancias multi-usuario requieren licencia comercial.
- **NitroVbx, aspSmartUpload64, ScriptControl64:** binarios propietarios, uso libre.

---

**Website:** [fluye.ar](https://fluye.ar) · **Email:** info@fluye.ar
