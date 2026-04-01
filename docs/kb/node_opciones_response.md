# Node - Opciones para hacer response

## Update 21/10/24 - Objeto global `res`

A partir de esta fecha está disponible un objeto global **res**, wrapper del objeto response.

Este wrapper envía un mensaje no final al thread principal, para ejecutar la acción usando el response asociado al thread.

Los métodos deben ejecutarse con await ya que son todos asíncronos.

```javascript
var mime = await import('mime-types');

await res.set({
  'Content-Type': mime.lookup(myFileName),
  'Content-Disposition': `inline; filename="${ myFileName }"`,
  'Cache-Control': 'max-age=2592000', // 30 dias
});

await res.status(200);
await res.send(myBuffer);
```

La biblioteca **dynlib** que implementa esta clase es dinámica, es decir que se puede commitear un cambio y se actualiza al reciclar el server (no es necesario deployar).

[Ver métodos implementados](https://github.com/CloudyVisionArg/Events.v8/blob/main/server/dynlib.mjs)

**Importante:** Si hago un **res.send** estoy cerrando el canal, en este caso el valor final retornado por el proceso no podrá enviarse (se descarta).

No usarlo en eventos síncronos de documentos, ya que el response se utiliza para retornar el documento procesado.

---

## Update 12/8/24 - Tipo de retorno `response`

A partir de esta fecha podemos hacerlo de manera más directa utilizando el nuevo tipo de retorno **response**:

```javascript
var mime = await import('mime-types');

return {
  responseHeaders: {
    'Content-Type': mime.lookup(myFileName),
    'Content-Disposition': `inline; filename="${ myFileName }"`,
    'Cache-Control': 'max-age=2592000', // 30 dias
  },
  responseBuffer: myBuffer,
  // Otras propiedades:
  // responseText: 'Para enviar strings, tiene prioridad sobre Buffer',
  // responseStatus: 200,
}
```

---

## Método original - Tipo de retorno `code`

En los códigos Node no tengo disponible el objeto response, ya que estamos corriendo en un thread.

Para enviar un response podemos utilizar el tipo de retorno **code**. Por ejemplo, devolviendo un archivo de esta forma:

```javascript
let mime = await import('mime-types');

return {
  attName: myFileName,
  attStream: myBuffer,
  attType: mime.lookup(myFileName),
  code: `
    /*
    En este codigo tengo:
    - ctx.return: El objeto retornado
    - ctx.res: El response
    - ctx.req: El request
    */

    let mt = ctx.return.attType;
    if (mt) ctx.res.set('Content-Type', mt);
    ctx.res.set('Content-Disposition', 'attachment; filename="' + ctx.return.attName + '"');
    ctx.res.set('Cache-Control', 'max-age=2592000'); // 30 dias
    ctx.res.send(Buffer.from(ctx.return.attStream));
  `,
};
```

El server ejecuta el código retornado, el cual hace el response.

Ing Jorge Pagano - Cloudy CRM
