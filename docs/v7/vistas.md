# Doors 7 - Vistas

> NOTA: Esta documentación se encuentra en construcción.

---

## ¿Qué son las Vistas?

Las vistas son diferentes formas de visualizar el contenido de carpetas de documentos. Se clasifican en:

- **Públicas:** Visibles para todos los usuarios con acceso a la carpeta
- **Privadas:** Visibles solo para el usuario que las creó

> Nota: Las vistas gráficas fueron fusionadas con las vistas estándar a partir de v7.2

## Trabajar con Vistas

Tres modos de visualización:

### Modo Tabla
Presenta los datos en formato de columnas y filas con grupos configurables.

### Modo Gráfico
Visualización de agrupaciones de datos en formato gráfico (barras, torta, etc.).

### Modo Calendario
Organización de documentos por fechas en un calendario visual.

## Búsqueda de Datos

### Búsqueda de Texto
Soporta operadores:
- **AND** - Ambos términos deben estar presentes
- **OR** - Al menos uno de los términos
- **NOT** - Excluir término

### Búsqueda Avanzada
Criterios por campo con operadores específicos según tipo de dato.

## Exportación

Formatos disponibles:
- **Excel** (.xls)
- **XML**

## Administración de Vistas

### Operaciones
- Crear nueva vista
- Editar vista existente
- Copiar vista
- Clonar vista
- Eliminar vista

### Propiedades de una Vista

| Propiedad | Descripción |
|-----------|-------------|
| General | Nombre, descripción, tipo |
| Campos | Columnas visibles y su orden |
| Filtros | Criterios de filtrado de documentos |
| Grupos | Agrupación de datos |
| Orden | Criterios de ordenamiento |
| Permisos | Quién puede ver/editar la vista |
| Estilo | Formato visual y colores |
| Calendario | Configuración de modo calendario |

### Acciones
Operaciones disponibles al editar vistas (menú contextual y barra de herramientas).

## Estilo de Fila

Permite diferenciar documentos visualmente según características específicas (ej: verde para pendientes, rojo para canceladas). Se genera CSS mediante scripts que se ejecutan por cada fila.

**Lenguaje:** VBScript (7.0 e inferiores) / JavaScript (7.1+)

**Objetos disponibles (7.1+):** `row` (objeto JS), `style` (cadena CSS), `total` (número, solo gráficos), `color` (CSS color). En 7.5+: `type` (`"data"`, `"chart"`, `"calendar"`).

**Operadores:**

| Operador | 7.0 | 7.1+ |
|----------|-----|------|
| Igualdad | `=` | `==` |
| Desigualdad | `<>` | `!=` |
| Mayor/Menor | `>` `<` | `>` `<` |
| Mayor/Menor o igual | `>=` `<=` | `>=` `<=` |

**Propiedades CSS:** `color` (RGB o nombre), `text-decoration` (`none`, `underline`, `overline`, `line-through`, `initial`, `inherit`).

**Ejemplos:**

```javascript
// Subrayado rojo
style = "color: #ff0000; text-decoration: underline;";

// Vencimientos en rojo
if (row.fecha_vencimiento < new Date()) {
  style = "color: red;";
}

// Estados cerrados: tachado gris
if (row.estado == 2) {
  style = "color: gray; text-decoration: line-through;";
}

// Estados abiertos: verde
if (row.estado != 2) {
  style = "color: green;";
}
```

**Configuración:** Se definen a nivel formulario, carpeta o vista. Herencia: Form → Folder → View. Acceso: Configuración → Editar vista → Solapa "Estilo de Fila". Se pueden agregar campos adicionales sin visualizarlos en la vista, necesarios solo para el código del estilo.

---

**Fuentes:** [Vistas](https://docs.google.com/document/d/19gXXTDDsPDveltvdRGVqWaStFZE0kmxPC0RDmfsiQic/pub), [Estilo de Fila](https://docs.google.com/document/d/12tQiUg1tXalhOElzty6bzJ9CgdjnFyFfbYpfbWdMXnQ/pub)
