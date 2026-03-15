# Doors 7 - Remote DCE

> NOTA: Esta documentación se encuentra en construcción.

---

## Introducción

Remote DCE es el editor de código de Gestar que funciona vía HTTP para servidores remotos. No requiere instalación de Gestar en el PC cliente. Permite edición de código y generación de instaladores. Compatible con Gestar Doors 5.1 o posterior.

## Instalación

Descargar desde: [GitHub - Doors-rDCE Releases](https://github.com/CloudyVisionArg/Doors-rDCE/releases)

Proceso: Ejecutar el archivo descargado y seguir los pasos del instalador.

## Conexión al Sistema

1. Completar URL del Listener: `http://[nombre_servidor]/c/inc/dapihttplistener.asp`
2. Ingresar credenciales: Login, Password, Instancia
3. Botones disponibles:
   - **Logon** - Conectar
   - **Logoff** - Cerrar sesión
   - **Explore** - Abrir interfaz

## Interfaz de Exploración

### Explorador de Código

- **Panel izquierdo:** Árbol de carpetas (sistema y públicas)
- **Panel superior derecho:** Eventos síncronos y asíncronos
- **Panel inferior derecho:** Documentos y vistas
- Contenido en **negrita** posee código editable
- **Guardar cambios:** Ctrl + S
- Acceso: Ventana → Explorador de código

### Explorador de Archivos

- Acceso: Ventana → Explorador de archivos
- Buscar archivos por dirección o navegación tipo Windows
- **Mayúsculas:** carpetas; **minúsculas:** archivos
- Doble click abre script del archivo

## Generación de Script (Instaladores)

### Selección de Archivos

1. Menú "Instaladores" → "Modo Selección"
2. Seleccionar archivos con checkboxes
3. Click derecho ofrece opciones:
   - Actualizar
   - Seleccionar todo
   - Seleccionar por fecha de modificación
   - Seleccionar forms que usan (en construcción)
   - Deseleccionar todo

### Opciones del menú Instaladores

- Guardar selección (formato .xml)
- Cargar selección
- Borrar selección

### Generación

1. Menú "Instaladores" → "Generar scripts"
2. Indicar ubicación de guardado (.vbs)
3. Sistema genera archivo de texto con el script

## Instalación de Script

1. Carpetas del Sistema → Herramientas → Ejecución de código (GExec)
2. Abrir archivo .vbs con bloc de notas
3. Copiar contenido y pegar en CRM
4. Borrar líneas de código por defecto
5. Nota: descomentar línea para desactivar eventos síncronos
6. Presionar botón "Execute (F9)"

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/e/2PACX-1vTUzz0379NUpKiq4zVnZqjTG0YPqG_zzCAnEwkiFFIVY4O-UpTE3OIXbhuRT5pxKJNLZOYQzuxE9riF/pub)
