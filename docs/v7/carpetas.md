# Doors 7 - Carpetas (Folders)

> NOTA: Esta documentación se encuentra en construcción.

---

## ¿Qué son las Carpetas?

Las carpetas son unidades de almacenamiento organizadas en una estructura jerárquica (padre-hijo). Son contenedores que almacenan documentos asociados a un formulario.

## Tipos de Carpetas

| Tipo | Descripción |
|------|-------------|
| Carpetas de Documentos | Asociadas a formularios para almacenar documentos |
| Carpetas Vínculo | Enlazadas a URLs externas |
| Carpetas Virtuales | Referencias a otras carpetas del sistema |
| Carpetas del Sistema | No modificables (7 tipos predefinidos) |

## Administración de Carpetas

### Crear Carpetas
1. Click derecho en el árbol → "Nueva carpeta"
2. Configurar propiedades generales (nombre, descripción, ícono)
3. Seleccionar tipo de carpeta y formulario asociado

### Copiar Carpetas
Seleccionar carpeta → menú contextual → "Copiar". Se copian estructura y configuración.

**Error:** No se puede copiar una carpeta dentro de sí misma (referencia circular).

### Mover Carpetas
Seleccionar carpeta → menú contextual → "Mover". Cambiar ubicación en la jerarquía.

**Error:** No se puede mover una carpeta dentro de sí misma.

### Eliminar Carpetas
Seleccionar carpeta → menú contextual → "Eliminar". Requiere confirmación.

**Error:** No se pueden eliminar carpetas con subcarpetas o documentos.

### Actualizar Árbol
Botón "Actualizar" para sincronizar el árbol de carpetas.

## Eventos de Carpetas

### Eventos de Formulario (por carpeta)
Código de eventos específico para la carpeta que complementa/sobreescribe los eventos del form.

### Eventos de Carpeta
Eventos específicos de operaciones de carpeta.

### Eventos Extra
Configuración adicional de eventos.

## Propiedades de Carpetas

| Propiedad | Descripción |
|-----------|-------------|
| General | Nombre, descripción, ícono |
| Tipo | Tipo de carpeta y formulario asociado |
| Log de campos | Configuración de auditoría |
| Permisos | Heredables y propios |
| Estilos | Formato de visualización |

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1oylO0lxGdHewDVq9jGQ_7kGuDYThhuVeRGmxfQfxmjc/pub)
