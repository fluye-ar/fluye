# Node - Correr un proceso asíncrono desde un evento síncrono

Si necesito realizar un proceso largo, como respuesta a un evento síncrono de documento, puedo dispararlo en un nuevo proceso asíncrono.

De esta forma el usuario no tiene que esperar la finalización del proceso largo, para recibir la confirmación de guardado.

Es recomendable hacer la llamada desde el evento **AfterSave**, para asegurarnos que el documento ya está guardado cuando se dispara el proceso asíncrono:

```javascript
// Document_AfterSave
if (doc.fields('processed').value != 1) { // flag
  dSession.node.exec({ // Sin await
    code: {
      repo: 'myRepo',
      path: 'pathto/afterSaveAsync.js',
    },
    payload: {
      doc: doc.id,
      folder: folder.id,
    },
  });
}
```

Y en **afterSaveAsync**:

```javascript
// afterSaveAsync
var payload = ctx.message.payload;
var folder = await dSession.folder(payload.folder);
var doc = await folder.doc(payload.doc);
/*
Procesar el documento aca ...
*/
doc.fields('processed').value = 1; // flag
await doc.save();
```

**IMPORTANTE**: Si voy a hacer un **save** del documento en el proceso asíncrono, usar un field de flag para que no entre en loop.

El proceso asíncrono corre en la misma sesión que el síncrono, asegurarse que ésta se mantenga abierta el tiempo necesario.

Los eventos síncronos de documentos tienen un timeout de 30 segundos, el resto de 2 minutos.

Ing Jorge Pagano - Cloudy CRM
