# Fluye Client SDK

SDK JavaScript para Fluye y Doors. Node.js y browser.

## Arquitectura

| Archivo | Rol | Uso tipico |
|---------|-----|------------|
| `client.mjs` | Meta-sesion Fluye (portal, Cognito, instancias) | Browser portal |
| `doorsClient.mjs` | Sesion contra una instancia Doors | Scripts Node.js |

`client.mjs` re-exporta `Session` de `doorsClient.mjs` (backward compatible).

## Inicializacion

```javascript
// Node.js
import { Session } from './doorsClient.mjs';
const session = new Session();
session.serverUrl = 'https://tu-servidor.cloudycrm.net/restful';
await session.logon('usuario', 'password', 'instancia');
// ... trabajo ...
await session.logoff();

// Browser (sesion existente)
const session = new Session();
await session.webSession();  // Toma serverUrl y authToken de cookies

// Portal Fluye (browser)
import { Fluye } from './client.mjs';
let fluye = new Fluye({ token: cognitoIdToken });
let doorsSession = await fluye.connect(instanceId);
```

## Object Model

```
Session
 +-- folder(id|path) -> Folder
 |    +-- search(options) -> Object[]
 |    +-- doc(id|formula) -> Document
 |    +-- documentsNew() -> Document
 |    +-- folders() -> CIMap<Folder>
 |    +-- form -> Form
 +-- doc(id) -> Document
 |    +-- fields(name) -> Field
 |    +-- attachments() -> CIMap<Attachment>
 |    +-- save() / delete()
 +-- directory -> Directory
 +-- db -> Database
 +-- utils -> Utilities
```

## Session

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `serverUrl` | string | URL REST (set antes de logon) |
| `authToken` | string | Token (read-only post logon) |
| `currentUser` | Promise\<User\> | Usuario logueado |
| `isLogged` | Promise\<boolean\> | Estado de sesion |
| `directory` / `dir` | Directory | Cuentas/usuarios |
| `db` | Database | Acceso a BD |
| `utils` | Utilities | Funciones auxiliares |

| Metodo | Descripcion |
|--------|-------------|
| `logon(login, pwd, instance, liteMode?)` | Autenticar |
| `logoff()` | Cerrar sesion |
| `webSession()` | Tomar sesion del browser |
| `folder(id\|path)` | Obtener carpeta |
| `doc(id)` | Obtener documento |
| `settings(name, value?)` | Leer/escribir settings |
| `userSettings(name, value?)` | Settings de usuario |
| `tags(key?, value?)` | Leer/escribir tags de sesion |

## Folder

| Propiedad | Tipo |
|-----------|------|
| `id` | number (FLD_ID) |
| `name` / `path` | string |
| `formId` | number (FRM_ID) |

**search(options)** -- Retorna **Array directo** (NO `{ rows }`). Propiedades en **MAYUSCULAS**.

```javascript
const docs = await folder.search({
    fields: 'DOC_ID,NOMBRE,FECHA',   // * = todos
    formula: "ESTADO = 'Activo'",    // filtro SQL
    order: 'FECHA DESC',
    maxDocs: 1000,                   // 0 = sin limite
    recursive: false,
    maxTextLen: 100,
});
// docs[0].NOMBRE
```

| Metodo | Descripcion |
|--------|-------------|
| `searchGroups({ groups, totals, formula })` | Busqueda agrupada |
| `doc(id)` / `doc("EMAIL = 'x'")` | Obtener por DOC_ID o formula (debe retornar 1) |
| `documentsNew()` | Crear documento nuevo |
| `documentsDelete(ids[]\|formula)` | Borrar documentos |
| `folders(name?)` | Subcarpetas (CIMap) |
| `parent` | Carpeta padre |
| `form` | Formulario asociado |

## Document

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `id` | number | DOC_ID |
| `isNew` | boolean | No guardado aun |
| `parentId` | number | FLD_ID |
| `ownerId` | number | ACC_ID del creador |
| `created` / `modified` | Date | Timestamps |

| Metodo | Descripcion |
|--------|-------------|
| `fields(name?)` | Sin args: CIMap\<Field\>. Con nombre: Field especifico |
| `save()` | Guardar cambios |
| `delete(purge?)` | Borrar. `true` = sin papelera |
| `attachments(name?)` | CIMap\<Attachment\> o uno especifico |
| `attachmentsAdd(filename)` | Crear adjunto (setear `.fileStream`, luego `doc.save()`) |
| `acl()` / `aclGrant(accId, perm)` / `aclRevoke(accId, perm)` | Permisos: read/modify/delete/admin |
| `properties(name, value?)` | Leer/escribir metadatos |

## Field

| Propiedad | Tipo | Descripcion |
|-----------|------|-------------|
| `name` | string | Nombre del campo |
| `value` | any | Valor actual (get/set) |
| `valueOld` | any | Valor al cargar |
| `valueChanged` | boolean | Si cambio |
| `valueEmpty` | boolean | null/undefined/'' |
| `type` | number | 1=String, 2=DateTime, 3=Numeric |
| `length` / `precision` / `scale` | number | Limites del campo |
| `updatable` / `nullable` / `computed` | boolean | Metadatos |
| `label` | string | Description o Name capitalizado |

Validacion automatica al asignar `.value` (overflow si excede length/precision). Fechas: acepta Date, moment, string ISO.

## Attachment

| Propiedad | Tipo |
|-----------|------|
| `id` / `name` / `extension` / `size` / `created` / `isNew` | Standard |
| `fileStream` | ArrayBuffer (get) / ArrayBuffer\|Blob\|Buffer (set) |

Crear: `doc.attachmentsAdd('file.pdf')` -> setear `.fileStream` -> `doc.save()`. Borrar: `att.delete()`.

## Directory

```javascript
const dir = session.directory;
const accounts = await dir.accountsSearch("NAME LIKE 'Admin%'");
const acc = await dir.accounts(accId);   // acc.id, acc.name, acc.email
const user = await dir.users(accId);     // user.login, user.isAdmin
```

## Utilities (`session.utils`)

| Metodo | Descripcion |
|--------|-------------|
| `cDate(str, format?)` | Parsear fecha. `'L'` = locale |
| `cNum(str)` | Parsear numero (respeta locale) |
| `cBool(val)` | Parsear boolean |
| `cache(key, value?, ttl?)` | Cache local por sesion (ttl en segundos) |
| `encUriC(text)` | encodeURIComponent |
| `asyncLoop(n, fn)` | Loop asincronico con `loop.next()` / `loop.break()` |
| `moment` / `numeral` / `CryptoJS` | Librerias incluidas |

## Gotchas

- `folder.search()` retorna **Array directo**, NO `{ rows }`. Propiedades en **MAYUSCULAS**.
- `sqlserver.mjs execSql()` retorna `{ rows, metadata }` -- API diferente.
- Siempre cerrar sesion con `session.logoff()`.
- `doc.fields('X').value = val` valida overflow automaticamente.
- `documentsNew()` crea en memoria; no existe en BD hasta `doc.save()`.
- `folder.doc("formula")` falla si la formula retorna mas de 1 documento.

---

**Ing Jorge Pagano - Cloudy CRM**
