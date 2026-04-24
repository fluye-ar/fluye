# Whatsapp Connector - Usando las funciones de base de datos

**Actualización 28 de Mayo de 2025**

- **WAPP5**: 5ta generación de funciones. Utilizan with(nolock) sobre la tabla WAPP_RESUME. Son creadas por el patch 38.

---

Whatsapp Connector genera funciones en la base de datos que sirven para crear campos calculados con información referida a los mensajes:

![Captura de funciones en la base de datos](notion_image_funciones_db.png)

Existen generaciones de funciones. Esto se debe a que las funciones no pueden ser modificadas una vez que se generan campos calculados a partir de las mismas, por lo que para mejorarlas hay que crear una nueva generación de funciones. El prefijo indica de que generación es la función:

- **WAPP**: 1ra generación de funciones. Trabajan con la tabla de mensajes. No son recomendables ya que tienen problemas de performance con grandes cantidades de mensajes.
- **WAPP2**: 2da generación de funciones. Trabajan con la tabla WAPP_RESUME que contiene el resumen de datos de cada conversación. El numero de teléfono debe estar tal como figura en WAPP_RESUME ya que comparan por igual (=).
- **WAPP3**: 3ra generación de funciones. Son iguales que la anterior pero aceptan teléfonos con espacio, guiones y sin la característica internacional (compara con comodín adelante). Se deben proveer al menos los 10 últ. dígitos del numero.
- **WAPP4**: 4ta generación de funciones. Corrigen los siguientes bugs:
  - LASTMSGIN y LASTMSGOUTSTAT: Devolvían siempre NULL cuando se especificaba **intPhone**.

**Que devuelven estas funciones?**

- **LASTMSG**: Texto del último mensaje entrante o saliente.
- **LASTMSGIN**: Texto del últ. mensaje entrante (enviado por el cliente).
- **LASTMSGINTIME**: Fecha del últ. mensaje entrante.
- **LASTMSGOUT**: Texto del últ. mensaje saliente.
- **LASTMSGOUTSTAT**: Estado del últ. mensaje saliente (queued, sent, delivered, read, failed, undelivered)
- **LASTMSGOUTTIME**: Fecha del últ. mensaje saliente.
- **MSGCOUNT**: Cantidad de mensajes en la conversación.
- **SESSION**: Devuelve un nro. entre 0 y 23, que indica hace cuantas horas se recibió el últ. mensaje del cliente. Después de las 24 horas la sesión se cae y la función retorna NULL.

**Como las utilizo?**

Suponiendo que tengo una carpeta de Oportunidades (Id de Form 555), con un campo CELULAR a través del cual chateo con el cliente por Whatsapp, puedo agregar campos que serán útiles en las vistas, como el texto y la fecha del últ mensaje intercambiado, y el estado de la sesión.

Las funciones reciben dos parámetros: el nro del cliente y el nro interno. El 1ro es obligatorio. El 2do me sirve para restringir la búsqueda a una conversación con un nro específico, o NULL para buscar en todas las conversaciones.

En una consola SQL hacemos:

```sql
alter table SYS_FIELDS_555 add WAPP_ULTIMO as dbo.WAPP3_LASTMSG(CELULAR, NULL)
alter table SYS_FIELDS_555 add WAPP_FECHAULT as dbo.WAPP3_LASTMSGTIME(CELULAR, NULL)
alter table SYS_FIELDS_555 add WAPP_SESION as dbo.WAPP3_SESSION(CELULAR, NULL)
```

Luego de actualizar el cache de formularios ya podemos agregar estos campos en las vistas:

![Captura de campos en la vista](notion_image_vista.png)

Si ordeno la vista por WAPP_FECHAULT descendente, los documentos con nuevos mensajes se moverán hacia arriba, como sucede con las conversaciones de Whatsapp.

---

Jorge Pagano - Fluye
