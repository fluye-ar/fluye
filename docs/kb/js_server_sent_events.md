# Js - Server-sent events

Los eventos del servidor sirven para enviar eventos de una ventana a otra, o desde un evento síncrono o asíncrono a una ventana por ej. El receptor siempre es un navegador, ya sea de la web o el app.

## Emitir un evento

```javascript
dSession.node.serverEventsDispatch({
    type: 'myapp:myentity:myevent',
    data: 'string u objeto con informacion del evento',
});
```

Los eventos son globales por instancia, se recomienda usar namespaces para mantener el orden.

## Suscribirse a un evento

```javascript
let sse = await dSession.node.serverEvents();
sse.addEventListener('myapp:myentity:myevent', async ev => {
  // ev.data viene como string, si mandé un objeto tengo que parsearlo
  let data;
  try { data = JSON.parse(ev.data) } catch (e) {};

  if (data) {
    // Proceso los datos recibidos en el evento
  }
});
```

## Eventos de cambio de documentos

Ver [doc:change - Evento de documento modificado](doc_change_evento.md).

Ing Jorge Pagano - Cloudy CRM
