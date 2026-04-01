# VbScript - Emitir eventos del servidor

La biblioteca global **vbscript**, provee el método **sseDispatch** para emitir [eventos del servidor](js_server_sent_events.md).

```vb
#include vbscript

' Emite un evento del servidor
Set data = newDict()
With data
  .Add "docId", Doc.Id
  .Add "fldId", Folder.Id
End With

sseDispatch "myapp:myentity:myevent", data
```

## sseDocChange

Adicionalmente existe un método **sseDocChange**, que puedo llamarlo desde los eventos síncronos **beforeSave** o **afterSave**, o desde un evento asíncrono, para emitir un evento del servidor del tipo **doc:change**, con el **doc_id** y el **fld_id** del documento. Este evento se puede utilizar en el cliente para actualizar los controles cuando corresponda.

```vb
' Desde un evento síncrono o asíncrono
#include vbscript
sseDocChange "field1, field2" ' Campos adicionales a DOC_ID y FLD_ID que se incluyen en el evento, pasar "" si no es necesario
```

Para recibir el evento:

```javascript
// Desde el form de la web o el app
let sse = await dSession.node.serverEvents();
sse.addEventListener('doc:change', async ev => {
  let data;
  try { data = JSON.parse(ev.data) } catch (e) {};
  // Voy a recibir eventos doc:change de todos los folders, me fijo si es para mi
  if (data && data.fldId == myFolderId) {
    // Actualizar la info del doc data.docId
  }
});
```

Ing Jorge Pagano - Cloudy CRM
