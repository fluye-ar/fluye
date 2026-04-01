# Relations - JOINs en los search de Doors

**Events.v8** implementa una funcionalidad muy esperada: poder hacer JOINs en las consultas entre tablas, evitando el uso de campos calculados basados en funciones, que tienen un impacto muy negativo en la performance de la base de datos.

Las relaciones se establecen a nivel de carpeta, y permiten traer datos de otras tablas mediante un LEFT JOIN. En las pruebas de laboratorio las consultas con joins se ejecutaron en promedio unas 10 veces mas rapido que las basadas en campos calculados + funciones.

## Configuracion

Las relaciones se configuran en la **property RELATIONS** del folder. El valor es un array de objetos JSON con:

```json
[
    {
        "name": "ALIAS",
        "from": "TABLA o (subconsulta)",
        "joinOn": "ALIAS.campo = SYS_FIELDS.campo",
        "fields": ["CAMPO1", "CAMPO2"]
    }
]
```

| Propiedad | Descripcion |
|-----------|-------------|
| `name` | Nombre de la relacion. Se usa como alias SQL y prefijo de los campos agregados |
| `from` | Tabla o subconsulta de origen. Subconsultas entre parentesis |
| `joinOn` | Expresion JOIN. `SYS_FIELDS` = tabla del form, `SYS_DOCUMENTS` = tabla de documentos |
| `fields` | Opcional. Campos a traer. Si no se especifica, se traen todos |

Los campos de relacion se acceden como `{name}_{campo}`. Ej: relacion `RCLI` con campo `NOMBRE` → `RCLI_NOMBRE`.

**Tip**: Si uso el mismo prefijo en todas las relaciones (ej: `REL`), los campos aparecen juntos en los listados.

## Ejemplos

### 1. Join con tabla directa

Desde Leads, traer datos de conversaciones de WhatsApp:

```json
{
    "name": "RELWAPP",
    "from": "WAPP_RESUME",
    "joinOn": "RELWAPP.EXTPHONE = SYS_FIELDS.CELULAR and RELWAPP.INTPHONE = dbo.GetNumbers(SYS_FIELDS.WAPP_INT_PHONE)"
}
```

Agrega campos: `RELWAPP_LASTMSG`, `RELWAPP_LASTMSGTIME`, etc.

### 2. Subconsulta con agrupacion

Desde Leads, obtener fecha de ultima actividad:

```json
{
    "name": "RELACT",
    "from": "(select REFIERE_ID, max(INICIO) as FECHAULTACT from SYS_FIELDS_104 with(nolock) group by REFIERE_ID)",
    "joinOn": "RELACT.REFIERE_ID = SYS_DOCUMENTS.DOC_ID",
    "fields": ["FECHAULTACT"]
}
```

La relacion debe ser **1 a 1**. Si puede haber multiples registros, agrupar en la subconsulta para evitar multiplicar filas.

Agrega campo: `RELACT_FECHAULTACT`.

### 3. Subconsulta con join interno

Desde Leads, obtener datos de la Oportunidad relacionada:

```json
{
    "name": "RELOPP",
    "from": "(select D.DOC_ID, F.EJECUTIVO, F.ESTADO from SYS_FIELDS_106 F with(nolock) inner join SYS_DOCUMENTS D with(nolock) on F.DOC_ID = D.DOC_ID where D.FLD_ID = 1017)",
    "joinOn": "RELOPP.DOC_ID = SYS_FIELDS.OPORTUNIDAD_ID",
    "fields": ["EJECUTIVO", "ESTADO"]
}
```

El join con `SYS_DOCUMENTS` y filtro por `FLD_ID` excluye registros en papelera u otras carpetas.

Agrega campos: `RELOPP_EJECUTIVO`, `RELOPP_ESTADO`.

### Ejemplo completo (property RELATIONS del folder Leads)

```json
[
    {
        "name": "RELWAPP",
        "from": "WAPP_RESUME",
        "joinOn": "RELWAPP.EXTPHONE = SYS_FIELDS.CELULAR and RELWAPP.INTPHONE = dbo.GetNumbers(SYS_FIELDS.WAPP_INT_PHONE)"
    },
    {
        "name": "RELACT",
        "from": "(select REFIERE_ID, max(INICIO) as FECHAULTACT from SYS_FIELDS_104 with(nolock) group by REFIERE_ID)",
        "joinOn": "RELACT.REFIERE_ID = SYS_DOCUMENTS.DOC_ID",
        "fields": ["FECHAULTACT"]
    },
    {
        "name": "RELOPP",
        "from": "(select D.DOC_ID, F.EJECUTIVO, F.ESTADO from SYS_FIELDS_106 F with(nolock) inner join SYS_DOCUMENTS D with(nolock) on F.DOC_ID = D.DOC_ID where D.FLD_ID = 1017)",
        "joinOn": "RELOPP.DOC_ID = SYS_FIELDS.OPORTUNIDAD_ID",
        "fields": ["EJECUTIVO", "ESTADO"]
    }
]
```

## Uso

### doorsapi2 / Fluye Client

Los metodos `search` y `searchGroups` del Folder tienen el parametro **`v8`** que indica que la consulta se procesa con Events.v8 (quien implementa relaciones):

```javascript
let res = await folder.search({
    fields: 'DOC_ID, SUBJECT, ESTADO, RELACT_FECHAULTACT',
    order: 'RELACT_FECHAULTACT desc',
    v8: true,
    maxDocs: 1000
});
```

**`v8: true` es obligatorio.** El server .NET no soporta relaciones; sin este parametro los campos de relacion dan error "Invalid column name".

### Objeto Folder — metodo fields()

Devuelve un DoorsMap de Fields que incluye los campos de relaciones:

```javascript
for (let [key, field] of await folder.fields()) {
    console.log(field.name);       // nombre del campo
    console.log(field.tableAlias); // SYS_DOCUMENTS, SYS_FIELDS o NOMBRE_RELACION
}
```

### Objeto Document — campos de relacion

```javascript
let relField = doc.fields('RELACT_FECHAULTACT');
console.log(relField.value);      // Valor
console.log(relField.updatable);  // false (read-only)
console.log(relField.tableAlias); // RELACT (nombre de la relacion)
```

### Vistas del App (mobile)

Agregar los campos al array `fixedFields` en el evento init del explorer (property `App7_explorerInit` del folder), y luego usarlos en el renderer de la vista.

### Vistas Web

Soportado en modo **pivot** de las vistas. Soporte en modo tabla en desarrollo.

### Peticiones directas (REST)

Reemplazar el endpoint .NET por el de v8, incluyendo en los headers `AuthToken`, `ServerUrl` (endpoint .NET) y `UserId`:

```javascript
let url = 'https://node.cloudycrm.net/restful/folders/1715/documents?';
url += 'fields=' + encodeURIComponent('DOC_ID, SUBJECT, ESTADO, RELACT_FECHAULTACT');
url += '&order=' + encodeURIComponent('RELACT_FECHAULTACT desc');
url += '&maxDocs=1000';

let res = await fetch(url, {
    method: 'GET',
    headers: {
        'AuthToken': myAuthToken,
        'ServerUrl': 'https://mydoors.cloudycrm.net/restful',
        'UserId': currentUserId,
        'Content-Type': 'application/json',
    },
    cache: 'no-store',
});
```

## Reglas importantes

- La relacion entre el form y la tabla relacionada debe ser **1 a 1**. Si es 1:N, agrupar en la subconsulta.
- En la expresion `joinOn`, especificar siempre el alias de origen (`SYS_FIELDS`, `SYS_DOCUMENTS`, o el `name` de la relacion) para evitar errores de nombre ambiguo.
- Los campos de relacion son **read-only** (`updatable: false`).
- `with(nolock)` es recomendable en subconsultas para evitar bloqueos.

---

Ing Jorge Pagano - Cloudy CRM
