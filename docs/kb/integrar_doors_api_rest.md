# Integrar Doors usando la API Rest

Guía para leer y escribir información en Doors mediante la API REST.

**Fuente Notion:** KB Desarrollo → `09830daf-7962-4dc0-a282-353a507b88af`

---

## 1. JavaScript Vanilla (fetch)

Para cualquier lenguaje que soporte HTTP + JSON.

### Iniciar sesión

```javascript
const serverUrl = 'https://mi-servidor.cloudycrm.net/restful';

async function logon(user, password, instance) {
    const res = await fetch(`${serverUrl}/session/logon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginName: user, password: password, instanceName: instance })
    });
    if (!res.ok) throw new Error(`Logon failed: ${res.statusText}`);
    const data = await res.json();
    return data.InternalObject; // authToken
}
```

### Buscar documentos

```javascript
async function search(authToken, fldId, { fields = '', formula = '', order = '', maxDocs = 1000, maxTextLen = 100 } = {}) {
    const enc = v => v == null ? '' : encodeURIComponent(v);
    const url = `${serverUrl}/folders/${fldId}/documents?fields=${enc(fields)}&formula=${enc(formula)}&order=${enc(order)}&maxDocs=${enc(maxDocs)}&maxDescrLength=${enc(maxTextLen)}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'AuthToken': authToken }
    });
    if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
    const data = await res.json();
    return data.InternalObject; // Array de documentos
}
```

### Crear documento nuevo

```javascript
async function createDoc(authToken, fldId) {
    const res = await fetch(`${serverUrl}/folders/${fldId}/documents/new`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'AuthToken': authToken }
    });
    if (!res.ok) throw new Error(`Create failed: ${res.statusText}`);
    const data = await res.json();
    return data.InternalObject; // Documento nuevo (no guardado)
}
```

### Modificar campos y guardar

```javascript
// Leer un campo
const docId = doc.CustomFields.find(f => f.Name === 'DOC_ID').Value;

// Escribir campos
doc.CustomFields.find(f => f.Name === 'CLIENTE').Value = 'Juan Pérez';
doc.CustomFields.find(f => f.Name === 'ESTADO').Value = 'Activo';

// Guardar
async function saveDoc(authToken, doc) {
    const res = await fetch(`${serverUrl}/documents`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'AuthToken': authToken },
        body: JSON.stringify({ document: doc })
    });
    if (!res.ok) throw new Error(`Save failed: ${res.statusText}`);
    const data = await res.json();
    return data.InternalObject;
}
```

### Cerrar sesión

```javascript
async function logoff(authToken) {
    await fetch(`${serverUrl}/session/logoff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'AuthToken': authToken }
    });
}
```

### Ejemplo completo (vanilla)

```javascript
async function main() {
    const authToken = await logon('mi_usuario', '***', 'mi_instancia');
    try {
        const results = await search(authToken, 1234, {
            fields: 'DOC_ID, SUBJECT, ESTADO',
            formula: "ESTADO = 'Activo'",
            order: 'CREATED DESC',
            maxDocs: 100
        });
        console.log('Encontrados:', results.length);

        let doc = await createDoc(authToken, 1234);
        doc.CustomFields.find(f => f.Name === 'CLIENTE').Value = 'Juan Pérez';
        doc.CustomFields.find(f => f.Name === 'ESTADO').Value = 'Nuevo';
        doc = await saveDoc(authToken, doc);
        console.log('Creado DOC_ID:', doc.CustomFields.find(f => f.Name === 'DOC_ID').Value);
    } finally {
        await logoff(authToken);
    }
}

main();
```

---

## 2. Fluye doorsClient (Node.js)

El SDK simplifica todo lo anterior. Se puede usar en el browser o node.

```javascript
import { Session } from '../fluye/doorsClient.mjs';

const fdSession = new Session();
fdSession.serverUrl = 'https://mi-servidor.cloudycrm.net/restful';
await fdSession.logon('mi_usuario', '***', 'mi_instancia');

try {
    const folder = await fdSession.folder(1234);

    // Buscar — retorna Array directo, propiedades MAYUSCULAS
    const results = await folder.search({
        fields: 'DOC_ID, SUBJECT, ESTADO',
        formula: "ESTADO = 'Activo'",
        order: 'CREATED DESC',
        maxDocs: 100,
        maxTextLen: 0
    });
    console.log('Encontrados:', results.length);
    console.log('Primero:', results[0].SUBJECT);

    // Crear documento nuevo
    let doc = await folder.documentsNew();
    doc.fields('CLIENTE').value = 'Juan Pérez';
    doc.fields('ESTADO').value = 'Nuevo';
    await doc.save();
    console.log('Creado DOC_ID:', doc.id);

    // Modificar existente por DOC_ID
    let existing = await folder.doc(567890);
    existing.fields('ESTADO').value = 'Procesado';
    await existing.save();

    // Modificar existente por formula (debe retornar 1 doc)
    let byEmail = await folder.doc("EMAIL = 'juan@test.com'");
    byEmail.fields('ESTADO').value = 'Contactado';
    await byEmail.save();

} finally {
    await fdSession.logoff();
}
```

### Diferencias clave

| Aspecto | Vanilla (fetch) | Fluye doorsClient |
|---------|----------------|-------------------|
| Campos | `doc.CustomFields.find(f => f.Name === 'X').Value` | `doc.fields('X').value` |
| Search | `data.InternalObject` (array) | Array directo, props MAYUSCULAS |
| Sesión | authToken manual | `fdSession.logon()` / `.logoff()` |
| Validación | Manual | Automática (overflow, tipos) |

---

## Notas

- SIEMPRE cerrar sesión con `logoff()` / `fdSession.logoff()`
- SIEMPRE usar `'***'` como placeholder de passwords
- Los campos en search retornan en MAYUSCULAS
- `maxDocs: 0` = sin límite, `maxTextLen: 0` = texto completo

---

Ing Jorge Pagano - Cloudy CRM
