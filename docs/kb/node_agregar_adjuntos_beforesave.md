# Node - Agregar adjuntos en el syncEvent BeforeSave

En el syncEvent BeforeSave de un Document puedo agregar adjuntos que se hayan generado con Puppeteer por ejemplo.

Para esto tengo 2 opciones. Si uso `fileStream` para cargar el archivo, el archivo se guardará en la base de datos, y necesitaré esperar las promesas del documento antes de que finalice el código. Esperar las promesas no es necesario si hago un Save del documento después de adjuntar (porque el Save lo hace internamente), pero en el caso de un evento, debo esperar las promesas explícitamente. Ej:

```javascript
// Evento BeforeSave

let fileName = 'certificado.pdf';

// Genero el PDF
let cert = await dSession.node.exec({
    code: {
        repo: 'Vidacel',
        path: '/crm/evalrecol/certificado.js',
    },
    payload: {
        nombre: 'Jorge Pagano',
        fecha: new Date(),
        vencimiento: new Date(),
        fileName,
    },
});

// Agrego el adjunto
let att = doc.attachmentsAdd(fileName);
att.fileStream = cert;
await doc.awaitPromises(); // Espero las promesas del documento
```

## Usando fileStream2 (almacenamiento AWS)

Si uso **fileStream2**, que almacena los adjuntos en AWS, no es necesario esperar las promesas, ya que este método es asíncrono y las promesas se resuelven al llamarlo:

```javascript
// Agrego el adjunto
let att = doc.attachmentsAdd(fileName);
await att.fileStream2(cert); // Las promesas se resuelven internamente
```

Ing Jorge Pagano - Cloudy CRM
