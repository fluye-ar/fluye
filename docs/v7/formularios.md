# Doors 7 - Formularios

> NOTA: Esta documentación se encuentra en construcción.

---

## ¿Qué son los Forms?

Los forms (formularios) especifican la estructura para documentos. Funcionan como plantillas de papel: organizan la información con una estructura definida. Un formulario completado con datos es un documento.

## Formularios del Sistema

| Form | Descripción |
|------|-------------|
| codelib | Almacén de bibliotecas de código |
| controls | Almacén de controles de UI |
| keywords3 | Almacén de keywords |
| settings3 | Parámetros de aplicación |
| sequences3 | Secuencias de documentos |
| post | Implementación de base de conocimiento |

### Null form (inbox)

Form especial (ID 0) que permite carpetas de documentos sin asociación a un form específico. Usa campos estándar comunes a todos los forms.

Campos de solo lectura: DOC_ID, FRM_ID, FLD_ID, ACC_ID, CREATED, MODIFIED, ACCESSED, FLD_ID_OLD

## Representación en Base de Datos

Cada form tiene dos partes:

1. **Tabla SYS_FORMS:** Metadatos del form (form_id, name, description, actions, application, guid, url, icon, acc_id, created, modified)
2. **Tabla SYS_FIELDS_[FormID]:** Datos específicos de los documentos

## Administrar Forms

Acceso via carpeta "Forms" en "Sistema de Carpetas".

### Crear Forms

1. Seleccionar "Agregar" del menú Forms
2. Asignar "Nombre"
3. Especificar "Descripción Raw" (soporta TOKENS)
4. Ingresar aplicación asociada
5. "URL Raw": usar `/forms/generic3.asp`

#### Generic + controls

`generic3.asp` renderiza dinámicamente el contenido del documento basado en la estructura del form. Opcionalmente trabaja con interfaces definidas por controles.

URL: `[APPVIRTUALROOT]/forms/generic3.asp`

#### Refrescar la estructura

Actualiza el cache de estructura del form cuando hay cambios via BD u otras sesiones. Click en botón "Actualizar" (ícono refresh).

### Editar Forms

Seleccionar ícono "Editar" (lápiz). Los cambios se auto-actualizan; ediciones por BD requieren refresh del cache.

### Eliminar Forms

Click en ícono "Eliminar" (papelera). Aparece diálogo de confirmación. No se pueden eliminar forms referenciados por carpetas.

**API:**
```vbscript
dSession.Forms(CLng("256")).Delete()
```

**Requisitos:**
- Permisos de delete en el form
- ReadOnly = False
- Form no referenciado por carpeta

**Acciones de eliminación:**
1. Elimina entradas SYS_ACC_FRM (permisos)
2. Elimina entradas SYS_SEV_FRM (eventos síncronos)
3. Elimina registro SYS_FORMS
4. Tabla SYS_FIELDS_[FormID] se preserva para recuperación

**SQL para encontrar tablas huérfanas:**
```sql
declare mycurs cursor for
select name from sysobjects
where xtype = 'U' and name like 'SYS_FIELDS_%'
and name not in (select 'SYS_FIELDS_' + convert(varchar(255),frm_id) from sys_forms)
```

## Propiedades de un Form

### Campos actuales

**Tipos de dato:**
- **Char:** Requiere especificar tamaño
- **Numeric:** Requiere precisión (dígitos max) y escala (decimales)
- **Date:** Sin parámetros adicionales

**Opciones:**
- Null: Permitir valores nulos
- Agregar campo: botón "Agregar"
- Eliminar campo: ícono papelera

> Las vistas de Doors sólo pueden mostrar información de un Form a la vez.

### Acciones del menú

Aparecen en menú "Documento" de las carpetas de documentos.

**Configuración:**
1. Nombre y Descripción (Descripción aparece en menú)
2. URL a archivo ASP: `[APPVIRTUALROOT]/directory/aspfile.asp?parameters`
3. Comentario describiendo la acción
4. Click "Agregar"

**Parámetros que se pasan:**
- `fld_id`: ID de la carpeta
- `selectedDocuments`: IDs de documentos separados por coma

**Ejemplo ASP:**
```vbscript
If Request("SelectedDocuments") & "" <> ""  Then
  docs_id = split(Request("SelectedDocuments"),",")
Else
  Response.Write "<script>alert('Seleccione algún documento'); history.back();</script>"
  Response.End
End if
```

### Eventos

12 eventos disponibles:

| Evento | Número |
|--------|--------|
| Document_Open | 1 |
| Document_BeforeSave | 2 |
| Document_AfterSave | 3 |
| Document_BeforeCopy | 4 |
| Document_AfterCopy | 5 |
| Document_BeforeDelete | 6 |
| Document_AfterDelete | 7 |
| Document_BeforeMove | 8 |
| Document_AfterMove | 9 |
| Document_BeforeFieldChange | 10 |
| Document_AfterFieldChange | 11 |
| Document_Terminate | 12 |

**Construcción del código de eventos:** Form event code + Folder event code + Code library includes

**Propiedades de eventos de form:**
- **Overridable:** Puede ser sobreescrito por código de evento de carpeta
- **Extensible:** Puede ser extendido por código de evento de carpeta

### Permisos

| Permiso | Código | Descripción |
|---------|--------|-------------|
| Leer | read | Permiso de lectura |
| Modificar | modify | Permiso de modificación |
| Borrar | delete | Permiso de eliminación |
| Administrar | admin | Administrar permisos |

**Entradas por defecto:**
- Creator Owner: Pre-configurado
- Everyone: Define comportamiento por defecto

### Información

Campos editables (solo forms existentes):
- Aplicación: Aplicación asociada
- URL de vista previa: Deprecado en v7
- Ícono Raw: Especificación del ícono

### Campos frecuentes

Orden predefinido de campos de uso frecuente. Mejora accesibilidad en vistas y búsquedas avanzadas.

Los campos frecuentes a nivel form se heredan a las carpetas asociadas; pueden ser sobreescritos.

### Estilo de fila

Código de formateo que evalúa valores de campos para definir visualización (color de fuente, fondo, modificación de valores, etc.).

Jerarquía de herencia: Form → Folder → View.

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1eLv73TYD1KtEwB4LiG8W4uAJmkq2qIIclTYg63UQi0M/pub)
