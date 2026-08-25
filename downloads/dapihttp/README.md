# dapihttp

COM DLL para acceder a DoorsBPM desde cualquier lenguaje que soporte COM: **VBScript, VBA (Excel/Access), VB.NET, C#, PowerShell, Classic ASP, VB6**.

Comunica con el server via HTTP/HTTPS a través de `dapihttplistener.asp`.

## Descargar

**[dapihttpsetup-1.4.0.exe](https://cdn.fluye.ar/ghf/fluye/downloads/dapihttp/dapihttpsetup-1.4.0.exe)** (598 KB)

Instala y registra la DLL automáticamente. Requiere permisos de administrador.

## Ejemplo rápido (VBScript)

```vbs
Set s = CreateObject("dapihttp.Session")
s.ServerURL = "https://miinstancia.cloudycrm.net/c/inc/dapihttplistener.asp"

' Logon
s.Logon "usuario", "password", "instancia"
WScript.Echo "Conectado a " & s.InstanceName

' Abrir una carpeta y buscar documentos
Set carpeta = s.FoldersGetFromId(123)
Set docs = carpeta.Search("DOC_ID, SUBJECT, ESTADO", "ESTADO = 'Activo'", "DOC_ID DESC", 10)

For Each doc In docs
    WScript.Echo doc.getAttribute("DOC_ID") & " - " & doc.getAttribute("SUBJECT")
Next

' Abrir un documento por ID y leer/modificar campos
Set doc = s.DocumentsGetFromId(456)
WScript.Echo "Subject: " & doc.Subject
doc.Fields("ESTADO").Value = "Cerrado"
doc.Save

' Crear un documento nuevo en una carpeta
Set nuevo = carpeta.DocumentsNew()
nuevo.Subject = "Alta desde script"
nuevo.Fields("NOMBRE").Value = "Juan Pérez"
nuevo.Fields("EMAIL").Value = "juan@ejemplo.com"
nuevo.Save
WScript.Echo "Creado DOC_ID: " & nuevo.Id

' Cerrar sesión
s.Logoff
```

## Ejemplo Excel VBA

```vb
Sub ConsultarDoors()
    Dim s As Object
    Set s = CreateObject("dapihttp.Session")
    s.ServerURL = "https://miinstancia.cloudycrm.net/c/inc/dapihttplistener.asp"
    s.Logon "usuario", "password", "instancia"

    Dim carpeta As Object
    Set carpeta = s.FoldersGetFromId(123)
    Dim docs As Object
    Set docs = carpeta.Search("DOC_ID, NOMBRE, MONTO", "", "DOC_ID DESC", 100)

    Dim fila As Long: fila = 2
    Dim doc As Object
    For Each doc In docs
        Cells(fila, 1).Value = doc.getAttribute("DOC_ID")
        Cells(fila, 2).Value = doc.getAttribute("NOMBRE")
        Cells(fila, 3).Value = doc.getAttribute("MONTO")
        fila = fila + 1
    Next

    s.Logoff
    MsgBox "Importados " & (fila - 2) & " registros"
End Sub
```

## API principal

### Session

| Método / Propiedad | Descripción |
|---|---|
| `ServerURL` | URL del dapihttplistener (set antes de Logon) |
| `Logon(user, pass, instance)` | Inicia sesión |
| `Logoff` | Cierra sesión |
| `IsLogged` | Boolean, hay sesión activa |
| `InstanceName` | Nombre de la instancia conectada |
| `LoggedUser` | Objeto User del usuario logueado |
| `FoldersGetFromId(id)` | Abre una carpeta por FLD_ID |
| `DocumentsGetFromId(id)` | Abre un documento por DOC_ID |
| `FoldersList` | Lista todas las carpetas |
| `Db` | Acceso directo a la base de la instancia |
| `MasterDb` | Acceso a la base master |

### Folder

| Método / Propiedad | Descripción |
|---|---|
| `Search(fields, formula, order, maxDocs)` | Busca documentos (devuelve XML NodeList) |
| `SearchGroups(groups, totals, formula)` | Agrupación con totales |
| `DocumentsNew` | Crea un documento nuevo en la carpeta |
| `Documents(id)` | Abre un documento de la carpeta |
| `DocumentsCount` | Cantidad de documentos |
| `Name`, `Id`, `FormId` | Propiedades de la carpeta |

### Document

| Método / Propiedad | Descripción |
|---|---|
| `Fields(name).Value` | Lee/escribe un campo del formulario |
| `Subject` | Asunto del documento |
| `Save` | Guarda cambios |
| `Delete` | Elimina el documento |
| `Attachments` | Colección de adjuntos |
| `Id`, `IsNew` | Propiedades del documento |

## Requisitos

- Windows 7+ / Server 2008+
- DoorsBPM con `dapihttplistener.asp` habilitado

## Changelog

| Versión | Cambio |
|---|---|
| **1.4.0** | MSXML 6.0 (fix TLS 1.2). Compatible binariamente con 1.3.x |
| 1.3.x | MSXML 4.0 (no soporta TLS 1.2) |

## Código fuente

[Doors-dapihttp en GitHub](https://github.com/CloudyVisionArg/Doors-dapihttp)

Jorge Pagano - Fluye Labs
