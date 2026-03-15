# Doors 7 - Servicios SOAP

> NOTA: Esta documentación se encuentra en construcción.

---

## Introducción

Doors 7 expone capacidades de interacción con objetos mediante servicios SOAP implementados con WCF (Windows Communication Foundation). Los clientes inician comunicación y los servicios responden mensajes entre "endpoints".

## Tipos de Servicios Expuestos

| Servicio | Descripción |
|----------|-------------|
| Gestar.Doors.Services.DoorsService | Servicio principal |
| Gestar.Doors.Services.RestServices.DoorsService | Servicio REST |
| Gestar.Doors.Services.ComDoorsService | Servicio COM legacy |
| Gestar.Doors.Services.WinLogonService | Servicio de autenticación Windows |
| Gestar.Doors.Services.DoorsMonitorService | Servicio de monitoreo |

## Arquitectura Endpoint

Cada endpoint se define por: **Contract + Address + Binding**

### Contract
Interfaces como `IDoorsService` e `IComDoorsService` definen los métodos disponibles.

### Address
Define la ubicación del endpoint:
- Protocolo de transporte (TCP/HTTP)
- Máquina servidor
- Ruta de acceso completa

### Binding
Tipos soportados:
- BasicHttp
- BinaryHttp
- NamedPipe
- NetTcp

## Configuración (App.Config)

```xml
<service contextDataProvider="StaticProvider" useContextDataProvider="true">
  <endPoints>
    <add name="DoorsNetService" url="net.tcp://localhost:4502/Doors"
         connectionType="NetTcpBinding"/>
    <add name="DoorsComService" url="net.tcp://localhost:1003/DoorsLegacy"
         connectionType="NetTcpBinding"/>
  </endPoints>
</service>
```

## Ejemplo Cliente Consola (C#)

```csharp
// Crear sesión con GUID único
// Autenticación mediante LogOn()
// Obtener carpeta y documento
// Modificar campos customizados (NAME, SURNAME)
// Guardar con SaveDocument()
```

Credenciales ejemplo: `usuario="usuario", password="clave"`

## Tipos de Clientes Soportados

1. **Cliente WCF Consola** - Assemblies: Gestar.Core.Sys.NET.ObjectModelW, Gestar.Core.Sys.NET.Service, Gestar.Doors.Exceptions, Gestar.Util
2. **Cliente Web ASP.NET** - Código descargable
3. **Cliente Web Javascript/REST** - Solución con REST y Javascript

## Referencias

- Referencia servicios: http://cloudycrm.net/ref/services
- Documentación assemblies: http://crm.cloudyvision.com.ar/ref
- [Documentación WCF (Microsoft)](http://msdn.microsoft.com/es-es/library/ms731082.aspx)

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1FSA5Pz4k6wJGxHOY28624ap8OMcQ8e2JktyRxHKoQLQ/pub)
