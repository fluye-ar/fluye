# VbX — Toolkit COM x64 para Doors

**Tu código legacy ASP/VBS corriendo en 64 bits, sin tocar una línea.**

DoorsBPM corre en IIS 32-bit desde 2005: límite de 2 GB de RAM por proceso, dependencia a componentes discontinuados (MSXML 4.0, `msscript.ocx`, `aspSmartUpload`), y un stack de 4 capas (VBScript → VB6 COM → .NET COM → WCF → Server) para cada operación.

**VbX** reemplaza esos componentes con equivalentes x64 nativos manteniendo los mismos `ProgIds`. Se registran en el servidor, se cambia el Application Pool de IIS a x64 nativo, y el código existente sigue funcionando sin cambios.

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

## Compatibilidad por versión del server

doorsapi64 se conecta al backend vía REST (`/restful/*`). Compatible con **Doors 7.4.38.1** en adelante — todos los métodos funcionan en v7 excepto los listados abajo.

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

## Instalación

### Requisitos

- Windows Server 2016+
- IIS x64 con `Application Pool · Enable 32-Bit Applications = False`
- Permisos de administrador para registrar COM
- Doors 7.4.38.1+ / Doors 8 / Doors 9 (ver [Compatibilidad por versión](#compatibilidad-por-versión-del-server))

### Pasos

1. Descargar el pack desde [GitHub Releases](https://github.com/fluye-ar/fluye/releases) (último tag con prefijo `vbx-`).
2. Extraer el ZIP en una ubicación local (ej. `C:\vbx\`).
3. Click derecho sobre `install.cmd` → **Ejecutar como administrador**.
4. Validar con el smoke test (sección "Verificación" más abajo).
5. En IIS, cambiar el Application Pool de Doors a `Enable 32-Bit Applications = False`. Reiniciar el sitio.

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

### Registro manual

Si preferís ejecutar los pasos uno por uno (en cmd elevada):

```cmd
cd C:\vbx\bin

regsvr32 doorsapi64.dll
%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\RegAsm.exe aspSmartUpload64.dll /codebase
regsvr32 ScriptControl64.dll

sc create NitroVbx binPath= "C:\vbx\bin\NitroVbx\Doors.NitroVbx.exe" start= auto
sc start NitroVbx
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

## Verificación

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

---

## Versionado

[Semver](https://semver.org). Los releases se publican en [GitHub Releases](https://github.com/fluye-ar/fluye/releases) del repo `fluye-ar/fluye` con prefijo `vbx-`:

- `vbx-1.0.0` — Primer release público
- `vbx-1.0.1` — Patch
- `vbx-1.1.0` — Componente nuevo o feature

Cada release incluye changelog, hash SHA-256 del ZIP y firma digital opcional.

---

## Licencia

- **`doorsapi64.dll`** — Binario propietario. Gratis permanente para instancias **admin-only** (solo el usuario admin builtin, ID=0). Libre sin restricción hasta **2027-11-01**. Después: instancias multi-usuario requieren licencia comercial.
- **`fyjson`** (incluido en `doorsapi64.dll`) — Open source. Repo: [fluye-ar/fyjson](https://github.com/fluye-ar/fyjson).
- **`NitroVbx`, `aspSmartUpload64`, `ScriptControl64`** — Binarios propietarios, uso libre.

Ver [LICENSE](../LICENSE) y la sección Licencia en el [README principal](../README.md#licencia).

---

## Para el equipo Doors — armado del pack

> Este README es el spec del pack comercial. Lo que falta para tirar el primer release `vbx-1.0.0`:

### Build

- [ ] Workflow GitHub Action `vbx_release.yml` que compila todos los componentes en x64 y arma el ZIP.
- [ ] Build matriz: `doorsapi64` (C++) + `aspSmartUpload64` (C# .NET) + `ScriptControl64` (basado en `tsc64`) + `NitroVbx` (servicio Windows).
- [ ] Bundlear `msxml6.dll` desde `doors/com/vbx/deps/bin64/`.
- [ ] Verificar redistributables C++ que necesite `doorsapi64` (VC++ Runtime x64).

### Scripts del pack

- [ ] `install.cmd` — check elevation, copia `bin/` y `deps/` a `C:\vbx\` (o ruta configurable por env var), registra DLLs, instala servicio NitroVbx, corre smoke test.
- [ ] `uninstall.cmd` — para servicio, desregistra DLLs, opcionalmente borra carpeta.
- [ ] `README.txt` plano dentro del ZIP con los pasos copy-paste.
- [ ] `LICENSE.txt` con el EULA legal (redactar).

### Release

- [ ] Tag `vbx-1.0.0` en repo `fluye-ar/fluye`.
- [ ] Subir ZIP firmado al Release.
- [ ] Publicar SHA-256 en el cuerpo del Release.
- [ ] Notas con: componentes incluidos, versiones, requisitos, link al README de instalación.

### Smoke test post-instalación

- [ ] Reusar `check.vbs` documentado más arriba.
- [ ] Test extendido: logon, search, save de un documento via doorsapi64.

### Definir

- [ ] **EULA `doorsapi64`** — texto legal de "admin-only" gratis perm + libre hasta 2027-11-01 + multi-usuario comercial.
- [ ] Detección programática de "admin-only" (¿el binario lee `sys_acc_users` y verifica? ¿corre runtime check?).
- [ ] Firma digital de los DLLs (certificado code-signing).
- [ ] Política de soporte: a quién contactar ante una falla post-install.

---

Jorge Pagano - Fluye Labs
