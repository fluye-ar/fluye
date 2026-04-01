# VbScript - Llamar código Node desde Vbs

En la Global Codelib **node**, que se distribuye por Dispenser, encontramos la clase **clsNode**, que permite ejecutar un código Javascript en Node y obtener el valor de retorno.

## Uso básico

```vb
#include node
Set oNode = New clsNode
oNode.repo = "MiRepo"
oNode.path = "path/micodigo.js"
oNode.payload.add "folder", Folder.Id
oNode.payload.add "doc", Doc.Id
oNode.exec()
```

## Propiedades principales

| Propiedad | Descripción |
|-----------|-------------|
| `repo` | Nombre del repositorio en Github |
| `path` | Path al archivo JS dentro del repo |
| `payload` | Dictionary con datos a enviar al código JS |
| `async` | Si es True, no espera el resultado (fire & forget) |
| `fresh` | Si es True, fuerza recargar el código desde Github |
| `timeout` | Timeout en milisegundos |

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

## Modo asíncrono

```vb
Set oNode = New clsNode
oNode.repo = "MiRepo"
oNode.path = "path/micodigo.js"
oNode.async = True
oNode.exec() ' No espera el resultado
```

## En el lado Javascript

```javascript
var payload = ctx.message.payload;
// payload.folder, payload.doc, etc.

// El valor retornado llega a oNode.result
return { success: true, data: 'algo' };
```

Ing Jorge Pagano - Cloudy CRM
