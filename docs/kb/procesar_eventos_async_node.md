# Procesar eventos asíncronos con Node

Usando [clsNode](vbs_llamar_node_desde_vbs.md), puedo procesar eventos asíncronos con Javascript. Para esto coloco el siguiente código en el AsyncEvent:

```vb
#include node
Set oNode = New clsNode
oNode.repo = "MiRepo"
oNode.path = "path/micodigo.js"
oNode.payload.add "folder", Folder.Id
oNode.payload.add "doc", Doc.Id ' Solo en triggers
oNode.exec()
```

**Nota:** No usar **async**, ya que el evento finaliza inmediatamente y el servicio cierra la sesión.

Encabezado del código Javascript:

```javascript
var payload = ctx.message.payload;
var folder = await dSession.folder(payload.folder);
var doc = await folder.doc(payload.doc); // Solo en triggers

// codigo de procesamiento del evento
```

**Nota:** La instancia del Document VbScript no estará sincronizada con la de Javascript, tener en cuenta si se hacen códigos mixtos.

Outbox implementa un timer en Node que recorre una carpeta con correos y los manda. Para más info [ver el código](https://github.com/CloudyVisionArg/Global/blob/main/outbox/timer.js).

Ing Jorge Pagano - Cloudy CRM
