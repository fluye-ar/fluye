# VbX — doorsapi64

> Parte del [VbX Toolkit](../../vbx/) — COM x64 nativo para DoorsBPM.

**Accede a DoorsBPM desde VBScript, VBA, PowerShell, Classic ASP o cualquier lenguaje COM.**

Reemplaza `doorsapi.dll` (VB6, 2005) + `doorsapiNet.dll` + WCF con una sola DLL C++ nativa que habla REST directo al server. De 4 capas a 2. Mismo `ProgId`, sin cambios en tu codigo.

```
VBScript / VBA / ASP
    |  Late binding (IDispatch nativo)
    v
doorsapi64.dll (C++ COM)
    |  HTTP REST (WinHTTP)
    v
Doors Server (/restful/*)
```

---

## Descargar

| Archivo | Para | Tamaño |
|---------|------|--------|
| **[doorsapi64.zip](https://cdn.fluye.ar/ghf/fluye/downloads/vbx/doorsapi64.zip)** | Windows 64-bit (recomendado) | 370 KB |
| **[doorsapi32.zip](https://cdn.fluye.ar/ghf/fluye/downloads/vbx/doorsapi32.zip)** | Windows 32-bit | 362 KB |

**Sin dependencias externas.** No necesita VC++ Redistributable, MSXML, ni VB6 Runtime.

---

## Instalar

Descomprimir el ZIP y abrir una terminal como **Administrador**:

### Windows 64-bit (lo mas comun)

Registrar **ambas** DLLs — la 64-bit para procesos x64 y la 32-bit para procesos x86 (ej. `cscript` 32-bit, Excel, Access):

```cmd
regsvr32 C:\ruta\doorsapi64.dll
C:\Windows\SysWOW64\regsvr32 C:\ruta\doorsapi32.dll
```

### Windows 32-bit

Solo la 32-bit:

```cmd
regsvr32 C:\ruta\doorsapi32.dll
```

### Verificar

```cmd
cscript //nologo -e:vbscript
```
```vbs
Set s = CreateObject("doorsapi64.Session")
WScript.Echo "OK — Version: " & s.Version
```

---

## Ejemplo rapido (VBScript / cscript)

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

## Ejemplo Excel VBA

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

## Ejemplo PowerShell

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

## Ejemplo ApiKey (conexion server-side sin usuario)

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

doorsapi64 incluye un parser JSON nativo y un cliente HTTP listos para usar desde VBScript. Reemplazan `aspJSON.asp` y `MSXML2.ServerXMLHTTP`.

### JSON (5x mas rapido que V8)

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

### DoorsRequest (REST al server Doors con auth automatica)

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

| Docs | JSON | aspJSON (VBS) | Node v22 | doorsapi64 |
|------|------|---------------|----------|------------|
| 100 | 14 KB | 125 ms | 0.1 ms | **0.1 ms** |
| 1,000 | 142 KB | 7,941 ms | 1.5 ms | **0.3 ms** |
| 15,000 | 5.4 MB | crash | 52 ms | **7.7 ms** |

---

## Compatibilidad

- **Windows:** Server 2012 R2+, Windows 8.1+ (TLS 1.2 nativo). Win7 requiere KB3140245.
- **DoorsBPM:** 7.4.38.1+ / Doors 8 / Doors 9
- **IIS:** Application Pool x64 (`Enable 32-Bit Applications = False`) para la DLL 64-bit

## Licencia

Gratis para uso **admin-only** (usuario builtin `admin`, ID=0). Uso multi-usuario requiere licencia comercial — escribir a **ventas@fluye.ar**.

## Soporte

**ventas@fluye.ar** — activacion de licencias, soporte tecnico, consultas.

---

Jorge Pagano - Fluye Labs
