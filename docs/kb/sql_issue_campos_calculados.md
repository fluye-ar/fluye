# Issue con campos calculados en SQL Server

---

## Presentación del Issue

### Ante la carga del campo calculado ingresado con nombre en minúsculas.

*(screenshots no disponibles en versión local)*

### Ante la carga del campo calculado ingresado con nombre con espacios.

En la visualización de la vista, que contenga este campo, no se muestra la información.

En la edición de la vista, que contenga este campo, arroja un error, como presenta la imagen.

*(screenshots no disponibles en versión local)*

---

## Solución del Issue

Para corregir este problema elimine el campo calculado y vuelva a crearlo con el nombre en mayúsculas, y evitando que el nombre de este contenga caracteres especiales.

*Ejemplo de nombre de campo calculado con un nombre correcto, sin espacios, ni caracteres especiales y en mayúsculas.*

*(screenshot no disponible en versión local)*

Luego accediendo con una cuenta con privilegios de administración, a la sección Carpetas de Sistema -> Administración de Formularios o Forms  y refrescar el caché de Forms, presionando cualquiera de los iconos de refrescar.

*(screenshot no disponible en versión local)*

Jorge Pagano - Fluye Labs
