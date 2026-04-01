# Variables globales en Node

Para los procesos que corren en Node, las variables globales son:

```javascript
// ctx es la principal variable global

ctx = { // Objeto de contexto
  doc, // El documento si es un syncEvent, sino undefined
  doorsapi2, // El modulo doorsapi2.mjs
  dSession, // Objeto sesion, que estara logueado si se envio serverUrl, y apiKey o authToken
  folder, // El folder del documento si es un syncEvent, sino undefined
  mainlib, // Para gitImport y gitCdn
  mlib, // Alias del anterior
  message: {  // El mensaje que dispara la tarea
    apiKey, // opcional
    authToken, // opcional
    doc, // json, opcional
    folder, // id o json, opcional
    events: [
      { owner, repo, path, ref, fresh, deepFresh },
    ],
    eventName, // Document_Open, Document_BeforeSave, etc
    serverUrl, // opcional
  },
  req, /* El objeto request parcialmente serializado. Incluye 'body', 'complete',
   'cookies', 'httpVersion', 'ip', 'method', 'originalUrl', 'params',
   'path', 'protocol', 'query', 'rawHeaders', 'url' */
  res, /* Objeto Response de dynlib con los siguientes metodos: end, finished,
    headersSent, send, set, status, write */
}

// Los siguientes miembros de ctx son globales tambien:
doc
dSession
folder
mainlib
mlib // Alias del anterior
res
```

## Módulos mjs y setContext

En el cliente, los módulos mjs tienen acceso a las variables globales, en Node no. Por esto es necesario incluir un método que setee el contexto:

```javascript
/** @type Context */
var ctx;
/** @type {import('./_types/doorsapi2.mjs').Session} */
var dSession;
/** @type {import('./_types/doorsapi2.mjs').Document} */
var doc;
/** @type {import('./_types/doorsapi2.mjs').Folder} */
var folder;

export async function setContext(context) {
  ctx = context;
  dSession = context.dSession;
  doc = context.doc;
  folder = context.folder;
}
```

Que se llama a continuación del import:

```javascript
var myMod = await mlib.gitImport({ repo: 'myRepo', path: 'my/path.mjs' });
await myMod.setContext(ctx);
```

Ing Jorge Pagano - Cloudy CRM
