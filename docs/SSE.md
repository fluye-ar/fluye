# SSE - Server-Sent Events

Sistema de eventos en tiempo real. El server .NET emite eventos al guardar documentos, Events.v8 los distribuye a browsers conectados via EventSource.

## Flujo

```
Browser (EventSource) ←── GET /ssevents ←── Events.v8 ←── POST /ssevents ←── .NET (LogsService.cs)
```

1. **.NET AfterSave** → `LogsService.cs` arma `{ FLD_ID, DOC_ID, ...extrafields }` → POST a Events.v8 `/ssevents`
2. **Events.v8** → Almacena evento en MySQL, polling cada N ms lo despacha a conexiones activas filtradas por instancia
3. **Browser** → `EventSource` recibe el evento, listeners lo procesan

## Evento `doc:change`

Emitido por .NET en cada save de documento. Data mínima:

```json
{ "FLD_ID": 1234, "DOC_ID": 5678 }
```

Con `SSE-EXTRAFIELDS` configurado:

```json
{ "FLD_ID": 1234, "DOC_ID": 5678, "FROM": "+5493511234567", "TO": "+5491155557777" }
```

## Properties de Carpeta

| Property | Valor | Efecto |
|----------|-------|--------|
| `SSE-EXTRAFIELDS` | CSV de campos (ej: `FROM,TO`) | Agrega campos del documento al evento |
| `SSE-DISABLE` | `1` o `true` | Deshabilita SSE para esa carpeta |

Las properties se leen del `doc.Parent` (la carpeta). Busca campos en: HeaderFields, CustomHeaderFields, CustomFields.

## Client API

```javascript
// Obtener singleton de EventSource (1 por browser tab)
const sse = await fSession.node.serverEvents();

// Suscribirse a eventos
sse.addEventListener('doc:change', (ev) => {
    let data = JSON.parse(ev.data);
    // data.FLD_ID, data.DOC_ID, ...extrafields
});

// Despachar evento desde código (POST)
await fSession.node.serverEventsDispatch({
    type: 'myEventType',
    data: 'string or object',
});
```

El EventSource se guarda en `window.drsServerEvents` — singleton por tab. Reconexión automática del browser (nativa de EventSource). El `Last-Event-ID` header permite recuperar eventos perdidos.

## Events.v8 Server

**GET `/ssevents?ins=INSTANCE`** — Endpoint EventSource. Filtra por instancia (lowercase).

**POST `/ssevents`** — Registra evento `{ instance, type, data }`. Llamado por .NET.

**Polling:** `setTimeout` recursivo (no `setInterval` para evitar superposición). Despacha a conexiones activas matcheando instancia.

**MySQL:** Tabla `sse` con id autoincrement usado como `Last-Event-ID`.

## Archivos Fuente

| Archivo | Qué hace |
|---------|----------|
| `DoorsBPM/server/.../LogsService.cs` | Dispara POST en AfterSave, lee properties |
| `Events.v8/server/server.js` | GET/POST endpoints, polling, dispatch |
| `fluye/doorsClient.mjs` → `node.serverEvents()` | Client singleton EventSource |
| `fluye-lib/channels/twilio/setup.vbs` | Instala `SSE-EXTRAFIELDS=FROM,TO` en messages |
| `fluye-lib/channels/twilio/checkapp.mjs` v44 | Idem via migración automática |

## Ejemplo: Chat WhatsApp

`wapptwilio.mjs` se suscribe a `doc:change`, filtra por `FLD_ID` de messages + `FROM/TO` del contacto, y al matchear obtiene el doc completo con `messagesFolder.search()`.

```javascript
let sse = await fSession.node.serverEvents();
sse.addEventListener('doc:change', async (ev) => {
    let data = JSON.parse(ev.data);
    if (data.FLD_ID != messagesFolder.fldId) return;
    if (cleanNum(data.FROM) !== extNum && cleanNum(data.TO) !== extNum) return;
    // Fetch full doc and render
});
```

---

**Ing Jorge Pagano - Cloudy CRM**
