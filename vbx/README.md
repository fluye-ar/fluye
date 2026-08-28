# VbX — Toolkit COM x64 para Doors

**Tu código ASP/VBS corriendo en 64 bits sin tocar una línea.**

Sin cadenas de VB6. Sin capa .NET. Sin WCF.

DoorsBPM corre en IIS 32-bit desde 2005: límite de 2 GB de RAM por proceso, dependencia a componentes discontinuados (MSXML 4.0, `msscript.ocx`, `aspSmartUpload`), y un stack de 4 capas (VBScript → VB6 COM → .NET COM → WCF → Server) para cada operación.

**VbX** reemplaza esos componentes con equivalentes x64 nativos manteniendo los mismos `ProgIds`. Se registran en el servidor, se cambia el Application Pool de IIS a x64 nativo, y el código existente sigue funcionando sin cambios. **Tu inversión protegida.**

---

## Componentes

| DLL | ProgId | Reemplaza | Qué hace |
|---|---|---|---|
| `doorsapi64.dll` | `doorsapi.*` | `doorsapi.dll` (VB6, 2005) + `doorsapiNet.dll` + WCF | API COM en C++ x64. REST directo al backend, eliminando 2 capas. Incluye parser JSON `fyjson` (5× más rápido que V8). |
| `NitroVbx` | servicio Windows | `ScriptExecutor` legacy | Runtime x64 de eventos VBScript sincrónicos y asíncronos. |
| `aspSmartUpload64.dll` | `aspSmartUpload.SmartUpload` | `aspSmartUpload.dll` (Advantys, 2001) | Upload de archivos en ASP. C# .NET COM. |
| `ScriptControl64.dll` | `MSScriptControl.ScriptControl` | `msscript.ocx` (deprecated 2014) | Evaluación de VBScript desde COM. Basado en `tsc64` (open source). |
| `msxml6.dll` | `MSXML2.*` | `MSXML 4.0` (deprecated 2014) | Parser XML nativo de Windows. |

---

## Arquitectura

### Antes — 4 capas COM + WCF

```
ASP Classic / VBScript
    ↓ Late binding (IDispatch)
doorsapi.dll (VB6, 22.873 LOC)
    ↓ CreateObject("doorsapiNet.Session")
doorsapiNet (C# .NET 4.8, 13.454 LOC)
    ↓ WCF
Doors Server
```

### Después — 2 capas, REST directo

```
ASP Classic / VBScript
    ↓ Late binding (IDispatch nativo)
doorsapi64.dll (C++ COM x64)
    ↓ HTTP REST (WinHTTP)
Doors Server (/restful/*)
```

De 4 capas a 2. Mismo `ProgId` para el código que consume, sin cambios en VBScript ni ASP.

---

## Descargar

| Archivo | Para | Tamaño |
|---------|------|--------|
| **[doorsapi64.zip](https://cdn.fluye.ar/ghf/fluye/vbx/doorsapi64.zip)** | Windows 64-bit (recomendado) | 370 KB |
| **[doorsapi32.zip](https://cdn.fluye.ar/ghf/fluye/vbx/doorsapi32.zip)** | Windows 32-bit | 362 KB |

**Sin dependencias externas.** No necesita VC++ Redistributable, MSXML, ni VB6 Runtime.

---

## Instalar

### Pack completo (recomendado en el server)

1. Descargar el ZIP del pack e ir a la ubicación local (ej. `C:\vbx\`).
2. Click derecho sobre `install.cmd` → **Ejecutar como administrador**.
3. Validar con el smoke test (sección [Verificar](#verificar)).
4. En IIS, cambiar el Application Pool de Doors a `Enable 32-Bit Applications = False`. Reiniciar el sitio.

### Registro manual — solo `doorsapi64` (workstation, scripts)

Descomprimir el ZIP y abrir una terminal como **Administrador**:

#### Windows 64-bit

Registrar **ambas** DLLs — la 64-bit para procesos x64 y la 32-bit para procesos x86 (ej. `cscript` 32-bit, Excel, Access):

```cmd
regsvr32 C:\ruta\doorsapi64.dll
C:\Windows\SysWOW64\regsvr32 C:\ruta\doorsapi32.dll
```

#### Windows 32-bit

Solo la 32-bit:

```cmd
regsvr32 C:\ruta\doorsapi32.dll
```

### Pack completo — registro manual paso a paso

Si preferís ejecutar los pasos uno por uno (en cmd elevada):

```cmd
cd C:\vbx\bin

regsvr32 doorsapi64.dll
%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\RegAsm.exe aspSmartUpload64.dll /codebase
regsvr32 ScriptControl64.dll

sc create NitroVbx binPath= "C:\vbx\bin\NitroVbx\Doors.NitroVbx.exe" start= auto
sc start NitroVbx
```

### Contenido del pack

```
vbx-toolkit-x64-vX.Y.Z/
├── bin/                       Componentes principales
│   ├── doorsapi64.dll
│   ├── aspSmartUpload64.dll
│   ├── ScriptControl64.dll
│   └── NitroVbx/              Servicio Windows
├── deps/                      Dependencias x64
│   └── msxml6.dll
├── install.cmd                Registra los componentes
├── uninstall.cmd              Desregistra
├── README.txt                 Resumen y comandos manuales
└── LICENSE.txt                EULA del binario
```

### Desinstalación

Ejecutar `uninstall.cmd` como administrador. Para revertir manualmente:

```cmd
sc stop NitroVbx && sc delete NitroVbx
regsvr32 /u doorsapi64.dll
%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\RegAsm.exe aspSmartUpload64.dll /unregister
regsvr32 /u ScriptControl64.dll
```

---

## Verificar

### Smoke test (pack completo)

Guardar como `check.vbs` y ejecutar con `cscript //nologo check.vbs`:

```vbs
On Error Resume Next

Set fyj = CreateObject("fyjson")
WScript.Echo "fyjson: " & IIf(Err.Number = 0, "OK", "FALLA — " & Err.Description)
Err.Clear

Set app = CreateObject("doorsapi.Application")
WScript.Echo "doorsapi64: " & IIf(Err.Number = 0, "OK", "FALLA — " & Err.Description)
Err.Clear

Set up = CreateObject("aspSmartUpload.SmartUpload")
WScript.Echo "aspSmartUpload64: " & IIf(Err.Number = 0, "OK", "FALLA — " & Err.Description)
Err.Clear

Set sc = CreateObject("MSScriptControl.ScriptControl")
WScript.Echo "ScriptControl64: " & IIf(Err.Number = 0, "OK", "FALLA — " & Err.Description)

Function IIf(cond, t, f)
    If cond Then IIf = t Else IIf = f
End Function
```

Salida esperada:
```
fyjson: OK
doorsapi64: OK
aspSmartUpload64: OK
ScriptControl64: OK
```

### Verificación rápida — solo doorsapi64

```cmd
cscript //nologo -e:vbscript
```
```vbs
Set s = CreateObject("doorsapi64.Session")
WScript.Echo "OK — Version: " & s.Version
```

---

## Ejemplos

### VBScript / cscript

```vbs
Set dSession = CreateObject("doorsapi64.Session")
dSession.ServerUrl = "https://miinstancia.fluye.ar/restful"
dSession.Logon "usuario", "password", "instancia"

' Abrir carpeta y buscar
Set fld = dSession.FoldersGetFromId(123)
Set docs = fld.Search("DOC_ID, NOMBRE, ESTADO", "ESTADO='Activo'", "DOC_ID DESC", 50)

For Each doc In docs
    WScript.Echo doc("DOC_ID") & " | " & doc("NOMBRE") & " | " & doc("ESTADO")
Next

' Crear un documento
Set nuevo = fld.DocumentsNew()
nuevo.Subject = "Alta desde script"
nuevo("NOMBRE") = "Juan Perez"
nuevo("EMAIL") = "juan@ejemplo.com"
nuevo.Save
WScript.Echo "Creado: " & nuevo.Id

' Modificar un documento existente
Set doc = dSession.DocumentsGetFromId(456)
doc("ESTADO") = "Cerrado"
doc.Save

dSession.Logoff
```

### Excel VBA

```vb
Sub ImportarDatos()
    Dim dSession As Object
    Set dSession = CreateObject("doorsapi64.Session")
    dSession.ServerUrl = "https://miinstancia.fluye.ar/restful"
    dSession.Logon "usuario", "password", "instancia"

    Set fld = dSession.FoldersGetFromId(123)
    Set docs = fld.Search("DOC_ID, NOMBRE, MONTO", "", "DOC_ID DESC", 500)

    Dim fila As Long: fila = 2
    For Each doc In docs
        Cells(fila, 1).Value = doc("DOC_ID")
        Cells(fila, 2).Value = doc("NOMBRE")
        Cells(fila, 3).Value = doc("MONTO")
        fila = fila + 1
    Next

    dSession.Logoff
    MsgBox "Importados " & (fila - 2) & " registros"
End Sub
```

### PowerShell

```powershell
$s = New-Object -ComObject "doorsapi64.Session"
$s.ServerUrl = "https://miinstancia.fluye.ar/restful"
$s.Logon("usuario", "password", "instancia")

$fld = $s.FoldersGetFromId(123)
$docs = $fld.Search("DOC_ID, NOMBRE", "ESTADO='Activo'", "DOC_ID DESC", 100)

foreach ($doc in $docs) {
    Write-Host "$($doc.Item('DOC_ID')) - $($doc.Item('NOMBRE'))"
}

$s.Logoff()
```

### ApiKey (conexión server-side sin usuario)

```vbs
Set dSession = CreateObject("doorsapi64.Session")
dSession.ServerUrl = "https://miinstancia.fluye.ar/restful"
dSession.ApiKey = "tu-api-key-de-SYS_SETTINGS"

' Ya conectado — usar normalmente
Set fld = dSession.FoldersGetFromId(123)
WScript.Echo "Carpeta: " & fld.Name & " — " & fld.DocumentsCount & " docs"

dSession.Logoff
```

La ApiKey se obtiene de `SYS_SETTINGS.API_KEY` de la instancia. No requiere usuario/password.

---

## REST Toolkit — JSON + HTTP sin aspJSON

`doorsapi64` incluye un parser JSON nativo y un cliente HTTP listos para usar desde VBScript. Reemplazan `aspJSON.asp` y `MSXML2.ServerXMLHTTP`.

### JSON (5× más rápido que V8)

```vbs
' Parsear
Set json = dSession.JsonParse("{""nombre"":""Juan"",""items"":[1,2,3]}")
WScript.Echo json("nombre")          ' "Juan"
WScript.Echo json("items")(0)        ' 1

' Modificar
json("nombre") = "Pedro"
json("items").Add 4

' Crear desde cero
Set obj = dSession.Rest.NewJson()
obj("cliente") = "Acme"
obj("total") = 15000
WScript.Echo obj.ToString()           ' {"cliente":"Acme","total":15000}

' Iterar
For Each key In json
    WScript.Echo key & " = " & json(key)
Next
```

### HTTP (requests a APIs externas)

```vbs
' GET
Set req = dSession.Rest.NewRequest()
req.Url = "https://api.ejemplo.com/clientes"
req.Method = "GET"
req.Headers("Authorization") = "Bearer mi-token"
req.Timeout = 30
Set resp = req.Send()
WScript.Echo resp.Status              ' 200
Set data = resp.Json                  ' JsonObject

' POST
Set req = dSession.Rest.NewRequest()
req.Url = "https://api.ejemplo.com/clientes"
req.Method = "POST"
req.Body = "{""nombre"":""Juan"",""email"":""j@x.com""}"
Set resp = req.Send()
```

### DoorsRequest (REST al server Doors con auth automática)

```vbs
Set req = dSession.Rest.NewDoorsRequest()
req.Path = "folders/123/documents/search"
req.Method = "POST"
req.Body = "{""fields"":""DOC_ID,NOMBRE"",""maxDocs"":100}"
Set resp = req.Send()

Set docs = resp.Json
For Each doc In docs
    WScript.Echo doc("DOC_ID") & ": " & doc("NOMBRE")
Next
```

---

## Benchmark

**doorsapi64 pulveriza al parser VBS clásico.** Los 15.000 docs que crashean aspJSON, los digiere en 7.7 ms. Como Node — a veces mejor.

| Docs | JSON | aspJSON (VBS) | Node v22 | doorsapi64 |
|------|------|---------------|----------|------------|
| 100 | 14 KB | 125 ms | 0.1 ms | **0.1 ms** |
| 1,000 | 142 KB | 7,941 ms | 1.5 ms | **0.3 ms** |
| 15,000 | 5.4 MB | crash | 52 ms | **7.7 ms** |

---

## Compatibilidad

### Windows

- **Server 2016+ / Windows 8.1+** — TLS 1.2 nativo, soporte completo.
- **Server 2008 R2 / Windows 7** — funcional con validación de licencia omitida (TLS incompatible con el endpoint de licencias).

### IIS

Application Pool x64 (`Enable 32-Bit Applications = False`) para la DLL 64-bit.

### DoorsBPM

`doorsapi64` se conecta al backend vía REST (`/restful/*`). Compatible con **Doors 7.4.38.1** en adelante — todos los métodos funcionan en v7 excepto los listados abajo.

#### Requiere Doors 8+

| Método | Endpoint REST |
|--------|---------------|
| `folder.App.NextVal(name)` | `GET sequences/{name}/nextval` |
| `dSession.Db.NextVal(name)` | `GET sequences/{name}/nextval` |
| `folder.AsyncEvents` (write) | `POST folders/{fldId}/asyncevents` |

#### Requiere Doors 9+

| Método | Endpoint REST |
|--------|---------------|
| `dSession.Db.OpenRecordset(sql)` | `POST db/query` |
| `dSession.Db.Execute(sql)` | `POST db/query` |
| `dSession.MasterDb.OpenRecordset(sql)` | `POST masterdb/query` |
| `dSession.MasterDb.Execute(sql)` | `POST masterdb/query` |
| `dSession.ClearAllCustomCache` | `POST session/clearAllCustomCache` |
| `dSession.ClearObjectModelCache(name)` | `POST session/clearObjectModelCache/{name}` |
| `dSession.TokensAdd(name, value)` | `POST session/tokens?name=&value=` |
| `dSession.TokensGet(name)` | `GET session/tokens?name=` |
| `dSession.LangString(id)` | `GET langstring/{id}` |
| `folder.App.CodeLib(name)` | `GET folders/{fldId}/codelib?name=` |
| `folder.App.ParseCodeIncludes(code)` | `POST folders/{fldId}/processcode` |
| `evn.ActiveCode` | `POST folders/{fldId}/processcode` |

Todo lo demás (Session, Document, Folder, Field, Attachment, Account, User, View, Properties, etc.) funciona en v7+.

---

## Licencia

- **`doorsapi64.dll`** — Binario propietario. **Free para scripts que corren como `admin`** (usuario builtin, ID=0) — instalás, registrás, funciona. **Multi-usuario** (procesos que autentican con distintas cuentas): licencia comercial por instancia, con verificación online. Términos completos: [`licencia.md`](licencia.md). Escribinos a **ventas@fluye.ar**.
- **`fyjson`** (incluido en `doorsapi64.dll`) — Open source. Repo: [fluye-ar/fyjson](https://github.com/fluye-ar/fyjson).
- **`NitroVbx`, `aspSmartUpload64`, `ScriptControl64`** — Binarios propietarios, uso libre.

Ver [LICENSE](../LICENSE) y la sección Licencia en el [README principal](../README.md#licencia).

## Soporte

- **Comercial:** `ventas@fluye.ar` — activación de licencias, cotizaciones, consultas comerciales.
- **Técnico:** `soporte@fluye.ar` — instalación, integración, incidentes post-install.

---

Jorge Pagano - Fluye Labs
