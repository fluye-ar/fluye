# Doors 7 - Instructivo de Instalación

> NOTA: Esta documentación se encuentra en construcción.

---

## Índice

1. Pre-requisitos para la instalación
2. Instructivo de instalación de la aplicación
3. Configuración de servicio Gestar.Doors.Server
4. Configuración de File Provider
5. Iniciar servicios
6. Configuración de IIS
7. Configuración de la Aplicación ASP
8. Generar aplicación para Doors Mobile (beta)
9. Configuración sitio web Gestar

---

## 1. Pre-requisitos

- Internet Information Services (IIS)
- .NET Framework v4.0 - [Descargar](http://www.microsoft.com/en-us/download/details.aspx?id=17718)
- WCF Memory Leak HotFix (Windows 64bits) - [Descargar](http://goo.gl/ptjIU)
- [Instalación IIS para Windows Server 2008](http://technet.microsoft.com/es-es/library/cc771209(v=WS.10).aspx)

## 2. Instalación de la Aplicación

1. Ejecutar instalador como administrador: `DoorsSetupv7.x.xxxx`
2. Pantalla de bienvenida → "Siguiente"
3. Seleccionar path de instalación (default: `C:\Program Files (x86)\Gestar\`) → "Siguiente"
4. Confirmación → "Instalar"
5. Seguir pasos de configuración post-instalación

## 3. Configuración de Gestar.Doors.Server

Archivo: `<PathInstalación>\server\Gestar.Doors.Server.exe.config`

### 3a. Cadena de Conexión a BD

Sección `<session>`, atributo `masterConnection`:

```
masterConnection="Provider=SQLOLEDB.1;Password=drs;Persist Security Info=True;User ID=apdoors;Initial Catalog=DBDesa;Data Source=Win2008Server"
```

### 3b. Carpetas de Referencia

```
silverlightReferencePath="<PathInstalación>\Server\SL"
```

### 3c. Ruta de Referencia de la Aplicación

```
applicationReferencePath="<PathInstalación>\Server"
```

### 3d. Repositorio de Exportaciones

```
exportRepositoryPath="<PathInstalación>\temp"
```

Debe estar dentro de la carpeta de instalación o tener permisos de escritura.

### 3e. Repositorio Compartido de Exportación

```
exportNetworkShare="\\<NombreDelServidor>\GestarTemp"
```

Si el website está en el mismo servidor, usar el mismo valor que `exportRepositoryPath`.

### 3f. Ruta de Ejecución de Eventos

```
serverScriptComExecutorPath="<PathInstalación>\server\ServerScriptComExecutor"
```

### 3g. Referencia al Website

```
webSiteInternalBaseUrl="http://localhost/w"
webSiteExternalBaseUrl="http://nombreservidor/w"
```

## 4. Configuración de File Provider

Sección `<fileProviders>`:

### ExternalAttachmentsProvider
```xml
<add name="ExternalAttachmentsProvider" type="Local" path="<PathInstalación>\db\att\"/>
```

### CodeCacheProvider
```xml
<add name="CodeCacheProvider" type="Local" path="<PathInstalación>\Server\CodeCache"/>
```

### AddinFileProvider
```xml
<add name="AddinFileProvider" type="Local" path="<PathInstalación>\Server\Addins"/>
```

## 5. Iniciar Servicios

### Gestar.Doors.Server
1. Abrir Windows Services
2. Seleccionar "Gestar.Doors.Server"
3. Propiedades → General → Tipo de inicio: "Automático"
4. Iniciar el servicio

### Gestar.Doors.FileServer
Misma configuración que Gestar.Doors.Server.

## 6. Configuración de IIS

### Verificar ASP.NET 4.0

Comando de registro si es necesario:
```
C:\WINDOWS\Microsoft.NET\Framework\v4.0.30319>aspnet_regiis.exe –i
```

Verificar en ISAPI and CGI Restrictions que "ASP.NET v4.0.30319" esté "Permitida".

### Crear Application Pool

1. Seleccionar "Grupo de aplicaciones" en IIS
2. Click derecho → "Agregar grupo de aplicaciones..."
3. Configurar:
   - Nombre: (personalizado)
   - Versión ASP.NET: v4.0
   - Modo de autenticación: Classic

### Configurar gestarWeb

1. Seleccionar la aplicación en IIS
2. Basic Settings → Elegir application pool
3. Verificar permisos de usuario

### Configurar Servicio REST

1. Editar `Gestar.Doors.Server.exe.config`
2. En sección `<services>`, editar `baseAddress`: reemplazar "w" por el nombre de la aplicación
3. Reiniciar Gestar.Doors.Server

### Application Pool Settings

- Habilitar ejecución de aplicaciones 32-bit: True
- Habilitar acceso a ruta primaria
- Configurar página de error HTTP 404

## 7. Configuración de la Aplicación ASP

### Habilitar Rutas de Acceso Primarias
1. Seleccionar website → ítem ASP
2. Modificar "Habilitar ruta de acceso primarias" a True
3. Click "Aplicar"

### Página de Error HTTP 404
1. Seleccionar aplicación → "Página de errores"
2. Doble-click en error 404
3. Seleccionar "Ejecutar una dirección URL en este sitio"
4. Ingresar: `<nombre_aplicacion>/pagenotfound.html`

## 8. Doors Mobile (beta)

1. Crear nuevo application pool con modo de autenticación "Integrada"
2. Seleccionar "gestarMobile"
3. Configurar pool para usar el grupo recién creado

## 9. Configuración Sitio Web

Parámetros modificables:
- `gestarLegacyBaseUrl` - Nombre de aplicación (default: "gestar")
- `gestarMobileBaseUrl` - Nombre de aplicación mobile (default: "gestarMobile")
- `restServiceUrl` - URL del servicio REST

## 10. Seguridad Gestar Components

Privilegios requeridos para la cuenta del Application COM+:
- Login local
- Login como servicio
- Miembro del grupo Users local
- Permisos read/write en carpeta de instalación

Configuración en: Component Services → COM+ Applications → "Gestar Components" → Properties → Identity

## 11. Edición doors.ini

Archivo: `<PathInstalación>\bin\doors.ini`

### AppNetVirtualDirectory
Cambiar de "w" al nombre real de la aplicación (ej: "gestarWeb")

### Sección [AsyncEvents]
- User, Password, InstanceName
- Password encriptada con Gestar Doors Crypto

### Sección [Session] - MasterConnection

SQL Server:
```
Provider=SQLOLEDB.1;Data Source=GestarServer;Initial Catalog=GestarDatabase;User ID=GestarUser;Password=GestarPassword
```

Oracle:
```
Provider=OraOLEDB.Oracle.1;Data Source=GestarDatabaseTNSName;User ID=GestarUser;Password=GestarPassword
```

### Otros Parámetros

| Parámetro | Descripción |
|-----------|-------------|
| DebugMode | 0 = desactiva debug output |
| LogDir | Carpeta para archivos de log |
| LogErrorsInEventLog | 1 = registrar errores en Event Log de Windows |
| LogErrorsInLogFiles | 1 = registrar errores en archivos de log |

## Troubleshooting

### .NET Framework 4.0 no instala
Instalar primero Windows Imaging Component (WIC) 32-bit:
[Descargar](http://go.microsoft.com/fwlink/?LinkId=162643&clcid=0x409)

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1BLkBlLVE40lIxiZIYZxj_NMaSWQLfFwv1U_axGDrl7Y/pub)
