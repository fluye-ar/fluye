# Doors 7 - Async Events Services

> NOTA: Esta documentación se encuentra en construcción.

---

## Introducción

Los servicios de Eventos Asíncronos de Doors permiten monitorear carpetas y ejecutar acciones en background, cuando se producen cambios en los documentos de las mismas, o programar acciones que se ejecutan en forma periódica.

## Arquitectura

El sistema se compone de tres componentes:

1. **Doors Timer Events** - Servicio Windows que ejecuta eventos periódicos (timer)
2. **Doors Trigger Events** - Servicio Windows que ejecuta eventos por modificación de documentos (trigger)
3. **DoorsAPI** - Encola documentos modificados para ser procesados por Trigger Events

## Configuración

Los parámetros se configuran en el archivo `doors.ini`:

### Sección [AsyncEvents]

| Parámetro | Descripción |
|-----------|-------------|
| User | Usuario de Doors para autenticación |
| Password | Password encriptada (usar Gestar Doors Crypto) |
| InstanceName | Nombre de la instancia |

## Instalación

Registro de servicios en Windows:

1. Registrar Timer Events como servicio Windows
2. Registrar Trigger Events como servicio Windows
3. Configurar ambos con inicio automático

## Monitoreo de Carpetas

Interfaz para crear y administrar eventos asíncronos asociados a carpetas.

### Eventos Trigger

Se disparan cuando se modifica un documento en una carpeta monitoreada. El servicio Trigger Events procesa la cola de documentos modificados.

### Eventos Timer

Se ejecutan en forma periódica según programación:

| Programación | Ejemplo |
|-------------|---------|
| Cada N horas | Cada 2 horas |
| Diariamente | Todos los días a las 08:00 |
| Días específicos del mes | Día 1 y 15 de cada mes |
| Días de la semana | Lunes a Viernes |

## Windows Scripting Components

Los eventos asíncronos se implementan como objetos COM mediante Windows Script Components (archivos .wsc).

## Depuración

- Revisar logs en la carpeta de logs del agente
- Ubicación: `<PathInstalación>\agents\log\`
- Análisis de errores en los archivos de log

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1374-bmkZRHfapNR7tyVM9z2cDGbDlEq47vt0OaIWssk/pub)
