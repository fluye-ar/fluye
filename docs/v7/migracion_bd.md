# Doors 7 - Migración de Base de Datos (5.1 a 7.0)

> NOTA: Esta documentación se encuentra en construcción.

---

## Proceso de Migración

Tres pasos obligatorios:

1. Ejecutar scripts de base de datos
2. Usar herramienta de actualización de carpetas
3. Aplicar herramienta de actualización de código

## 1. Scripts de Base de Datos

- Ubicación: [Carpeta en Google Drive](https://drive.google.com/folderview?id=0B9YvuksAiyaFQWlZUGJPaW1rdjQ)
- Numerados por orden de ejecución
- Aplicables a base master e instancias
- Seleccionar script "User tab columns" según versión del motor de BD

## 2. Herramienta de Actualización de Carpetas

- **Requisitos:** Microsoft Framework .NET v4.0
- **Archivo:** `RootFolderIdUpdater.exe`
- **Config:** `RootFolderIdUpdater.exe.config`
- **Descarga:** [Google Drive](https://drive.google.com/file/d/1BLeYFwiUFzRTTR_2f-0NOY6UPBU-D1WD/view)

### Configuración de Conexión

Parámetro `masterConnection` en sección `<session>`:

```
Provider=SQLOLEDB.1;Password=drs;Persist Security Info=True;User ID=apdoors;Initial Catalog=DBDesa;Data Source=Win2008Server
```

### Flujo de la Herramienta

1. Actualización de código incompatible
2. Actualización de rutas de carpeta
3. Cierre de conexiones y finalización

## 3. Consideraciones

- Ejecutar scripts en master Y en cada instancia
- Seleccionar script correcto según versión del motor de BD
- Cambios en acceso a Tags de documentos en Doors 7
- Ver [Consideraciones Doors 7](https://docs.google.com/document/d/1Unv67HavAI-No0T_MnTQZs5SIdNPYF-pPNegv09HKNs/pub)

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1hqdnpjONIPTn83r3o-Q30QifoPvR9IOcBzM8cB3OjP0/pub)
