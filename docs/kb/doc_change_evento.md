# doc:change - Evento de documento modificado

A partir de la versión 8.0.0.5, **Doors** registra los documentos guardados mediante el envío de una notificación `doc:change` a `node.cloudycrm.net/ssevent`.

Esto permite recibir eventos de cambios de documentos en las páginas suscritas. Para más información consulte:
- [VbScript - Emitir eventos del servidor](vbs_emitir_eventos_servidor.md)
- [Js - Server-sent events](js_server_sent_events.md)

## Configurar campos extras en la notificación

Por defecto el servidor envía esta información ante el guardado de cualquier documento del sistema.

```json
{
  "data": {
    "DOC_ID": 123456,
    "FLD_ID": 123
  }
}
```

Para poder extenderlo, es decir, agregarle información extra, es posible mediante una Property de carpeta **SSE-EXTRAFIELDS**, donde el valor sean los campos que se desean agregar como datos extra.

Ejemplo:

- PropertyName = `SSE-EXTRAFIELDS`
- PropertyValue = `CREATED, APELLIDO, DIRECCION, EMAIL, AGENTACTIONS, CARGO, CELULAR, REFERIDOPOR_ID`

Para este último ejemplo de agregado de extrafields, el mensaje queda como el siguiente:

```json
{
  "data": {
    "FLD_ID": 1005,
    "DOC_ID": 266031,
    "CREATED": "2025-04-11T19:19:36.143",
    "APELLIDO": "MUNICIPALIDAD",
    "DIRECCION": "E. CARAFFA 300",
    "EMAIL": null,
    "AGENTACTIONS": null,
    "CARGO": null,
    "CELULAR": "3548588842",
    "REFERIDOPOR_ID": null
  }
}
```

## Deshabilitar el envío de notificaciones en una carpeta

Por defecto esta característica está habilitada para todas las carpetas de documentos.

Para deshabilitarla por carpeta es necesario establecer una propiedad en la misma con el nombre **SSE-DISABLE**, la cual toma el valor `1` para deshabilitar o `0` habilitado.

Ejemplo:

- PropertyName = `SSE-DISABLE`
- PropertyValue = `1`

## Recibir el evento

Ejemplo de recepción y procesamiento de eventos de cambio de documento:

```javascript
// Eventos de cambio de documentos
let srvEv = await dSession.node.serverEvents();
srvEv.addEventListener('doc:change', async ev => {
  let data = JSON.parse(ev.data);

  // Me fijo si es de mi carpeta
  if (data['FLD_ID'] == myFolder.id) {

    // Opcional, lo puede ver?
    let res = await myFolder.search({
      fields: 'doc_id',
      formula: `doc_id = ${ data['DOC_ID'] }`,
      maxDocs: 1,
    });

    if (res.length) procesarCambio(data['DOC_ID']);
  }
});
```

Ing Jorge Pagano - Cloudy CRM
