# Fluye Browser SDK

Utilidades JavaScript para aplicaciones web con Fluye. Complementa a `client.mjs`.

## Quick Start

```html
<script src="https://cdn.fluye.ar/ghf/fluye/browser.js"></script>
<script>
(async () => {
    await fluye.connect();  // Conecta a sesión (redirect a login si no está logueado)

    const user = await fluye.session.currentUser;
    console.log('Logged as:', user.name);

    // Usar client.mjs normalmente
    const folder = await fluye.session.folder(1234);
    const docs = await folder.search({ fields: 'DOC_ID,NOMBRE' });
})();
</script>
```

---

## Objeto Global `fluye`

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `fluye.session` | Session | Sesión de client.mjs (después de init/connect) |
| `fluye.client` | Module | Módulo client.mjs importado |
| `fluye.urlParams` | URLSearchParams | Parámetros de URL (`?param=value`) |
| `fluye.bs` | Object | Utilidades Bootstrap 5 |
| `fluye.mods` | Object | Contenedor para módulos custom |

---

## Métodos Principales

### `fluye.init()`

Inicializa el cliente y crea la sesión (sin autenticar).

```javascript
await fluye.init();
// fluye.session está disponible pero no autenticado
```

### `fluye.connect()`

Conecta a la sesión web. Si no hay sesión activa, redirige al login.

```javascript
await fluye.connect();
// fluye.session está autenticado y listo para usar
```

### `fluye.load(assets)`

Carga scripts o CSS dinámicamente. Soporta dependencias.

```javascript
// Por ID predefinido
await fluye.load('jquery');
await fluye.load('bootstrap');
await fluye.load(['bootstrap', 'bootstrap-css', 'bootstrap-icons']);

// Custom
await fluye.load({ id: 'mi-lib', src: 'https://example.com/lib.js' });

// Con dependencias
await fluye.load([
    { id: 'jquery', src: 'https://code.jquery.com/jquery-3.7.1.min.js' },
    { id: 'mi-plugin', src: '/js/plugin.js', depends: ['jquery'] }
]);
```

**IDs predefinidos:**

| ID | URL |
|----|-----|
| `jquery` | jquery-3.7.1.min.js |
| `bootstrap` | bootstrap@5.3.3 bundle.min.js |
| `bootstrap-css` | bootstrap@5.3.3 css |
| `bootstrap-icons` | bootstrap-icons@1.11.3 css |

### `fluye.downloadFile(buffer, fileName)`

Descarga un buffer como archivo.

```javascript
const att = await doc.attachments('documento.pdf');
const buffer = await att.fileStream;
fluye.downloadFile(new Blob([buffer]), 'documento.pdf');
```

### `fluye.submitData(options)`

Envía datos vía POST a una nueva ventana (útil para reportes, exports).

```javascript
fluye.submitData({
    url: '/api/export',
    data: {
        format: 'excel',
        ids: '1,2,3'
    },
    method: 'POST',      // default
    target: '_blank'     // default
});
```

---

## Bootstrap 5 Utilities (`fluye.bs`)

Requieren jQuery y Bootstrap 5.

### `fluye.bs.load()`

Carga Bootstrap 5 completo (JS + CSS + Icons).

```javascript
await fluye.bs.load();
```

### `fluye.bs.preloader`

Spinner fullscreen semi-transparente.

```javascript
fluye.bs.preloader.show();
// ... operación larga ...
fluye.bs.preloader.hide();
```

### `fluye.bs.toast(text, options)`

Muestra notificaciones toast.

```javascript
// Simple
fluye.bs.toast('Guardado exitosamente');

// Con opciones
fluye.bs.toast('Procesando...', {
    autohide: false,
    title: 'Mi App',
    delay: 5000
});

// Con progress bar
const $progress = $('<div class="progress"><div class="progress-bar" style="width:0%"></div></div>');
const t = fluye.bs.toast($progress, { autohide: false });
// Actualizar progreso...
t.hide();
```

**Opciones:**

| Opción | Default | Descripción |
|--------|---------|-------------|
| `autohide` | true | Ocultar automáticamente |
| `delay` | 3000 | Delay en ms antes de ocultar |
| `title` | 'Fluye' | Título del toast |
| `subtitle` | '' | Subtítulo |
| `icon` | logo fluye | URL del icono |

### `fluye.bs.tabClick(ev)`

Handler para tabs Bootstrap 5 y Framework7.

```javascript
$('.nav-link').on('click', fluye.bs.tabClick);
```

### `fluye.bs.inputFileAttachments(options)`

Carga archivos de un input como adjuntos al documento.

```javascript
await fluye.bs.inputFileAttachments({
    input: document.getElementById('fileInput'),
    doc: miDocumento,
    tag: 'documentos',     // opcional: asigna a att.description y att.group
    storage: 's3',         // 's3' (default) o 'db'
    callback: (att) => {   // opcional: se llama por cada adjunto
        console.log('Adjunto cargado:', att.name);
    }
});
await doc.save();
```

### `fluye.bs.version`

Versión de Bootstrap cargada.

```javascript
fluye.bs.version      // [5, 3, 3]
fluye.bs.version[0]   // 5
```

---

## Patrones Comunes

### Página protegida con Bootstrap

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Mi App</title>
</head>
<body>
    <div class="container py-4">
        <h1>Mi Aplicación</h1>
        <div id="content"></div>
    </div>

    <script src="https://cdn.fluye.ar/ghf/fluye/browser.js"></script>
    <script>
    (async () => {
        await fluye.bs.load();
        await fluye.connect();

        // Tu código aquí
        const folder = await fluye.session.folder(1234);
        const docs = await folder.search({ fields: 'DOC_ID,NOMBRE' });

        let html = '<ul>';
        docs.forEach(d => html += `<li>${d.NOMBRE}</li>`);
        html += '</ul>';
        document.getElementById('content').innerHTML = html;
    })();
    </script>
</body>
</html>
```

### Upload de archivos con progreso

```html
<input type="file" id="files" multiple>
<button onclick="upload()">Subir</button>

<script>
async function upload() {
    fluye.bs.preloader.show();

    const doc = await folder.documentsNew();
    await fluye.bs.inputFileAttachments({
        input: document.getElementById('files'),
        doc: doc,
        storage: 's3'
    });
    await doc.save();

    fluye.bs.preloader.hide();
    fluye.bs.toast('Archivos subidos');
}
</script>
```

### Fresh URL para desarrollo

```javascript
// Agrega ?_fresh=1 a la URL para bypass de cache del CDN
// https://mi-app.com/page.html?_fresh=1

if (fluye.urlParams.get('_fresh') == '1') {
    console.log('Modo desarrollo - sin cache');
}
```

---

## Ver también

- [client.md](client.md) - SDK JavaScript completo

---

**Ing Jorge Pagano - Fluye**
