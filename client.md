# Fluye Client SDK

SDK JavaScript para interactuar con Fluye/DoorsBPM. Funciona en Node.js y browser.

## Quick Start

### Node.js

```javascript
import { Session } from './client.mjs';

const session = new Session();
session.serverUrl = 'https://tu-servidor.cloudycrm.net/restful';
await session.logon('usuario', 'password', 'instancia');

// Buscar documentos
const folder = await session.folder(1234);  // Por FLD_ID
const docs = await folder.search({ fields: 'DOC_ID,NOMBRE,EMAIL', formula: "ESTADO = 'Activo'" });
console.log(docs);  // Array de objetos con propiedades MAYÚSCULAS

// Crear documento
const doc = await folder.documentsNew();
doc.fields('NOMBRE').value = 'Juan Pérez';
doc.fields('EMAIL').value = 'juan@email.com';
await doc.save();

await session.logoff();
```

### Browser (con sesión existente)

```javascript
import { Session } from './client.mjs';

const session = new Session();
await session.webSession();  // Toma serverUrl y authToken del browser

const user = await session.currentUser;
console.log('Logged as:', user.name);
```

---

## Object Model

```
Session
├── folder(id|path) → Folder
│   ├── search(options) → Object[]
│   ├── doc(id) → Document
│   ├── documentsNew() → Document
│   ├── folders() → CIMap<Folder>
│   └── form → Form
│       └── fields(name) → Field
├── doc(id) → Document
│   ├── fields(name) → Field
│   ├── attachments() → CIMap<Attachment>
│   ├── save()
│   └── delete()
├── directory → Directory
│   ├── accounts(id) → Account
│   └── users(id) → User
├── currentUser → User
├── db → Database
└── utils → Utilities
```

---

## Session

Punto de entrada principal. Maneja autenticación y acceso a objetos.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `serverUrl` | string | URL del servidor REST (set antes de logon) |
| `authToken` | string | Token de sesión (read-only después de logon) |
| `currentUser` | Promise\<User\> | Usuario logueado |
| `isLogged` | Promise\<boolean\> | Estado de sesión |
| `directory` / `dir` | Directory | Acceso a cuentas/usuarios |
| `db` | Database | Acceso a base de datos |
| `utils` | Utilities | Funciones auxiliares |

### Métodos

```javascript
// Autenticación
await session.logon(login, password, instance, liteMode?)
await session.logoff()
await session.webSession()  // Solo browser: toma sesión de cookies

// Acceso a objetos
await session.folder(1234)           // Por FLD_ID
await session.folder('/Ventas/2024') // Por path
await session.doc(56789)             // Por DOC_ID

// Settings
await session.settings('SETTING_NAME')           // Leer
await session.settings('SETTING_NAME', 'value')  // Escribir
await session.userSettings('USER_SETTING')       // Settings de usuario

// Tags de sesión
await session.tags()             // Todos los tags
await session.tags('key')        // Valor de un tag
await session.tags('key', 'val') // Setear tag
```

---

## Folder

Representa una carpeta del sistema.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | FLD_ID |
| `name` | string | Nombre |
| `path` | string | Path completo |
| `formId` | number | FRM_ID del formulario asociado |
| `description` | string | Descripción |
| `session` | Session | Sesión padre |

### Métodos principales

```javascript
// Búsqueda - ⚠️ Retorna Array directo (no { rows })
const docs = await folder.search({
    fields: 'DOC_ID,NOMBRE,FECHA',  // Campos a traer (* = todos)
    formula: "ESTADO = 'Activo'",   // Filtro SQL
    order: 'FECHA DESC',            // Ordenamiento
    maxDocs: 1000,                  // Límite (0 = sin límite)
    recursive: false,               // Buscar en subcarpetas
    maxTextLen: 100,                // Largo máx de textos
});
// docs[0].NOMBRE ← propiedades en MAYÚSCULAS

// Búsqueda agrupada
const grupos = await folder.searchGroups({
    groups: 'ESTADO,VENDEDOR',
    totals: 'count(*) as TOTAL, sum(MONTO) as SUMA',
    formula: "FECHA >= '2024-01-01'",
});

// Documentos
const doc = await folder.doc(56789);           // Por DOC_ID
const doc = await folder.doc("EMAIL = 'x'");   // Por fórmula (debe retornar 1)
const newDoc = await folder.documentsNew();    // Crear nuevo
await folder.documentsDelete([1, 2, 3]);       // Borrar varios
await folder.documentsDelete("ESTADO = 'X'");  // Borrar por fórmula

// Navegación
const parent = await folder.parent;
const subs = await folder.folders();           // Subcarpetas (CIMap)
const sub = await folder.folders('Nombre');    // Subcarpeta específica

// Formulario
const form = await folder.form;
```

---

## Document

Representa un documento (registro).

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | DOC_ID |
| `isNew` | boolean | Si es nuevo (no guardado) |
| `parentId` | number | FLD_ID de la carpeta |
| `parent` | Promise\<Folder\> | Carpeta contenedora |
| `ownerId` | number | ACC_ID del creador |
| `owner` | Promise\<User\> | Usuario creador |
| `created` | Date | Fecha de creación |
| `modified` | Date | Fecha de modificación |
| `session` | Session | Sesión padre |

### Métodos principales

```javascript
// Campos
doc.fields('NOMBRE').value = 'Nuevo valor';
const nombre = doc.fields('NOMBRE').value;
const changed = doc.fields('NOMBRE').valueChanged;  // ¿Cambió desde que se cargó?
const empty = doc.fields('NOMBRE').valueEmpty;      // ¿Es null/undefined/''?

// Todos los campos
const fieldsMap = doc.fields();  // CIMap<Field>
for (const [name, field] of fieldsMap) {
    console.log(name, field.value);
}

// Guardar y borrar
await doc.save();
await doc.delete();
await doc.delete(true);  // purge (sin pasar por papelera)

// Adjuntos
const atts = await doc.attachments();           // CIMap<Attachment>
const att = await doc.attachments('archivo.pdf');

// Crear adjunto
const att = doc.attachmentsAdd('nuevo.pdf');
att.fileStream = buffer;  // ArrayBuffer, Blob, Buffer
await doc.save();         // Se guarda con el documento

// Permisos (ACL)
const acl = await doc.acl();
await doc.aclGrant(accId, 'read');    // read/modify/delete/admin
await doc.aclRevoke(accId, 'modify');

// Properties (metadatos)
const prop = await doc.properties('PROP_NAME');
await doc.properties('PROP_NAME', 'value');
```

---

## Field

Representa un campo de un documento.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `name` | string | Nombre del campo |
| `value` | any | Valor actual |
| `valueOld` | any | Valor original (al cargar) |
| `valueChanged` | boolean | Si cambió respecto a valueOld |
| `valueEmpty` | boolean | Si es null/undefined/'' |
| `type` | number | 1=String, 2=DateTime, 3=Numeric |
| `length` | number | Largo máximo (strings) |
| `precision` | number | Precisión (numéricos) |
| `scale` | number | Escala decimal (numéricos) |
| `updatable` | boolean | Si se puede modificar |
| `nullable` | boolean | Si acepta null |
| `computed` | boolean | Si es campo calculado |
| `description` | string | Descripción del campo |
| `label` | string | Description o Name capitalizado |

### Uso

```javascript
// Leer
const val = doc.fields('NOMBRE').value;

// Escribir (valida automáticamente)
doc.fields('NOMBRE').value = 'Texto';     // String overflow si excede length
doc.fields('MONTO').value = 1234.56;      // Numeric overflow si excede precision
doc.fields('FECHA').value = new Date();   // Acepta Date, moment, string ISO
doc.fields('FECHA').value = '2024-03-15';

// Verificar cambios
if (doc.fields('EMAIL').valueChanged) {
    console.log('Email cambió de', doc.fields('EMAIL').valueOld, 'a', doc.fields('EMAIL').value);
}
```

---

## Attachment

Representa un archivo adjunto.

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `id` | number | ATT_ID |
| `name` | string | Nombre del archivo |
| `extension` | string | Extensión |
| `size` | number | Tamaño en bytes |
| `created` | Date | Fecha de creación |
| `isNew` | boolean | Si es nuevo (no guardado) |
| `parent` | Document | Documento contenedor |

### Métodos

```javascript
// Leer contenido
const buffer = await att.fileStream;  // ArrayBuffer

// Crear adjunto nuevo
const att = doc.attachmentsAdd('archivo.pdf');
att.fileStream = arrayBuffer;  // o Blob, Buffer
att.description = 'Descripción opcional';
await doc.save();

// Borrar
await att.delete();
```

---

## Utilities

Funciones auxiliares en `session.utils`.

```javascript
const utils = session.utils;

// Conversiones de tipo
utils.cDate('2024-03-15')        // → Date
utils.cDate('15/03/2024', 'L')   // → Date (formato locale)
utils.cNum('1.234,56')           // → 1234.56 (respeta locale)
utils.cBool('true')              // → true
utils.cBool(1)                   // → true

// Cache local (por sesión)
utils.cache('key', value, 60);   // Guardar por 60 segundos
const val = utils.cache('key');  // Obtener (undefined si expiró)

// Encoding
utils.encUriC(text)              // encodeURIComponent

// Loop asíncrono
await utils.asyncLoop(10, async (loop) => {
    console.log('Iteración', loop.iteration());
    // await operacionAsincrona();
    loop.next();  // o loop.break() para salir
});

// Librerías incluidas
utils.moment        // moment-timezone
utils.numeral       // numeral.js
utils.CryptoJS      // crypto-js
```

---

## Directory

Acceso a cuentas y usuarios.

```javascript
const dir = session.directory;

// Buscar cuentas
const accounts = await dir.accountsSearch("NAME LIKE 'Admin%'");

// Obtener cuenta/usuario
const acc = await dir.accounts(accId);
const user = await dir.users(accId);  // Solo si es usuario

// Propiedades de Account/User
acc.id       // ACC_ID
acc.name     // Nombre de la cuenta
acc.email    // Email
user.login   // Login del usuario
user.isAdmin // Si es admin
```

---

## Tips y Patrones Comunes

### Iterar campos modificados

```javascript
for (const [name, field] of doc.fields()) {
    if (field.valueChanged && field.updatable) {
        console.log(`${name}: ${field.valueOld} → ${field.value}`);
    }
}
```

### Copiar documento entre carpetas

```javascript
const srcDoc = await srcFolder.doc(docId);
const dstDoc = await dstFolder.documentsNew();

for (const [name, srcField] of srcDoc.fields()) {
    if (srcField.custom && !srcField.valueEmpty) {
        try {
            dstDoc.fields(name).value = srcField.value;
        } catch (e) { /* Campo no existe en destino */ }
    }
}
await dstDoc.save();
```

### Buscar y procesar en batch

```javascript
const docs = await folder.search({ fields: 'DOC_ID', formula: "ESTADO = 'Pendiente'" });

for (const row of docs) {
    const doc = await folder.doc(row.DOC_ID);
    doc.fields('ESTADO').value = 'Procesado';
    await doc.save();
}
```

---

**Ing Jorge Pagano - Fluye**
