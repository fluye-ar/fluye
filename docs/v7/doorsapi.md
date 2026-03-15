# Doors 7 - doorsapi (COM Services)

> NOTA: Esta documentación se encuentra en construcción.

---

## Introducción

doorsapi es la interfaz de servicios COM original de Doors, reescrita en tecnología .NET con arquitectura SOA en versión 7. Se mantiene compatibilidad mediante "COM Services" que simula la interfaz antigua.

## Índice de Objetos

| Objeto | Descripción |
|--------|-------------|
| [Account](#account) | Cuenta de usuario/grupo |
| [Application](#application) | Aplicación y CodeLibs |
| [AsyncEvent](#asyncevent) | Evento asíncrono |
| [AsyncEventCollection](#asynceventcollection) | Colección de eventos asíncronos |
| [Attachment](#attachment) | Archivo adjunto |
| [AttachmentCollection](#attachmentcollection) | Colección de adjuntos |
| [CustomForm](#customform) | Formulario (campos, eventos, permisos) |
| [Db](#db) | Base de datos (queries, SQL) |
| [Directory](#directory) | Directorio de cuentas |
| [Document](#document) | Documento (CRUD, ACL, adjuntos) |
| [DoorsDictionary](#doorsdictionary) | Diccionario key/value |
| [DoorsDictionaryItem](#doorsdictionaryitem) | Item del diccionario |
| [DoorsRemoteDictionary](#doorsremotedictionary) | Diccionario remoto |
| [DoorsRemoteDictionaryItem](#doorsremotedictionaryitem) | Item del diccionario remoto |
| [Field](#field) | Campo de formulario |
| [FieldCollection](#fieldcollection) | Colección de campos |
| [Folder](#folder) | Carpeta (documentos, vistas, ACL) |
| [FolderEvent](#folderevent) | Evento de carpeta |
| [FolderEventCollection](#foldereventcollection) | Colección de eventos de carpeta |
| [FormEvent](#formevent) | Evento de formulario |
| [FormEventCollection](#formeventcollection) | Colección de eventos de formulario |
| [Property](#property) | Propiedad persistente |
| [PropertyCollection](#propertycollection) | Colección de propiedades |
| [Recipients](#recipients) | Destinatarios de email |
| [ScriptPipe](#scriptpipe) | Pipe de script |
| [Session](#session) | Sesión principal (entry point) |
| [SqlBuilder](#sqlbuilder) | Constructor de SQL |
| [StringBuilder](#stringbuilder) | Constructor de strings |
| [User](#user) | Usuario |
| [View](#view) | Vista (tabla, gráfico, calendario) |
| [XML](#xml) | Utilidades XML/DOM |

---
## Enumeraciones

### DocumentLogDateOrderEnum

| Nombre | Valor |
|--------|-------|
| Descending | 0 |
| Ascending | 1 |

### DoorsAccountTypes

| Nombre | Valor |
|--------|-------|
| UserAccount | 1 |
| GroupAccount | 2 |
| SpecialAccount | 3 |

### DoorsAsyncEventTypes

| Nombre | Valor |
|--------|-------|
| TimerEvent | 0 |
| TriggerEvent | 1 |

### DoorsDataTypes

| Nombre | Valor |
|--------|-------|
| Char | 1 |
| DateTime | 2 |
| Numeric | 3 |

### DoorsDbTypes

| Nombre | Valor |
|--------|-------|
| DB2 | 1 |
| Informix | 2 |
| Jet | 3 |
| MySQL | 4 |
| Oracle | 5 |
| SqlServer | 6 |
| PgSql | 7 |

### DoorsFolderTypes

| Nombre | Valor |
|--------|-------|
| DocumentsFolder | 1 |
| LinkFolder | 2 |
| VirtualFolder | 3 |

### DoorsObjectTypes

| Nombre | Valor |
|--------|-------|
| DoorsCustomForm | 1 |
| DoorsDocument | 2 |
| DoorsFolder | 3 |
| DoorsView | 4 |
| DoorsField | 5 |
| DoorsAccount | 6 |
| DoorsAttachment | 7 |

### DoorsOrderFieldDirection

| Nombre | Valor |
|--------|-------|
| Ascending | 0 |
| Descending | 1 |

### DoorsSpecialAccounts

| Nombre | Valor |
|--------|-------|
| Everyone | -1 |
| CreatorOwner | -2 |

### DoorsSyncEvents

12 eventos del ciclo de vida del documento:

| Nombre | Valor |
|--------|-------|
| Open | 0 |
| BeforeSave | 1 |
| AfterSave | 2 |
| BeforeCopy | 3 |
| AfterCopy | 4 |
| BeforeDelete | 5 |
| AfterDelete | 6 |
| BeforeMove | 7 |
| AfterMove | 8 |
| BeforeFieldChange | 9 |
| AfterFieldChange | 10 |
| Terminate | 11 |

### DoorsSystemFolders

| Nombre | Valor |
|--------|-------|
| RootFolder | 0 |
| RecycleBin | 1 |
| AdminFolder | 2 |
| FormsFolder | 3 |
| ViewsFolder | 4 |
| AgentsFolder | 5 |
| ConfigFolder | 6 |
| TemplatesFolder | 7 |

### ExportType

| Nombre | Valor |
|--------|-------|
| ExcelXml | 0 |
| OpenXml | 1 |

### TimerEventModes

| Nombre | Valor |
|--------|-------|
| ByMinutes | 0 |
| EveryDays | 1 |
| WeekDays | 2 |
| MonthDays | 3 |

### TriggerEventTypes

| Nombre | Valor |
|--------|-------|
| DocumentSave | 0 |
| DocumentDelete | 1 |

### ViewType

| Nombre | Valor |
|--------|-------|
| DataView | 1 |
| ChartView | 2 |

---

## Objetos

### Account

Representa una cuenta de usuario, grupo o cuenta especial.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| AccountType | DoorsAccountTypes | RO | Tipo de cuenta (User, Group, Special) |
| Description | String | RW | Descripción de la cuenta |
| Email | String | RW | Email de la cuenta |
| Id | Long | RO | Identificador único de la cuenta |
| IsNew | Boolean | RO | Indica si la cuenta es nueva (no guardada) |
| Name | String | RW | Nombre de la cuenta |
| Properties | PropertyCollection | RO | Colección de propiedades del sistema |
| Session | Session | RO | Sesión asociada |
| System | Boolean | RO | Indica si es cuenta de sistema |
| Tags | String | RW | Tags de la cuenta |
| UserProperties | PropertyCollection | RO | Colección de propiedades de usuario |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| ChildAccounts | AccountCollection | — | Obtiene las cuentas hijas |
| ChildAccountsAdd | — | Account | Agrega una cuenta hija |
| ChildAccountsList | String | — | Lista de cuentas hijas como string |
| ChildAccountsRecursive | AccountCollection | — | Cuentas hijas recursivas |
| ChildAccountsRemove | — | Account | Remueve una cuenta hija |
| ParentAccounts | AccountCollection | — | Obtiene las cuentas padre |
| ParentAccountsAdd | — | Account | Agrega una cuenta padre |
| ParentAccountsList | String | — | Lista de cuentas padre como string |
| ParentAccountsRecursive | AccountCollection | — | Cuentas padre recursivas |
| ParentAccountsRemove | — | Account | Remueve una cuenta padre |
| Cast2User | User | — | Convierte la cuenta a objeto User |
| IsAdmin | Boolean | — | Indica si la cuenta es administrador |
| Save | — | — | Guarda la cuenta |
| Delete | — | — | Elimina la cuenta |

**Ejemplo:**

```vbscript
Dim acc
Set acc = Me.Session.Directory.Accounts("admin")
Response.Write acc.Name & " - " & acc.Email
If acc.IsAdmin() Then Response.Write " (Admin)"
```

---

### Application

Objeto de aplicación, accesible desde `Session.Application`.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| DocumentalSequences | — | RO | Secuencias documentales |
| NamedPaths | — | RO | Paths nombrados de la aplicación |
| Parent | Session | RO | Sesión padre |
| RootFolder | Folder | RO | Carpeta raíz de la aplicación |
| RootFolderId | Long | RO | ID de la carpeta raíz |
| Session | Session | RO | Sesión asociada |
| SharedProperties | PropertyCollection | RO | Propiedades compartidas |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| CodeLib | String | Name | Obtiene el código de una codelib por nombre |
| CodeLib2 | String | Name | Obtiene el código de una codelib (variante 2) |
| Folders | Folder | Id | Obtiene una carpeta por ID |
| NextVal | Long | SequenceName | Obtiene el siguiente valor de una secuencia |
| SetVal | — | SequenceName, Value | Establece el valor de una secuencia |
| SettingsGet | String | SettingName | Obtiene un setting de la aplicación |
| SettingsSet | — | SettingName, Value | Establece un setting de la aplicación |
| SystemSettings | String | SettingName | Obtiene un setting de sistema |
| ParseCodeIncludes | String | Code | Parsea y resuelve #includes en código |
| ParseCodeIncludes2 | String | Code | Parsea y resuelve #includes (variante 2) |
| ParseControlsCodeByFolder | String | FolderId | Parsea código de controles por carpeta |
| ParseControlsCodeByPath | String | Path | Parsea código de controles por path |

**Ejemplo:**

```vbscript
Dim app
Set app = Me.Session.Application

' Obtener codelib
Dim code
code = app.CodeLib("miLibreria")

' Secuencias
Dim nextId
nextId = app.NextVal("SEQ_TICKET")

' Settings
Dim logoPath
logoPath = app.SettingsGet("INSTANCE_LOGO_IMAGE")
```

---

### AsyncEvent

Representa un evento asíncrono (timer o trigger).

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| ActiveCode | String | RO | Código activo resuelto (con includes) |
| Class | String | RW | Clase del evento |
| Code | String | RW | Código fuente del evento |
| CodeTimeout | Long | RW | Timeout de ejecución del código (ms) |
| Created | Date | RO | Fecha de creación |
| Disabled | Boolean | RW | Indica si el evento está deshabilitado |
| EventType | DoorsAsyncEventTypes | RO | Tipo: Timer o Trigger |
| Id | Long | RO | Identificador único |
| IsCom | Boolean | RO | Indica si es un evento COM |
| IsNew | Boolean | RO | Indica si es nuevo (no guardado) |
| Login | String | RW | Login para ejecución |
| Method | String | RW | Método del evento |
| Modified | Date | RO | Fecha de última modificación |
| Parent | Folder | RO | Carpeta contenedora |
| Password | String | W | Password para ejecución |
| Recursive | Boolean | RW | Si aplica recursivamente a subcarpetas |
| Session | Session | RO | Sesión asociada |
| Tags | String | RW | Tags del evento |
| TimerFrequence | Long | RW | Frecuencia del timer |
| TimerMode | TimerEventModes | RW | Modo del timer (minutos, días, semana, mes) |
| TimerNextRun | Date | RW | Próxima ejecución del timer |
| TimerTime | Date | RW | Hora de ejecución del timer |
| TriggerEvent | TriggerEventTypes | RW | Tipo de trigger (Save o Delete) |

---

### AsyncEventCollection

Colección de eventos asíncronos.

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Add | AsyncEvent | — | Agrega un nuevo evento asíncrono |
| Count | Long | — | Cantidad de eventos en la colección |
| Exists | Boolean | Id/Name | Verifica si existe un evento |
| Item | AsyncEvent | Id/Name | Obtiene un evento por ID o nombre |
| Parent | Folder | — | Carpeta padre de la colección |
| Remove | — | Id/Name | Remueve un evento de la colección |
| Session | Session | — | Sesión asociada |

---

### Attachment

Representa un archivo adjunto de un documento.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Created | Date | RO | Fecha de creación |
| Description | String | RW | Descripción del adjunto |
| Extension | String | RO | Extensión del archivo |
| External | Boolean | RO | Indica si es un adjunto externo |
| FileStream | Stream | RO | Stream del archivo |
| Id | Long | RO | Identificador único |
| IsNew | Boolean | RO | Indica si es nuevo |
| Name | String | RW | Nombre del archivo |
| Owner | Account | RO | Propietario del adjunto |
| Parent | Document | RO | Documento contenedor |
| Properties | PropertyCollection | RO | Propiedades del sistema |
| Session | Session | RO | Sesión asociada |
| Size | Long | RO | Tamaño en bytes |
| Tags | String | RW | Tags del adjunto |
| UserProperties | PropertyCollection | RO | Propiedades de usuario |

---

### AttachmentCollection

Colección de adjuntos de un documento.

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Add | Attachment | File, Name, attExternal | Agrega un adjunto. `attExternal` indica si es externo |
| Count | Long | — | Cantidad de adjuntos |
| Exists | Boolean | Id/Name | Verifica si existe un adjunto |
| Item | Attachment | Id/Name | Obtiene un adjunto por ID o nombre |
| Parent | Document | — | Documento padre |
| Remove | — | Id/Name | Remueve un adjunto |
| Session | Session | — | Sesión asociada |

---

### CustomForm

Representa un formulario personalizado.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| ACL | — | RO | Lista de control de acceso |
| Actions | — | RO | Acciones del formulario |
| Application | Application | RO | Aplicación padre |
| Created | Date | RO | Fecha de creación |
| Description | String | RW | Descripción del formulario |
| Events | FormEventCollection | RO | Colección de eventos del formulario |
| Fields | FieldCollection | RO | Colección de campos |
| FieldsList | String | RO | Lista de campos como string |
| Guid | String | RO | GUID del formulario |
| Icon | String | RW | Ícono del formulario |
| IconRaw | String | RO | Ícono sin procesar |
| Id | Long | RO | FRM_ID |
| IsNew | Boolean | RO | Indica si es nuevo |
| Modified | Date | RO | Fecha de última modificación |
| Name | String | RW | Nombre del formulario |
| Owner | Account | RO | Propietario |
| Properties | PropertyCollection | RO | Propiedades del sistema |
| ReadOnly | Boolean | RO | Si el formulario es de solo lectura |
| Session | Session | RO | Sesión asociada |
| StyleScriptActiveCode | String | RO | Código de estilo activo (resuelto) |
| StyleScriptDefinition | String | RW | Definición del script de estilo |
| Tags | String | RW | Tags |
| URL | String | RW | URL del formulario |
| URLRaw | String | RO | URL sin procesar |
| UserProperties | PropertyCollection | RO | Propiedades de usuario |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| ACLGrant | — | Account, AccessMask | Otorga permisos a una cuenta |
| ACLRevoke | — | Account | Revoca permisos de una cuenta |
| ACLRevokeAll | — | — | Revoca todos los permisos |
| Copy | CustomForm | — | Copia el formulario |
| CurrentAccess | Long | — | Acceso actual del usuario |
| Delete | — | — | Elimina el formulario |
| Save | — | — | Guarda el formulario |
| Search | DocumentCollection | Folder, Fields, Formula, Order, MaxDocs, Recursive, MaxValueLen | Busca documentos del formulario |
| SearchGroups | — | — | Busca grupos del formulario |

**Ejemplo:**

```vbscript
Dim frm
Set frm = Me.Session.Forms(102)
Response.Write "Formulario: " & frm.Name
Response.Write "Campos: " & frm.FieldsList

' Buscar documentos
Dim docs
Set docs = frm.Search(Me.Parent, "DOC_ID,NOMBRE", "ESTADO = 'Activo'", "NOMBRE ASC", 100, False, 0)
```

---

### Db

Objeto de acceso a base de datos.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| DbType | DoorsDbTypes | RO | Tipo de base de datos |
| Session | Session | RO | Sesión asociada |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| DelimitedName | String | Name | Nombre delimitado según el motor de BD |
| NextVal | Long | SequenceName | Siguiente valor de secuencia |
| SetVal | — | SequenceName, Value | Establece valor de secuencia |
| OpenRecordset | Recordset | SQL | Ejecuta una consulta SQL y retorna un recordset |
| SqlEncode | String | Value | Codifica un valor para uso en SQL |
| ProcessFormula | String | Formula | Procesa una fórmula reemplazando funciones |
| ReplaceDbFunctions | String | Formula | Reemplaza funciones genéricas por funciones del motor |

**ReplaceDbFunctions - Mapeo:**

| Función genérica | SQL Server | Oracle | MySQL |
|------------------|-----------|--------|-------|
| @NOW | Getdate() | Sysdate() | Now() |
| @UCASE | Upper() | Upper() | Upper() |
| @LCASE | Lower() | Lower() | Lower() |
| @CONTAINS | Contains | Contains | Contains |

**Ejemplo:**

```vbscript
Dim db
Set db = Me.Session.Db

' Ejecutar consulta
Dim rs
Set rs = db.OpenRecordset("SELECT DOC_ID, NOMBRE FROM SYS_FIELDS_102 WHERE ESTADO = '" & db.SqlEncode(estado) & "'")

Do While Not rs.EOF
    Response.Write rs("NOMBRE") & "<br>"
    rs.MoveNext
Loop
rs.Close
```

---

### Directory

Directorio de cuentas del sistema.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Session | Session | RO | Sesión asociada |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Accounts | Account | Id / Name | Obtiene una cuenta por ID o nombre |
| AccountsList | String | Order | Lista de cuentas ordenada |
| AccountsNew | Account | AccountType | Crea una nueva cuenta del tipo especificado |
| AccountsSearch | AccountCollection | Filter, Order | Busca cuentas con filtro y orden |
| expropiateObjects | — | User | Expropia objetos de un usuario |

**Ejemplo:**

```vbscript
Dim dir
Set dir = Me.Session.Directory

' Buscar cuenta
Dim acc
Set acc = dir.Accounts("jperez")

' Crear nueva cuenta de grupo
Dim grp
Set grp = dir.AccountsNew(DoorsAccountTypes.GroupAccount)
grp.Name = "Ventas"
grp.Description = "Grupo de ventas"
grp.Save
```

---

### Document

Representa un documento en el sistema.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Attachments | AttachmentCollection | RO | Colección de adjuntos |
| Created | Date | RO | Fecha de creación |
| Fields | FieldCollection | RO | Colección de campos |
| Form | CustomForm | RO | Formulario del documento |
| Icon | String | RW | Ícono |
| IconRaw | String | RO | Ícono sin procesar |
| Id | Long | RO | DOC_ID |
| IsNew | Boolean | RO | Indica si es nuevo (no guardado) |
| Modified | Date | RO | Fecha de última modificación |
| Owner | Account | RO | Propietario del documento |
| Parent | Folder | RO | Carpeta contenedora |
| Properties | PropertyCollection | RO | Propiedades del sistema |
| Session | Session | RO | Sesión asociada |
| Subject | String | RW | Asunto del documento |
| Tags | String | RW | Tags |
| UserProperties | PropertyCollection | RO | Propiedades de usuario |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Acl | — | — | Obtiene la ACL del documento |
| AclGrant | — | Account, AccessMask | Otorga permisos |
| AclInherited | Boolean | — | Indica si la ACL es heredada |
| AclInherits | Boolean | — | Indica si hereda ACL |
| AclOwn | — | — | ACL propia del documento |
| AclRevoke | — | Account | Revoca permisos de una cuenta |
| AclRevokeAll | — | — | Revoca todos los permisos |
| Ancestors | FolderCollection | — | Carpetas ancestro |
| Copy | Document | Folder | Copia el documento a una carpeta |
| CurrentAccess | Long | — | Acceso actual del usuario |
| Delete | — | sendToRecycleBin | Elimina el documento. Si sendToRecycleBin=True, envía a papelera |
| GetDocumentFolder | Folder | — | Obtiene la carpeta del documento |
| Log | DocumentLog | — | Log de auditoría del documento |
| Move | — | Folder | Mueve el documento a otra carpeta |
| Save | — | — | Guarda el documento |
| UpdateInContext | — | — | Actualiza el documento en contexto |

**Ejemplo:**

```vbscript
' Crear nuevo documento
Dim doc
Set doc = folder.DocumentsNew()
doc.Fields("NOMBRE").Value = "Juan Pérez"
doc.Fields("EMAIL").Value = "juan@email.com"
doc.Fields("ESTADO").Value = "Nuevo"
doc.Save

' Modificar documento existente
Dim doc2
Set doc2 = Me.Session.Documents(12345)
doc2.Fields("ESTADO").Value = "Procesado"
doc2.Save

' Copiar documento
Dim destFolder
Set destFolder = Me.Session.Application.Folders(5678)
Dim docCopy
Set docCopy = doc.Copy(destFolder)
```

---

### DoorsDictionary

Diccionario local (en memoria) de pares nombre/valor.

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Add | DoorsDictionaryItem | Name, Value | Agrega un item al diccionario |
| Count | Long | — | Cantidad de items |
| Exists | Boolean | Name | Verifica si existe un item |
| Item | DoorsDictionaryItem | Name | Obtiene un item por nombre |
| Remove | — | Name | Remueve un item |
| Session | Session | — | Sesión asociada |

---

### DoorsDictionaryItem

Item de un DoorsDictionary.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Session | Session | RO | Sesión asociada |
| Value | Variant | RW | Valor del item |

---

### DoorsRemoteDictionary

Diccionario remoto (persistente) de pares nombre/valor.

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Add | DoorsRemoteDictionaryItem | Name, Value | Agrega un item al diccionario remoto |
| Count | Long | — | Cantidad de items |
| Exists | Boolean | Name | Verifica si existe un item |
| Item | DoorsRemoteDictionaryItem | Name | Obtiene un item por nombre |
| Remove | — | Name | Remueve un item |
| Session | Session | — | Sesión asociada |

---

### DoorsRemoteDictionaryItem

Item de un DoorsRemoteDictionary.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Session | Session | RO | Sesión asociada |
| Value | Variant | RW | Valor del item |

---

### Field

Representa un campo de un formulario o documento.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Computed | Boolean | RO | Indica si es un campo calculado |
| CRC32 | String | RO | Checksum CRC32 del valor |
| Custom | Boolean | RO | Indica si es un campo personalizado |
| DataLength | Long | RO | Longitud del dato |
| DataPrecision | Long | RO | Precisión numérica |
| DataScale | Long | RO | Escala numérica |
| DataType | DoorsDataTypes | RO | Tipo de dato (Char, DateTime, Numeric) |
| Description | String | RW | Descripción del campo |
| DescriptionRaw | String | RO | Descripción sin procesar |
| IsNew | Boolean | RO | Indica si es nuevo |
| Name | String | RO | Nombre del campo |
| Nullable | Boolean | RO | Indica si acepta nulos |
| Parent | CustomForm / Document | RO | Objeto padre |
| Properties | PropertyCollection | RO | Propiedades del sistema |
| Session | Session | RO | Sesión asociada |
| Tags | String | RW | Tags |
| Updatable | Boolean | RO | Indica si el campo es actualizable |
| UserProperties | PropertyCollection | RO | Propiedades de usuario |
| Value | Variant | RW | Valor del campo |
| ValueOld | Variant | RO | Valor anterior del campo |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| ValueChanged | Boolean | — | Indica si el valor cambió respecto al original |

**Ejemplo:**

```vbscript
Dim fld
Set fld = doc.Fields("ESTADO")
Response.Write "Campo: " & fld.Name
Response.Write "Tipo: " & fld.DataType
Response.Write "Valor actual: " & fld.Value
Response.Write "Valor anterior: " & fld.ValueOld

If fld.ValueChanged() Then
    Response.Write "El campo fue modificado"
End If

If fld.Updatable Then
    fld.Value = "Nuevo valor"
End If
```

---

### FieldCollection

Colección de campos.

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Add | Field | Name | Agrega un campo por nombre |
| Count | Long | — | Cantidad de campos |
| Exists | Boolean | Name | Verifica si existe un campo |
| Item | Field | Name / Index | Obtiene un campo por nombre o índice |
| Parent | CustomForm / Document | — | Objeto padre |
| ReadOnly | Boolean | — | Indica si la colección es de solo lectura |
| Remove | — | Name | Remueve un campo |
| Session | Session | — | Sesión asociada |

---

### Folder

Representa una carpeta en la estructura jerárquica.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| AsyncEvents | AsyncEventCollection | RO | Colección de eventos asíncronos |
| CharData | String | RW | Datos de carácter de la carpeta |
| Comments | String | RW | Comentarios |
| Created | Date | RO | Fecha de creación |
| Description | String | RW | Descripción |
| DescriptionRaw | String | RO | Descripción sin procesar |
| Events | FolderEventCollection | RO | Colección de eventos sincrónicos |
| EventsList | String | RO | Lista de eventos como string |
| FolderType | DoorsFolderTypes | RO | Tipo de carpeta |
| Form | CustomForm | RO | Formulario asociado |
| HaveDocuments | Boolean | RO | Indica si tiene documentos |
| HaveFolders | Boolean | RO | Indica si tiene subcarpetas |
| HaveViews | Boolean | RO | Indica si tiene vistas |
| Icon | String | RW | Ícono |
| IconRaw | String | RO | Ícono sin procesar |
| Id | Long | RO | FLD_ID |
| IsEmpty | Boolean | RO | Indica si la carpeta está vacía |
| IsNew | Boolean | RO | Indica si es nueva |
| LogConf | — | RO | Configuración de log |
| Modified | Date | RO | Fecha de última modificación |
| Name | String | RW | Nombre de la carpeta |
| Owner | Account | RO | Propietario |
| Parent | Folder | RO | Carpeta padre |
| Properties | PropertyCollection | RO | Propiedades del sistema |
| Session | Session | RO | Sesión asociada |
| SourceFolder | Folder | RO | Carpeta origen (para links/virtuales) |
| StyleScriptActiveCode | String | RO | Código de estilo activo |
| StyleScriptDefinition | String | RW | Definición del script de estilo |
| System | Boolean | RO | Indica si es carpeta de sistema |
| Tags | String | RW | Tags |
| UserProperties | PropertyCollection | RO | Propiedades de usuario |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Acl | — | — | Obtiene la ACL de la carpeta |
| AclGrant | — | Account, AccessMask | Otorga permisos |
| AclInherited | Boolean | — | Indica si la ACL es heredada |
| AclInherits | Boolean | — | Indica si hereda ACL |
| AclOwn | — | — | ACL propia |
| AclRevoke | — | Account | Revoca permisos |
| AclRevokeAll | — | — | Revoca todos los permisos |
| Ancestors | FolderCollection | — | Carpetas ancestro |
| Copy | Folder | — | Copia la carpeta |
| Delete | — | — | Elimina la carpeta |
| Descendants | FolderCollection | — | Carpetas descendientes |
| Documents | DocumentCollection | — | Colección de documentos |
| DocumentsCount | Long | — | Cantidad de documentos |
| DocumentsDelete | — | DocId | Elimina un documento por ID |
| DocumentsNew | Document | — | Crea un nuevo documento |
| Folders | FolderCollection | — | Subcarpetas |
| FoldersList | String | — | Lista de subcarpetas como string |
| FoldersNew | Folder | — | Crea una nueva subcarpeta |
| Move | — | DestFolder | Mueve la carpeta |
| Path | String | — | Path completo de la carpeta |
| Save | — | — | Guarda la carpeta |
| Search | DocumentCollection | Fields, Formula, Order, MaxDocs, Recursive, MaxValueLen | Busca documentos en la carpeta |
| SearchGroups | — | — | Busca grupos |
| Views | ViewCollection | — | Colección de vistas |
| ViewsList | String | — | Lista de vistas como string |
| ViewsNew | View | — | Crea una nueva vista |

**Ejemplo:**

```vbscript
' Acceder a carpeta
Dim folder
Set folder = Me.Session.Application.Folders(1023)
Response.Write "Carpeta: " & folder.Name & " (ID: " & folder.Id & ")"

' Crear documento
Dim doc
Set doc = folder.DocumentsNew()
doc.Fields("NOMBRE").Value = "Nuevo registro"
doc.Save

' Buscar documentos
Dim docs
Set docs = folder.Search("DOC_ID,NOMBRE,ESTADO", "ESTADO = 'Activo'", "NOMBRE ASC", 100, False, 0)

' Crear subcarpeta
Dim subFolder
Set subFolder = folder.FoldersNew()
subFolder.Name = "Nueva subcarpeta"
subFolder.Save
```

---

### FolderEvent

Representa un evento sincrónico de carpeta.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| ActiveCode | String | RO | Código activo (con includes resueltos) |
| Code | String | RW | Código fuente del evento |
| Created | Date | RO | Fecha de creación |
| Id | Long | RO | Identificador único |
| Modified | Date | RO | Fecha de última modificación |
| Overrides | Boolean | RO | Indica si sobreescribe al evento del formulario |
| Parent | Folder | RO | Carpeta contenedora |
| Session | Session | RO | Sesión asociada |

---

### FolderEventCollection

Colección de los 12 eventos sincrónicos de carpeta.

Los 12 tipos de evento son: Open, BeforeSave, AfterSave, BeforeCopy, AfterCopy, BeforeDelete, AfterDelete, BeforeMove, AfterMove, BeforeFieldChange, AfterFieldChange, Terminate.

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Count | Long | — | Cantidad de eventos |
| Exists | Boolean | EventType | Verifica si existe un evento |
| Item | FolderEvent | EventType | Obtiene un evento por tipo |
| Parent | Folder | — | Carpeta padre |
| Session | Session | — | Sesión asociada |

---

### FormEvent

Representa un evento sincrónico de formulario.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Code | String | RW | Código fuente del evento |
| Created | Date | RO | Fecha de creación |
| Extensible | Boolean | RO | Indica si el evento es extensible |
| Id | Long | RO | Identificador único |
| Modified | Date | RO | Fecha de última modificación |
| Overridable | Boolean | RO | Indica si puede ser sobreescrito por carpeta |
| Parent | CustomForm | RO | Formulario contenedor |
| Session | Session | RO | Sesión asociada |

---

### FormEventCollection

Colección de los 12 eventos sincrónicos de formulario.

Los 12 tipos de evento son: Open, BeforeSave, AfterSave, BeforeCopy, AfterCopy, BeforeDelete, AfterDelete, BeforeMove, AfterMove, BeforeFieldChange, AfterFieldChange, Terminate.

> **Nota:** BeforeFieldChange y AfterFieldChange están deprecados.

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Count | Long | — | Cantidad de eventos |
| Exists | Boolean | EventType | Verifica si existe un evento |
| Item | FormEvent | EventType | Obtiene un evento por tipo |
| Parent | CustomForm | — | Formulario padre |
| Session | Session | — | Sesión asociada |

---

### Property

Representa una propiedad almacenada en SYS_PROPERTIES.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Created | Date | RO | Fecha de creación |
| Modified | Date | RO | Fecha de última modificación |
| Name | String | RO | Nombre de la propiedad |
| Parent | Object | RO | Objeto padre |
| Session | Session | RO | Sesión asociada |
| Tags | String | RW | Tags |
| Value | Variant | RW | Valor de la propiedad |
| ValueChanged | Boolean | RO | Indica si el valor cambió |
| ValueOld | Variant | RO | Valor anterior |

---

### PropertyCollection

Colección de propiedades.

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Add | Property | Name, Value | Agrega una propiedad |
| Count | Long | — | Cantidad de propiedades |
| Exists | Boolean | Name | Verifica si existe una propiedad |
| Item | Property | Name | Obtiene una propiedad por nombre |
| Parent | Object | — | Objeto padre |
| ReadOnly | Boolean | — | Indica si la colección es de solo lectura |
| Remove | — | Name | Remueve una propiedad |
| Session | Session | — | Sesión asociada |

---

### Recipients

Gestiona destinatarios para envío de emails/notificaciones.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Delimiter | String | RW | Delimitador para separar direcciones |
| Dom | Object | RO | Objeto DOM interno |
| IncludeNames | Boolean | RW | Incluir nombres en las direcciones |
| Session | Session | RO | Sesión asociada |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| AddAccount | — | Account, RecipientType | Agrega una cuenta como destinatario |
| AddEmail | — | Email, Name, RecipientType | Agrega un email como destinatario |
| Addresses | String | RecipientType | Obtiene las direcciones por tipo |
| Clear | — | — | Limpia todos los destinatarios |

---

### ScriptPipe

Canal de comunicación entre scripts de eventos.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Cancel | Boolean | RW | Permite cancelar la operación en curso |
| NewValue | Variant | RW | Nuevo valor (usado en eventos de campo) |
| Objects | Collection | RO | Colección de objetos compartidos |
| Session | Session | RO | Sesión asociada |

---

### Session

Objeto principal de sesión. Provee acceso a todos los servicios del sistema.

**Propiedades de autenticación y sesión:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Application | Application | RO | Objeto Application |
| CurrentAccount | Account | RO | Cuenta del usuario actual |
| CurrentUser | User | RO | Usuario actual |
| Db | Db | RO | Objeto de acceso a base de datos |
| Directory | Directory | RO | Directorio de cuentas |
| IsLogged | Boolean | RO | Indica si hay sesión activa |
| Language | String | RW | Idioma de la sesión |
| LicenseType | String | RO | Tipo de licencia |
| ServerUrl | String | RW | URL del servidor |
| SessionId | String | RO | ID de la sesión |
| Token | String | RO | Token de autenticación |
| Version | String | RO | Versión del sistema |

**Métodos de autenticación:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Logon | Boolean | Login, Password, Instance | Inicia sesión |
| Logoff | — | — | Cierra la sesión |
| LdapAuthentication | Boolean | Login, Password | Autenticación LDAP |
| ChangePassword | — | OldPassword, NewPassword | Cambia la contraseña |

**Métodos de carpetas:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Folders | Folder | Id | Obtiene carpeta por ID |
| FolderByPath | Folder | Path | Obtiene carpeta por path |
| FolderByGuid | Folder | Guid | Obtiene carpeta por GUID |
| SystemFolder | Folder | DoorsSystemFolders | Obtiene carpeta de sistema |

**Métodos de documentos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Documents | Document | Id | Obtiene documento por ID |
| DocumentByGuid | Document | Guid | Obtiene documento por GUID |

**Métodos de formularios:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Forms | CustomForm | Id | Obtiene formulario por ID |
| FormByGuid | CustomForm | Guid | Obtiene formulario por GUID |
| FormByName | CustomForm | Name | Obtiene formulario por nombre |

**Métodos de búsqueda:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Search | DocumentCollection | Folder, Fields, Formula, Order, MaxDocs, Recursive, MaxValueLen | Búsqueda de documentos |
| SearchGroups | — | Folder, GroupFields, Formula | Búsqueda agrupada |

**Métodos de caché:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| CacheGet | Variant | Key | Obtiene valor del caché |
| CacheSet | — | Key, Value, TTL | Establece valor en caché |
| CacheRemove | — | Key | Remueve valor del caché |
| CacheClear | — | — | Limpia todo el caché |

**Métodos de construcción de objetos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| ConstructNewDictionary | DoorsDictionary | — | Crea un nuevo diccionario local |
| ConstructNewRemoteDictionary | DoorsRemoteDictionary | Name | Crea un nuevo diccionario remoto |
| ConstructNewRecipients | Recipients | — | Crea un nuevo objeto Recipients |
| ConstructNewSqlBuilder | SqlBuilder | — | Crea un nuevo SqlBuilder |
| ConstructNewStringBuilder | StringBuilder | — | Crea un nuevo StringBuilder |
| ConstructNewXML | XML | — | Crea un nuevo objeto XML |

**Métodos de codificación/decodificación:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Base64Decode | String | Value | Decodifica Base64 |
| Base64Encode | String | Value | Codifica a Base64 |
| HtmlDecode | String | Value | Decodifica HTML |
| HtmlEncode | String | Value | Codifica a HTML |
| UrlDecode | String | Value | Decodifica URL |
| UrlEncode | String | Value | Codifica a URL |
| Encrypt | String | Value, Key | Encripta un valor |
| Decrypt | String | Value, Key | Desencripta un valor |
| MD5 | String | Value | Genera hash MD5 |

**Métodos de conversión de tipos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| CBool2 | Boolean | Value | Conversión segura a Boolean |
| CDate2 | Date | Value | Conversión segura a Date |
| CDbl2 | Double | Value | Conversión segura a Double |
| CLng2 | Long | Value | Conversión segura a Long |
| CStr2 | String | Value | Conversión segura a String |
| IsNull2 | Boolean | Value | Verifica si es Null o vacío |

**Métodos de strings:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| StrPad | String | Value, Length, PadChar, Direction | Rellena un string |
| StrReplace | String | Value, Find, Replace | Reemplaza texto |
| StrSplit | Array | Value, Delimiter | Divide un string |
| StrTrim | String | Value | Elimina espacios al inicio y final |

**Métodos de logging:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Log | — | Message | Escribe en el log del sistema |
| LogError | — | Message | Escribe un error en el log |
| LogWarning | — | Message | Escribe una advertencia en el log |

**Métodos de zona horaria:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| TimeZoneConvert | Date | Value, FromTZ, ToTZ | Convierte fecha entre zonas horarias |
| TimeZoneOffset | Long | TimeZone | Obtiene el offset de una zona horaria |

**Métodos de tokens:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| TokenCreate | String | Payload, Expiration | Crea un token de autenticación |
| TokenValidate | Object | Token | Valida un token y retorna payload |
| TokenRevoke | — | Token | Revoca un token |
| TokensAdd | — | Name, Value | Agrega un token de sistema para uso en filtros de vistas y descripciones |

**Tokens del sistema** (generados automáticamente al iniciar sesión, usados en filtros de vistas y campos de descripción):

| Token | Valor |
|-------|-------|
| `[LOGGEDUSERID]` | Identificador del usuario autenticado |
| `[LOGGEDUSERLOGIN]` | Nombre de usuario (login) del usuario autenticado |
| `[LANGID]` | Identificador del idioma configurado |
| `[LANGSTRING(12)]` | String con datos del sistema (rango 0-2422) |
| `[NETAPPVIRTUALROOT]` | Directorio virtual del sitio .NET |
| `[APPVIRTUALROOT]` | Directorio virtual del sitio COM |
| `[FOLDERID]` | Identificador de carpeta actual |
| `[THEMEROOT]` | URL relativa del tema del usuario |
| `[MisGrupos]` | IDs de grupos del usuario, separados por comas |

Ejemplo: filtro de vista `responsable_id = [LOGGEDUSERID]` muestra registros donde el responsable sea el usuario autenticado.

**Métodos de eventos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| EventQueueAdd | — | EventName, Data | Agrega un evento a la cola |
| EventQueueProcess | — | — | Procesa la cola de eventos |

**Métodos de instancia:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| InstanceList | Array | — | Lista de instancias disponibles |
| InstanceInfo | Object | InstanceName | Información de una instancia |

**Ejemplo:**

```vbscript
' Logon
Dim session
Set session = CreateObject("doorsapi.Session")
session.Logon "admin", "password", "miInstancia"

' Acceder a carpeta y buscar
Dim folder
Set folder = session.Application.Folders(1023)
Dim docs
Set docs = folder.Search("DOC_ID,NOMBRE", "ESTADO = 'Activo'", "NOMBRE ASC", 50, False, 0)

' Acceso directo a documento
Dim doc
Set doc = session.Documents(12345)
Response.Write doc.Fields("NOMBRE").Value

' Construcción de objetos
Dim sb
Set sb = session.ConstructNewStringBuilder()
sb.Append "Hola "
sb.Append "Mundo"
Response.Write sb.ToString()

' Logoff
session.Logoff
```

---

### SqlBuilder

Constructor de sentencias SQL (INSERT/UPDATE).

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Add | — | Field, Value, iType | Agrega un campo con su valor y tipo |
| Clear | — | — | Limpia todos los campos |
| Count | Long | — | Cantidad de campos agregados |
| EmptyStringsAsNull | Boolean | — | Si strings vacíos se tratan como NULL |
| FieldIndex | Long | FieldName | Obtiene el índice de un campo |
| FieldName | String | Index | Obtiene el nombre de un campo por índice |
| FieldType | DoorsDataTypes | Index | Obtiene el tipo de un campo por índice |
| FieldValue | Variant | Index | Obtiene el valor de un campo por índice |
| InsertString | String | IncludeNulls | Genera la sentencia INSERT |
| Remove | — | FieldName | Remueve un campo |
| Session | Session | — | Sesión asociada |
| UpdateString | String | — | Genera la sentencia UPDATE |

**Ejemplo:**

```vbscript
Dim sql
Set sql = Me.Session.ConstructNewSqlBuilder()
sql.Add "NOMBRE", "Juan Pérez", DoorsDataTypes.Char
sql.Add "EDAD", 30, DoorsDataTypes.Numeric
sql.Add "FECHA_ALTA", Now(), DoorsDataTypes.DateTime

' Generar INSERT
Dim insertSql
insertSql = sql.InsertString(False)
' Resultado: INSERT INTO ... (NOMBRE, EDAD, FECHA_ALTA) VALUES ('Juan Pérez', 30, '2026-03-15')

' Generar UPDATE
Dim updateSql
updateSql = sql.UpdateString()
' Resultado: SET NOMBRE = 'Juan Pérez', EDAD = 30, FECHA_ALTA = '2026-03-15'
```

---

### StringBuilder

Constructor de strings optimizado.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Session | Session | RO | Sesión asociada |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| Append | — | Text | Agrega texto al buffer |
| Clear | — | — | Limpia el buffer |
| Init | — | InitialSize, Growth | Inicializa con tamaño y factor de crecimiento |
| ToString | String | — | Retorna el string construido |

**Ejemplo:**

```vbscript
Dim sb
Set sb = Me.Session.ConstructNewStringBuilder()
sb.Init 1024, 512

sb.Append "<table>"
sb.Append "<tr><th>Nombre</th><th>Estado</th></tr>"

For Each doc In docs
    sb.Append "<tr>"
    sb.Append "<td>" & doc.Fields("NOMBRE").Value & "</td>"
    sb.Append "<td>" & doc.Fields("ESTADO").Value & "</td>"
    sb.Append "</tr>"
Next

sb.Append "</table>"
Response.Write sb.ToString()
```

---

### User

Representa un usuario del sistema. Extiende Account con propiedades específicas de usuario.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| CannotChangePwd | Boolean | RW | Indica si el usuario no puede cambiar password |
| ChangePwdNextLogon | Boolean | RW | Fuerza cambio de password en próximo login |
| Description | String | RW | Descripción del usuario |
| Disabled | Boolean | RW | Indica si el usuario está deshabilitado |
| Email | String | RW | Email del usuario |
| FullName | String | RW | Nombre completo |
| GestarLogon | Boolean | RW | Habilita login por Gestar/Doors |
| Id | Long | RO | Identificador único |
| IsNew | Boolean | RO | Indica si es nuevo |
| Language | String | RW | Idioma preferido |
| LDAPLogon | Boolean | RW | Habilita login por LDAP |
| LDAPServer | String | RW | Servidor LDAP |
| Login | String | RW | Login del usuario |
| Name | String | RW | Nombre de la cuenta |
| ParentAccountsRecursive | AccountCollection | RO | Cuentas padre recursivas |
| Password | String | W | Password (solo escritura) |
| PwdChanged | Date | RO | Fecha de último cambio de password |
| PwdNeverExpires | Boolean | RW | Indica si el password nunca expira |
| Session | Session | RO | Sesión asociada |
| Settings | DoorsDictionary | RO | Configuración del usuario |
| Tags | String | RW | Tags |
| Theme | String | RW | Tema visual preferido |
| TimeDiff | Long | RW | Diferencia horaria del usuario |
| WinLogon | Boolean | RW | Habilita login por Windows |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| ChildAccountsAdd | — | Account | Agrega una cuenta hija |
| ChildAccountsRemove | — | Account | Remueve una cuenta hija |
| Delete | — | — | Elimina el usuario |
| IsAdmin | Boolean | — | Indica si es administrador |
| ParentAccounts | AccountCollection | — | Obtiene cuentas padre |
| ParentAccountsAdd | — | Account | Agrega una cuenta padre |
| ParentAccountsList | String | — | Lista de cuentas padre como string |
| ParentAccountsRemove | — | Account | Remueve una cuenta padre |
| Save | — | — | Guarda el usuario |

**Ejemplo:**

```vbscript
' Obtener usuario actual
Dim usr
Set usr = Me.Session.CurrentUser
Response.Write "Usuario: " & usr.FullName & " (" & usr.Login & ")"
Response.Write "Email: " & usr.Email

' Crear nuevo usuario
Dim newUser
Set newUser = Me.Session.Directory.AccountsNew(DoorsAccountTypes.UserAccount).Cast2User
newUser.Login = "jperez"
newUser.FullName = "Juan Pérez"
newUser.Email = "jperez@empresa.com"
newUser.Password = "TempPass123"
newUser.ChangePwdNextLogon = True
newUser.GestarLogon = True
newUser.Save

' Agregar a grupo
Dim grpVentas
Set grpVentas = Me.Session.Directory.Accounts("Ventas")
newUser.ParentAccountsAdd grpVentas
```

---

### View

Representa una vista de datos o gráfico.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Acl | — | RO | Lista de control de acceso |
| AclInherited | Boolean | RO | Indica si la ACL es heredada |
| AclInherits | Boolean | RO | Indica si hereda ACL |
| Comments | String | RW | Comentarios |
| Created | Date | RO | Fecha de creación |
| Definition | String | RW | Definición XML de la vista |
| Description | String | RW | Descripción |
| DescriptionRaw | String | RO | Descripción sin procesar |
| Id | Long | RO | Identificador único |
| IsNew | Boolean | RO | Indica si es nueva |
| Modified | Date | RO | Fecha de última modificación |
| Name | String | RW | Nombre de la vista |
| Owner | Account | RO | Propietario |
| Parent | Folder | RO | Carpeta contenedora |
| PrivateView | Boolean | RW | Indica si es vista privada |
| Properties | PropertyCollection | RO | Propiedades del sistema |
| Session | Session | RO | Sesión asociada |
| StyleScriptActiveCode | String | RO | Código de estilo activo |
| StyleScriptDefinition | String | RW | Definición del script de estilo |
| Tags | String | RW | Tags |
| UserProperties | PropertyCollection | RO | Propiedades de usuario |
| ViewType | ViewType | RO | Tipo de vista (Data o Chart) |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| AclGrant | — | Account, AccessMask | Otorga permisos |
| AclOwn | — | — | ACL propia |
| AclRevoke | — | Account | Revoca permisos |
| AclRevokeAll | — | — | Revoca todos los permisos |
| Copy | View | Folder, PrivateView | Copia la vista a una carpeta |
| CurrentAccess | Long | — | Acceso actual del usuario |
| Delete | — | — | Elimina la vista |
| Export | Stream | ExportType, SelectedDocuments | Exporta la vista (Excel XML u OpenXml) |
| Save | — | — | Guarda la vista |
| Search | DocumentCollection | GroupValues, Formula, MaxValueLen | Ejecuta la búsqueda de la vista |

**Ejemplo:**

```vbscript
' Obtener vista
Dim vw
Set vw = folder.Views("Vista Principal")
Response.Write "Vista: " & vw.Name & " Tipo: " & vw.ViewType

' Ejecutar vista
Dim results
Set results = vw.Search("", "", 0)

' Exportar a Excel
Dim stream
Set stream = vw.Export(ExportType.OpenXml, "")
```

---

### XML

Objeto para manejo de XML.

**Propiedades:**

| Propiedad | Tipo | Acceso | Descripción |
|-----------|------|--------|-------------|
| Session | Session | RO | Sesión asociada |

**Métodos:**

| Método | Retorna | Parámetros | Descripción |
|--------|---------|------------|-------------|
| DOMHeader | String | — | Retorna el header XML estándar |
| NewDOM | Object | — | Crea un nuevo documento DOM |
| NewValidateDOM | Object | NamespaceURI, RootName, LoadSchema | Crea un DOM con validación de esquema |
| RaiseParseError | — | — | Lanza error si hay errores de parseo |
| SetAttribute | — | Node, Attrib, Value | Establece un atributo en un nodo |
| ValidatedLoad | Object | — | Carga un XML con validación |
| ValidatedLoadXML | Object | — | Carga un string XML con validación |
| ValidateDOM | — | — | Valida el DOM actual |
| XMLDecode | Variant | XMLValue, DataType | Decodifica un valor XML al tipo especificado |
| XMLEncode | String | Value, DataType | Codifica un valor al formato XML |
| XMLEncodeADOVal | String | — | Codifica un valor ADO a XML |

**Ejemplo:**

```vbscript
Dim xml
Set xml = Me.Session.ConstructNewXML()

' Crear documento DOM
Dim dom
Set dom = xml.NewDOM()

' Codificar valores
Dim encoded
encoded = xml.XMLEncode("Juan & María", DoorsDataTypes.Char)
' Resultado: "Juan &amp; María"

' Decodificar valores
Dim decoded
decoded = xml.XMLDecode("2026-03-15T00:00:00", DoorsDataTypes.DateTime)
```

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1WRmYunZc_yD7i8HGb1R5lK616PVmVr6w825Dy-bPRps/pub)
