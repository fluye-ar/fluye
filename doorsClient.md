# Fluye Client SDK (doorsClient.mjs)

SDK JavaScript para Fluye/Doors. Node.js y browser.

## Qué usar para cada cosa

| Necesitás... | Usá | Ejemplo |
|-------------|-----|---------|
| Contar documentos | `folder.searchGroups` | `searchGroups({ groups: 'FLD_ID', totals: 'count(*) as total', formula: "STATE = 'Abierta'" })` |
| Listar documentos de una carpeta | `folder.search` | `search({ fields: 'DOC_ID,NOMBRE', formula: "ESTADO = 'Activo'", order: 'CREATED DESC' })` |
| Agrupar y sumar | `folder.searchGroups` | `searchGroups({ groups: 'RESPONSIBLE', totals: 'count(*) as cant, sum(VALUE) as monto' })` |
| Leer/editar un documento | `folder.doc` + `.fields` | `const doc = await folder.doc(id); doc.fields('CAMPO').value = 'nuevo'; await doc.save();` |
| Crear un documento | `folder.documentsNew` | `const doc = await folder.documentsNew(); doc.fields('NOMBRE', 'Test'); await doc.save();` |
| Ver quién cambió un campo | `db.openRecordset` + SYS_DOC_LOG | `db.openRecordset("SELECT ... FROM SYS_DOC_LOG WHERE DOC_ID = X AND FIELD = 'Y'")` |
| Datos de varias tablas (JOINs) | `db.openRecordset` | `db.openRecordset("SELECT d.*, f.NOMBRE FROM SYS_DOCUMENTS d JOIN SYS_FIELDS_307 f ...")` |
| Buscar usuarios/cuentas | `directory.accountsSearch` | `dir.accountsSearch("NAME LIKE '%Juan%'")` |
| Leer/escribir config de instancia | `fdSession.settings` | `settings('MI_SETTING')` o `settings('MI_SETTING', 'valor')` |
| Leer/escribir config de carpeta | `folder.properties` | `folder.properties('MI_PROP')` o `folder.properties('MI_PROP', 'valor')` |

## Inicializacion

```javascript
// Node.js
import { Session } from './doorsClient.mjs';
const fdSession = new Session();
fdSession.serverUrl = 'https://instancia.cloudycrm.net/restful';
await fdSession.logon('usuario', 'password', 'instancia');
// ... trabajo ...
await fdSession.logoff();

// Browser (sesion existente)
const fdSession = new Session();
await fdSession.webSession();  // Toma serverUrl y authToken de cookies
```

## Object Model

```
Session (fdSession)
 +-- folder(id|path) -> Folder
 |    +-- search(options) -> Object[]
 |    +-- searchGroups(options) -> Object[]
 |    +-- doc(id|formula) -> Document
 |    +-- documentsNew() -> Document
 |    +-- fields() -> CIMap<Field>
 |    +-- properties(name, value?) / userProperties(name, value?)
 +-- doc(id) -> Document
 |    +-- fields(name) -> Field (.value get/set)
 |    +-- save() / delete()
 |    +-- log() -> Object[]  (audit trail SYS_DOC_LOG)
 |    +-- attachments() -> CIMap<Attachment>
 |    +-- properties(name, value?)
 +-- db -> Database
 |    +-- openRecordset(sql) -> Object[]  (SELECT directo a BD)
 |    +-- execute(sql) -> number  (INSERT/UPDATE/DELETE)
 +-- directory -> Directory
 +-- settings(name, value?) / userSettings(name, value?)
```

## Session

| Metodo | Descripcion |
|--------|-------------|
| `logon(login, pwd, instance, liteMode?)` | Iniciar sesion. Retorna authToken |
| `logoff()` | Cerrar sesion |
| `webSession()` | Tomar sesion del browser (cookies) |
| `folder(id\|path)` | Obtener carpeta. Cache 60s |
| `doc(id)` | Obtener documento por DOC_ID |
| `settings(name, value?)` | Leer/escribir setting de instancia |
| `userSettings(name, value?)` | Setting del usuario logueado |
| `import({ repo, path, fresh? })` | Importar modulo dinamico |
| `currentUser` | Promise\<User\> — usuario logueado |
| `isLogged` | Promise\<boolean\> |
| `directory` / `dir` | Acceso a cuentas/usuarios |
| `db` | Acceso a base de datos (SQL directo) |
| `node` | Ejecucion de codigo en servidor |

## Folder

### search(options) — Busqueda de documentos

Retorna **Array directo** (NO `{ rows }`). Propiedades en **MAYUSCULAS**.

```javascript
const folder = await fdSession.folder(4196);
const docs = await folder.search({
    fields: 'DOC_ID,NOMBRE,ESTADO',  // campos separados por coma, * = todos
    formula: "ESTADO = 'Activo'",    // WHERE SQL
    order: 'CREATED DESC',           // ORDER BY
    maxDocs: 50,                     // default 1000, 0 = sin limite
    maxTextLen: 100,                 // truncar textos, 0 = sin limite
});
// docs[0].NOMBRE, docs[0].ESTADO (MAYUSCULAS)
```

### searchGroups(options) — Busqueda agrupada

Retorna Array con campos de grupo + totales en **MAYUSCULAS**. Eficiente para contar sin traer docs.

```javascript
// Contar documentos
const count = await folder.searchGroups({
    groups: 'FLD_ID',                    // GROUP BY (campo dummy para count total)
    totals: 'count(*) as total',         // agregados SQL
    formula: "STATE = 'Abierta'"         // WHERE
});
// count[0].TOTAL → 114

// Agrupar por vendedor con suma
const ventas = await folder.searchGroups({
    groups: 'RESPONSIBLE',
    totals: 'count(*) as cantidad, sum(VALUE) as monto',
    formula: "RESULT = 'Ganada' AND ENDDATE >= '2026-04-01' AND ENDDATE < '2026-05-01'",
    order: 'cantidad desc'
});
// ventas → [{ RESPONSIBLE: "Juan", CANTIDAD: 15, MONTO: 50000 }, ...]
```

Parametros: `{ groups, totals, formula, order, maxDocs, recursive, groupsOrder, totalsOrder }`

### Otros metodos de Folder

| Metodo | Descripcion |
|--------|-------------|
| `doc(id)` | Documento por DOC_ID |
| `doc("CAMPO = 'x'")` | Documento por formula (debe retornar exactamente 1) |
| `documentsNew()` / `newDoc()` | Crear documento nuevo (en memoria, sin DOC_ID hasta save) |
| `documentsDelete(ids[]\|formula, purge?)` | Borrar. purge=true sin papelera |
| `folders(name?)` | Subcarpetas (CIMap) |
| `fields(name?)` | Campos del formulario (async, CIMap\<Field\>) |
| `properties(name, value?)` | Properties de carpeta (leer/escribir) |
| `userProperties(name, value?)` | Properties por usuario |
| `views(name?)` | Vistas de la carpeta |

Propiedades: `id` (FLD_ID), `name`, `path`, `formId` (FRM_ID), `parentId`, `description`

## Document

### Campos

```javascript
const doc = await folder.doc(12345);

// Leer
const nombre = doc.fields('NOMBRE').value;

// Escribir
doc.fields('ESTADO').value = 'Cerrado';

// Shortcut: set directo
doc.fields('ESTADO', 'Cerrado');

// Iterar todos
const fields = doc.fields();  // CIMap
for (let [name, field] of fields) {
    console.log(name, field.value, field.type);
}
```

### Crear documento

```javascript
const doc = await folder.documentsNew();
doc.fields('NOMBRE', 'Nuevo registro');
await doc.save();
console.log(doc.id);  // DOC_ID asignado
```

### Guardar, borrar, log

```javascript
await doc.save();          // Guarda cambios + attachments, triggerea sync events
await doc.delete();        // A papelera
await doc.delete(true);    // Borrado permanente

// Audit log (SYS_DOC_LOG) — historial de cambios del documento
const log = await doc.log();
// → [{ Date, Field, OldValue, NewValue, Account, ... }]
```

### Permisos (ACL)

```javascript
await doc.acl();                        // Lista permisos (propios + heredados)
await doc.aclGrant(accId, 'read');      // Otorgar: read / modify / delete / admin
await doc.aclRevoke(accId, 'modify');   // Revocar permiso especifico
await doc.aclRevokeAll(accId);          // Revocar todos los permisos de una cuenta
await doc.aclRevokeAll();               // Revocar todos los permisos de todas las cuentas
await doc.aclInherits(true);            // Activar/desactivar herencia
```

Propiedades: `id` (DOC_ID), `parentId` (FLD_ID), `ownerId` (ACC_ID), `formId`, `isNew`, `created`, `modified`

## Field

| Propiedad | Descripcion |
|-----------|-------------|
| `name` | Nombre del campo |
| `value` | Valor actual (get/set con validacion) |
| `valueOld` | Valor al cargar |
| `valueChanged` | boolean — si cambio |
| `valueEmpty` | boolean — null/undefined/'' |
| `type` | 1=String, 2=DateTime, 3=Numeric |
| `length` | Max length (strings) |
| `precision` / `scale` | Para DECIMAL |
| `updatable` | boolean — false si computed |
| `nullable` | boolean |
| `label` | Etiqueta del campo |

Validacion automatica al asignar `.value` (overflow string, precision numerica, nullable, updatable).

## Database — SQL directo

Para queries que no se pueden hacer con folder.search (ej: JOINs entre tablas, SYS_DOC_LOG, SYS_ACCOUNTS, etc.).

```javascript
const db = fdSession.db;

// SELECT — retorna Array de objetos
const rows = await db.openRecordset("SELECT TOP 10 * FROM SYS_FOLDERS");
// rows[0].FLD_ID, rows[0].NAME (propiedades del resultado SQL)

// INSERT/UPDATE/DELETE — retorna filas afectadas
const affected = await db.execute("UPDATE SYS_FIELDS_307 SET STATE='Cerrada' WHERE DOC_ID = 12345");

// Siguiente valor de secuencia
const nextId = await db.nextVal('SEQ_DOCUMENTS');

// Encodear valores para SQL (prevenir injection)
db.sqlEnc('O\'Brien', 1);   // → 'O''Brien'  (type 1=char)
db.sqlEnc(new Date(), 2);   // → '2026-05-14' (type 2=date)
db.sqlEnc(42.5, 3);         // → '42.5'       (type 3=number)
db.sqlEnc(null, 1);         // → 'NULL'
```

### Ejemplos con SYS_DOC_LOG

```javascript
// Historial de cambios de un campo en un documento
const log = await db.openRecordset(`
    SELECT LOG_DATE, FIELD, OLD_VALUE, NEW_VALUE, a.NAME as ACCOUNT
    FROM SYS_DOC_LOG l
    INNER JOIN SYS_ACCOUNTS a ON l.ACC_ID = a.ACC_ID
    WHERE l.DOC_ID = 12345 AND l.FIELD = 'RESPONSIBLEID'
    ORDER BY LOG_DATE DESC
`);

// Ultimas asignaciones de opps libres (RESPONSIBLEID cambio de 1247 a otro)
const asignaciones = await db.openRecordset(`
    SELECT TOP 20 l.DOC_ID, l.LOG_DATE, l.OLD_VALUE, l.NEW_VALUE, a.NAME as EJECUTIVO
    FROM SYS_DOC_LOG l
    INNER JOIN SYS_ACCOUNTS a ON l.ACC_ID = a.ACC_ID
    WHERE l.FIELD = 'RESPONSIBLEID' AND l.OLD_VALUE = '1247'
    ORDER BY l.LOG_DATE DESC
`);
```

### Ejemplos con tablas del sistema

```javascript
// Buscar cuenta por nombre
const acc = await db.openRecordset("SELECT ACC_ID, NAME, EMAIL FROM SYS_ACCOUNTS WHERE NAME LIKE '%Victoria%'");

// Campos de un formulario
const fields = await db.openRecordset("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'SYS_FIELDS_307'");
```

## Directory

```javascript
const dir = fdSession.directory;

// Buscar cuentas
const cuentas = await dir.accountsSearch("NAME LIKE 'Admin%'");
// → [{ AccId, Name, Email, ... }]  (cache 60s)

// Obtener cuenta
const acc = await dir.accounts(123);     // por ACC_ID
const acc = await dir.accounts('Juan');  // por nombre
// acc.id, acc.name, acc.email, acc.type (1=User, 2=Group)

// Email formateado
const email = await dir.accountEmail('Juan');
// → "Juan Perez" <juan@example.com>

// Crear cuenta
const user = await dir.accountsNew(1);  // 1=User, 2=Group
```

## Node (ejecucion server-side)

```javascript
// Ejecutar codigo en el servidor
const result = await fdSession.node.exec({
    code: { owner: 'fluye-ar', repo: 'fluye-lib', path: 'server/helpers.js' },
    payload: { data: 'test' },
    doc: docId,      // opcional: inyectar documento
    folder: folderId // opcional: inyectar carpeta
});

// Llamar metodo de un modulo
const result = await fdSession.node.modCall({
    module: { repo: 'fluye-lib', path: 'server/validators.mjs' },
    method: 'validateEmail',
    args: ['test@example.com']
});
```

## Utilities

```javascript
const utils = fdSession.utils;

utils.cDate(str, format?)     // Parsear fecha (Date, moment, ISO)
utils.cNum(str)               // Parsear numero
utils.cBool(val)              // Parsear boolean
utils.today()                 // Fecha actual sin hora (para campos)
utils.isoDate(date)           // 'YYYY-MM-DD'
utils.lZeros(val, len)        // Left-pad con ceros
utils.cache(key, value?, ttl?) // Cache por sesion (def 300s)
utils.getGuid()               // UUID v4
utils.encUriC(text)           // encodeURIComponent seguro
utils.htmlEncode(text)        // HTML entities
utils.encrypt(str) / decrypt(str) // AES via CryptoJS
utils.moment                  // moment-timezone
utils.numeral                 // numeral.js
utils.CryptoJS                // crypto-js
```

## Gotchas

- `folder.search()` retorna **Array directo**, NO `{ rows }`. Propiedades en **MAYUSCULAS**.
- `searchGroups()` retorna Array con totales en **MAYUSCULAS** (`TOTAL`, `CANTIDAD`, etc.)
- `db.openRecordset()` retorna **Array de objetos** con las propiedades del SELECT.
- `documentsNew()` crea en memoria — no tiene DOC_ID hasta `doc.save()`.
- `doc.fields('X').value = val` valida overflow automaticamente.
- `folder.doc("formula")` falla si retorna mas de 1 documento.
- **NO existe** `fdSession.sql()`, `fdSession.query()`, `fdSession.getDB()`. Usar `fdSession.db.openRecordset()`.
- **NO importar** modulos con paths de disco (`import('/Users/...')`). En browser no funciona.
- Fechas SQL: formato `'YYYY-MM-DD'`. Funciones SQL Server: `YEAR()`, `MONTH()`, `GETDATE()`, `CONVERT()`.
- **SIEMPRE** usar `db.sqlEnc()` para valores en SQL dinamico (prevenir injection).
- `doc.log()` retorna el audit log de UN documento. Para queries masivas de SYS_DOC_LOG, usar `db.openRecordset()`.
- **SYS_DOC_LOG:** los campos OLD_VALUE y NEW_VALUE son tipo `text`. NO usar `=` para comparar, usar `CAST(OLD_VALUE AS VARCHAR(100)) LIKE '1247'`. La columna de fecha es `LOG_DATE` (no MODIFIED). JOIN con `SYS_ACCOUNTS` por `ACC_ID` para el nombre.

---

**Jorge Pagano - Fluye**
