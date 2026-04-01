# Estructura del message según el end-point en Node

Existen 3 end-point para procesar eventos en Node y estos difieren ligeramente en la estructura del message que se envía al evento.

## /exec (get y post)

El 1er end-point que se publicó. El código a ejecutar viene en el **queryString.msg** (get) o en el **body** (post). El body se envía como message como viene.

```javascript
url = 'https://node.cloudycrm.net/exec';

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    events: [{
      repo: 'global',
      path: 'test/srvcode.js',
      fresh: true,
    }],
    serverUrl: 'https://instance.cloudycrm.net/restful',
    authToken: "27D94...",
    mypayload: {
      hello: 'world',
    }
  }),
});

ctx.message = {
  "events": [
    {
      "repo": "global",
      "path": "test/srvcode.js",
      "fresh": true
    }
  ],
  "serverUrl": "https://instance.cloudycrm.net/restful",
  "authToken": "27D94...",
  "mypayload": {
    "hello": "world"
  },
  "workerThreadId": 1,
  "request": {
    //...
    "body": {
      "type": "Buffer",
      "data": [], // Viene como array de bytes xq parsea con rawParser
    }
  }
}
```

**ctx.message.request** es igual a **ctx.req** (ver [Variables globales en Node](variables_globales_node.md)).

Todos los métodos agregan al message el **request** y el **workerThreadId**.

## /gh y /ghcv (post)

Este end-point se creó inicialmente para obtener códigos de Github con get, y se adaptó para ejecutarlos con post. El código a ejecutar viene definido en la url. El body se agrega al message como property raíz, con el nombre **payload**.

**Se encuentra deprecado.**

## /ghx y /ghxcv (get y post)

Este end-point se creó para ejecutar códigos y reemplazar los end-point **/gh y /ghcv**. El código a ejecutar viene definido en la url. Si el body tiene serverUrl y apiKey o authToken, el mismo será el message, agregándole el evento que se extrae de la url. Si no tengo los parámetros de sesión, el body no se agrega al message, hay que tomarlo del request.

Es el sugerido para la ejecución de códigos.

```javascript
url = 'https://node.cloudycrm.net/ghxcv/global/test/srvcode.js?_fresh=1';

// Sin parametros de conexion
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mypayload: {
      hello: 'world',
    }
  }),
});

ctx.message = {
  "events": [
    {
      "repo": "global",
      "path": "test/srvcode.js",
      "fresh": true
    }
  ],
  "workerThreadId": 1,
  "request": {
    //...
    "body": {
      "mypayload": {
        "hello": "world"
      }
    }
  }
}

// Con serverUrl y authToken
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serverUrl: 'https://instance.cloudycrm.net/restful',
    authToken: "27D94...",
    mypayload: {
      hello: 'world',
    }
  }),
});

ctx.message = {
  "serverUrl": "https://instance.cloudycrm.net/restful",
  "authToken": "27D94...",
  "mypayload": {
    "hello": "world"
  },
  "events": [
    {
      "repo": "Global",
      "path": "test/srvcode.js",
      "fresh": true
    }
  ],
  "workerThreadId": 1,
  "request": {
    //...
    "body": {
      "serverUrl": "https://instance.cloudycrm.net/restful",
      "authToken": "27D94...",
      "mypayload": {
        "hello": "world"
      },
    }
  }
}
```

**IMPORTANTE**: Tener en cuenta que en **node.exec** (tanto js como vbs), existe un parámetro **payload** para enviar información al server. Este parámetro se agrega al body con el nombre **payload** (seria el **mypayload** de los ejemplos).

```javascript
dSession.node.exec({
  code: { repo: 'Global', path: 'test/srvcode.js', fresh: true },
  payload: {
    hello: 'world',
  },
});

ctx.message = {
  "serverUrl": "https://instance.cloudycrm.net/restful",
  "authToken": "27D94...",
  "payload": {
    "hello": "world"
  },
  "events": [
    {
      "repo": "Global",
      "path": "test/srvcode.js",
      "fresh": true
    }
  ],
  "workerThreadId": 1,
  "request": {
    //...
    "body": {
      "serverUrl": "https://instance.cloudycrm.net/restful",
      "authToken": "27D94..."
      "payload": {
        "hello": "world"
      },
    }
  }
}
```

Ing Jorge Pagano - Cloudy CRM
