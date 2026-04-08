# VbScript - Llamar código Node desde Vbs

En la Global Codelib **node**, que se distribuye por Dispenser, encontramos la clase **clsNode**, que permite ejecutar un código Javascript en Node y obtener el valor de retorno.

El retorno puede ser:
- Un escalar
- Un objeto aspJSON
- El ServerXMLHTTPRequest (xhr) en caso que el retorno sea mayor a 32 kb o no se pueda parsear como json (un PDF por ej).

## Uso básico

Este código ejecutado en gexec2.asp devuelve el nombre de la carpeta que se envía como parámetro.

```vb
#include node
Set oNode = New clsNode
oNode.repo = "Global"
' oNode.ref = "dev" ' Branch / tag
oNode.path = "test/fldname.js"
' oNode.fresh = True ' Copia fresca del código, no usar en produccion
' oNode.async = True ' No espera la respuesta, default False
oNode.timeout = 30 ' Timeout en segundos, default 60
oNode.payload.Add "folder", 1001
Response.Write oNode.exec()
```

- `async` puede usarse en caso que no sea necesario esperar la respuesta. Mantener la sesión abierta después de la llamada sino el código Node dará error.
- `payload` es un Dictionary que se anexa al aspJSON de la petición, se le puede dar estructura de la misma forma que a este.

## Propiedades principales

| Propiedad | Descripción |
|-----------|-------------|
| `repo` | Nombre del repositorio en Github |
| `ref` | Branch / tag del repositorio |
| `path` | Path al archivo JS dentro del repo |
| `payload` | Dictionary con datos a enviar al código JS |
| `async` | Si es True, no espera el resultado (fire & forget) |
| `fresh` | Si es True, fuerza recargar el código desde Github |
| `timeout` | Timeout en segundos (default 60) |

## Obtener el resultado

```vb
Set oNode = New clsNode
oNode.repo = "MiRepo"
oNode.path = "path/micodigo.js"
oNode.exec()

If oNode.success Then
  Dim result
  result = oNode.result ' Resultado retornado por el JS
End If
```

## Retorno de Buffer (archivos, PDFs)

En caso que el código JS retorne un Buffer (un archivo por ejemplo), se puede convertir el retorno en un Stream:

```vb
#include node

' Llama el js
Set oNode = New clsNode
oNode.repo = "Vidacel"
oNode.path = "/crm/evalrecol/certificado.js"
With oNode.payload
	.Add "nombre", "Jorge Pagano"
	.Add "fecha", FormatDateTime(Now, 2)
	.Add "vencimiento", FormatDateTime(DateAdd("yyyy", 1, Now), 2)
	.Add "fileName", "certificado.pdf"
End With
Set xhr = oNode.exec() ' Recibo el resultado con Set

' Convierte a Stream
Set oStream = CreateObject("ADODB.Stream")
oStream.Type = 1 ' adTypeBinary
oStream.Open
oStream.Write xhr.responseBody

' Procesar el stream (SaveToFile, Attachments.Add, etc.)

oStream.Close
```

Con el Stream se puede hacer `oStream.SaveToFile`, o pasárselo a `Attachments.Add` por ejemplo.

**Nota:** La propiedad `responseStream` del objeto xhr no es compatible con VbScript, por eso el workaround con ADODB.Stream.

## Detectar el tipo de retorno

Si no se sabe qué tipo de retorno tendrá la llamada, se puede recibir de esta forma:

```vb
arr = Array(oNode.exec())

If TypeName(arr(0)) = "IServerXMLHTTPRequest2" Then
	' Vino el xhr (buffer/archivo)
	Response.Write Len(arr(0).responseBody)

ElseIf TypeName(arr(0)) = "aspJSON" Then
	' Vino un json
	Response.Write arr(0).toString()

Else
	' Vino un escalar (__value__)
	Response.Write arr(0)

End If
```

## modCall: Llamar a funciones de módulos

Los módulos (.mjs) no pueden ejecutarse directamente, necesitamos escribir un .js que importe el módulo, llame a la función pasándole los parámetros que enviamos desde VbScript, y retorne el valor.

Para simplificar esto existe **modProxy**, un js que recibe módulo, función y parámetros y realiza estas acciones.

### Forma manual (sin modCall)

```vb
#include node
Set oNode = New clsNode
oNode.repo = "Global"
oNode.path = "server/modproxy.js"
oNode.payload.Add "module", oNode.newDict
With oNode.payload("module")
	.Add "repo", "Global"
	.Add "path", "workflow.mjs"
End With
oNode.payload.Add "method", "htmlEncode"
oNode.payload.Add "args", "<br>"
Response.Write oNode.exec()
```

### Forma simplificada con modCall

`clsNode` ofrece el método `modCall` que simplifica la llamada:

```vb
#include node
Set oNode = New clsNode
oNode.repo = "Global"
oNode.path = "workflow.mjs"
Response.Write oNode.modCall("htmlEncode", "<br>")
```

En `repo`, `path`, etc, se pasan los parámetros correspondientes al módulo que se desea llamar. Internamente modCall reemplazará éstos por los de modProxy y cargará los parámetros del módulo en el payload.

### Variantes de modCall según parámetros

```vb
#include node
Set oNode = New clsNode
oNode.repo = "Global"
oNode.path = "workflow.mjs"

' UN solo parámetro de tipo escalar
Response.Write oNode.modCall("htmlEncode", "<br>")

' Sin parámetros (pasar Empty)
Response.Write oNode.modCall("newMessage", Empty)

' Múltiples parámetros (pasar un array)
Response.Write oNode.modCall("dateAdd", Array("2024-02-15 16:00", 90, "m"))

' Un parámetro de tipo objeto Json
oNode.repo = "Global"
oNode.path = "wappcnn/wapp.mjs"

Set arg = oNode.newDict
With arg
	.Add "to", "543515284577"
	.Add "body", "Te mando el logo de Cloudy"
	.Add "mediaUrl", "https://cdn.cloudycrm.net/ghcv/cdn/img/iso.jpg"
End With

Response.Write oNode.modCall("send", arg)
```

En el último ejemplo, se arma el json con un Dictionary. Para más info ver aspJSON.

## Propiedades avanzadas de clsNode

```vb
oNode.nodeServer = "https://..."      ' Default: https://node.cloudycrm.net
oNode.nodeDebugServer = "..."          ' Default: https://nodedev.cloudycrm.net
oNode.debug = True                     ' Usa el DebugServer. Default: False
oNode.serverUrl = "..."                ' Endpoint REST de la instancia.
                                       ' Default: "https://" & LCase(dSession.InstanceName) & ".cloudycrm.net/restful"
oNode.authToken = "..."                ' Token de sesion. Default: dSession.Token
oNode.apiKey = "..."                   ' Si está seteado tiene prioridad sobre authToken
```

## En el lado Javascript

```javascript
var payload = ctx.message.payload;
// payload.folder, payload.doc, etc.

// El valor retornado llega a oNode.result
return { success: true, data: 'algo' };
```

Ing Jorge Pagano - Cloudy CRM
