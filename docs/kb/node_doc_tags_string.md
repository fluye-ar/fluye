# Node - doc.tags debe ser string (error 458 "Automation type not supported")

## Síntoma

Al renderizar un formulario **generic3 / generic1** (ASP clásico), un control revienta con:

```
Microsoft VBScript runtime error '800a01ca'
Variable uses an Automation type not supported in VBScript
/c/inc/global.asp, line 936     (Err.Number = 458)
```

En el log (`log/erYYMMDD.log`) aparece con el nombre del control:

```
458;Microsoft VBScript runtime error;Variable uses an Automation type not supported in VBScript;
LoggedExecuteGlobal-/c/forms/generic3.asp;...;Control=<nombre>
```

El control que falla lee un **tag del doc** en su `SCRIPTBEFORERENDER`, por ejemplo:

```vbscript
If Doc.Tags("puede_editar_origen").value & "" <> "1" Then
    this.ReadOnly = true
End If
```

## Causa

Un **evento síncrono en Node** (`events.js`) seteó ese tag con un valor **que no es string** — típicamente un **número**:

```javascript
// events.js - Document_Open
doc.tags.puede_editar_origen = 1;   // <-- número
```

El valor numérico marshalleado de JS al tag COM queda como un tipo que **VBScript no puede leer**: cualquier operación sobre `Doc.Tags("x").value` (incluso `TypeName(...)` o `& ""`) tira **error 458**.

**Contraprueba:** un tag seteado como **string** desde Node se lee perfecto. Ej: `doc.tags.controlsFolder = '/config/frmContactos'` (string) renderiza sin drama; `doc.tags.puede_editar_origen = 1` (número) rompe. Mismo doc, misma vía.

> Ojo: por **REST / lectura en Node** el tag numérico se lee bien (`typeof === 'number'`). El 458 salta **solo en la vía ASP/COM** (render generic3, eventos VBS). Por eso pasa desapercibido si solo se prueba por REST.

## Fix

Setear **siempre los tags como string** en los eventos Node:

```javascript
doc.tags.puede_editar_origen = '1';   // string
```

Regla general para migraciones VBS → Node: el VBS seteaba tags como string; replicar el tipo. Si un control VBScript va a leer `Doc.Tags("x").value`, el tag tiene que ser string.

## Cómo diagnosticarlo

1. En `log/erYYMMDD.log` buscar `Automation` → el campo `Control=<nombre>` dice qué control es.
2. Ver el `SCRIPTBEFORERENDER` de ese control → qué tag lee.
3. Ver en el `events.js` cómo se setea ese tag → si es número/objeto, ese es el bug.
4. (Opcional) Confirmar el tipo con `DebugPrint` en el render — **las variables VBScript no pueden empezar con `_`**:

```vbscript
On Error Resume Next : Dim dbgT : dbgT = TypeName(Doc.Tags("x").value) : dSession.DebugPrint "type=[" & dbgT & "] err=" & Err.Number, 0, "dbg" : On Error Goto 0
```

Sale en `log/dpYYMMDD.log`.

Jorge Pagano - Fluye Labs
