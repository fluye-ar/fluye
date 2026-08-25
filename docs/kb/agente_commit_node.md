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

El `evnId` NO dispara ese evento: solo presta sus **credenciales** (`Login`/`Password`) para el logon elevado que corre el código del tag (`execVbs`). Debe existir en la instancia (si no, `runElevated` tira `Async event not found: <id>`). Ojo con la re-numeración de evnId al mover una instancia entre servers/masters.

## Sesión del caller efímera → apiKey (`AGENTS_APIKEY`)

**Problema.** Toda la cadena cabalga sobre el **token de la sesión del caller** (el sync event), que `clsNode` pasa a Events.v8 fire-and-forget (`node.vbs`: `Me.authToken = dSession.Token`). El worker arma el `dSession` con ese token, **sin logon**. Dentro de `runElevated` lo primero es `me.asyncEvents()` (GET restful con ese token) y antes `dSession.doc()`. Si la sesión del caller ya se cerró/expiró cuando el worker procesa (async, con carga se agranda la ventana), esas llamadas tiran **`La sesión no ha sido iniciada`** — sin fallback ni reintento, el ACL nunca se aplica. Es intermitente y correlacionado con carga.

**Fix.** Que la sesión del caller use un **apiKey persistente** en vez del token efímero. Una línea en la función `AgenteCommitNode` del codelib `vbscript`:

```vb
Set oNode = New clsNode
oNode.repo = "Global"
oNode.path = "server/agenteCommit.js"
oNode.async = True
oNode.apiKey = dSession.Settings("AGENTS_APIKEY") ' <-- sesión del caller persistente
```

`clsNode.exec` manda `apiKey` en lugar de `authToken` (`node.vbs`, rama `If Me.apiKey <> "" ... Else`), el worker autentica con apiKey (`RestClient.credentials` usa `ApiKey` si no hay authToken), y `dSession.doc()` / `asyncEvents()` dejan de depender de la sesión efímera.

**La parte elevada NO cambia.** `execVbs` (que corre el código del tag) va contra `execapi.asp` sobre **COM32**, que exige `authToken` y **no soporta apiKey** — sigue con el logon por `evnId`. El apiKey solo arregla la sesión del caller.

**Back-compat.** Sin el setting, `Settings("AGENTS_APIKEY")` viene vacío → cae a `authToken` (comportamiento viejo). Por eso el codelib se puede distribuir a todas las instancias sin romper nada; el fix se **activa** por instancia creando el setting.

### Activar en una instancia

1. Elegir/crear una **cuenta de servicio** (ej: `system` o `doorsevn`) con permiso de read + asyncevents sobre las carpetas involucradas.
2. Generarle un apiKey: `POST accounts/<accId>/apikey` (o botón "Generar Api Key" en el perfil del usuario).
3. Crear el setting copiando ese apikey:

```sql
INSERT INTO SYS_SETTINGS (SETTING, VALUE, DESCRIPTION)
SELECT 'AGENTS_APIKEY', APIKEY, 'ApiKey para Agentes'
FROM SYS_ACC_USERS WHERE ACC_ID = <accId> AND APIKEY IS NOT NULL;
```

4. Contraprueba: con ese apiKey, `currentUser` + `asyncEvents(<fldId>)` + `search` deben andar.

Referencia de aplicación real (Antun/Vidacel/Edisur): ticket `Clientes/Antun/tickets/260507 - Permisos`.

Jorge Pagano - Fluye Labs
