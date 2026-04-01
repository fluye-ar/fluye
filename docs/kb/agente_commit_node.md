# AgenteCommitNode

**AgenteCommitNode** es una nueva función de la biblioteca global **vbscript**, que permite procesar el código cargado por el método **Agente** mediante una llamada asíncrona al método **runElevated** de la doorsapi JS.

Esto permite aliviar la carga del servicio Trigger Events, sobre todo en carpetas con gran cantidad de transacciones.

## Cómo utilizarlo

1. Obtener el ID del async event de tipo trigger que está procesando los documentos y desactivarlo.
2. Eliminar o comentar la línea `AgenteCommit`, que generalmente se encuentra en el `Document_BeforeSave`.
3. En `Document_AfterSave` agregar la llamada a `AgenteCommitNode`, pasándole el documento y el ID del evento asíncrono obtenido en el punto 1.

```vb
' En el BeforeSave o AfterSave:
' AgenteCommit Doc ' --> Comentar o borrar

' En el AfterSave
AgenteCommitNode Doc, 305 ' --> Incluir el evnId
```

Ing Jorge Pagano - Cloudy CRM
