# Doors 7 - dapihttp

> NOTA: Esta documentación se encuentra en construcción.

---

## Introducción

dapihttp es una interfaz de servicios COM, similar a doorsapi (la interfaz principal de Doors hasta la versión 7), que permite comunicarse con un servidor de Doors mediante protocolo HTTP usando código similar.

## Arquitectura

dapihttp actúa como proxy COM que traduce llamadas locales a requests HTTP contra el servidor Doors. Esto permite utilizar código COM estándar desde VBScript, macros de Excel o aplicaciones ASP para acceder a un servidor remoto.

## Clases Documentadas

| Clase | Descripción |
|-------|-------------|
| Account | Cuenta de usuario |
| Application | Aplicación |
| AsyncEvent | Evento asíncrono |
| AsyncEventCollection | Colección de eventos asíncronos |
| Attachment | Archivo adjunto |
| AttachmentCollection | Colección de adjuntos |
| CustomForm | Formulario personalizado |
| Database | Base de datos |
| Directory | Directorio |
| Document | Documento |
| Field | Campo |
| FieldCollection | Colección de campos |
| Folder | Carpeta |
| FolderEvent | Evento de carpeta |
| FolderEventCollection | Colección de eventos de carpeta |
| FormEvent | Evento de formulario |
| FormEventCollection | Colección de eventos de formulario |
| Property | Propiedad |
| PropertyCollection | Colección de propiedades |
| Session | Sesión |
| SqlBuilder | Constructor de consultas SQL |
| User | Usuario |
| View | Vista |
| XML | Manejo de XML |

## Enumeraciones

- **DoorsAccountTypes** - Tipos de cuenta
- **DoorsDataTypes** - Tipos de dato
- **DoorsDbTypes** - Tipos de base de datos
- **DoorsFolderTypes** - Tipos de carpeta

## Ejemplos

### Ejemplo Básico

Conexión y operaciones básicas con dapihttp.

### Métodos No Implementados

Algunos métodos de doorsapi no están disponibles en dapihttp por limitaciones del protocolo HTTP.

### Manejo de Adjuntos

Operaciones de carga y descarga de archivos adjuntos vía HTTP.

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1Axv-NASYubUIVfVTaliWkn-eLaMGEgLKqRDd_k_kSO8/pub)
