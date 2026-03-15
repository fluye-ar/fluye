# Doors 7 - Instructivo de Actualización

> NOTA: Esta documentación se encuentra en construcción.

---

## Pre-requisitos

- Internet Information Services (IIS)
- .NET Framework v4.0
- Windows Imaging Component (WIC) para instalaciones de 32 bits

## Procedimientos de Desregistro

1. Eliminación de `doorsapi.dll` v5.1 mediante `regsvr32`
2. Desregistro de componentes COM+ desde Servicio de Componentes

## Instalación de Servicios

| Servicio | Descripción |
|----------|-------------|
| Gestar.Doors.Server | Servicio principal (.exe.config) |
| Gestar.Doors.FileServer | Servicio de gestión de archivos |
| Gestar.Doors.Agents | Servicio de agentes |

## Configuración Técnica

| Parámetro | Descripción |
|-----------|-------------|
| masterConnection | Cadena de conexión SQL Server |
| silverlightReferencePath | Ruta carpeta "SL" |
| exportRepositoryPath | Repositorio de exportaciones local |
| webSiteExternalBaseUrl | Dirección acceso público |

## Configuración IIS

- Creación de pools de aplicaciones
- Registro de tipos MIME (.xap, .xaml, .xbap)
- Configuración de páginas de error HTTP 404
- Habilitación ASP.NET 4.0

## Componentes COM+

1. Registro de `doorsapi.dll` v7
2. Incorporación de `doorsbiz.dll`
3. Configuración `Gestar.Core.Sys.NET.DoorsApiCOM.dll`

## Referencias

- [Instalación IIS](http://technet.microsoft.com/es-es/library/cc771209(v=WS.10).aspx)
- [.NET v4.0](http://www.microsoft.com/en-us/download/details.aspx?id=17718)
- [WCF HotFix 64bits](http://goo.gl/ptjIU)

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1NimTwgMvb4JSnmEqwV6WBzj9h73UMCthmzKil1mUREM/pub)
