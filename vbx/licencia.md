# Licencia — doorsapi64

Somos **Fluye Labs**. Hicimos `doorsapi64.dll` para que tu código VBS/ASP legacy siga andando en 64 bits, sin tocar una línea. Esta es la licencia del binario.

`doorsapi64` es el único componente de VbX que se **distribuye standalone y se puede usar por afuera de Doors 9**. Los otros (`NitroVbx`, `aspSmartUpload64`, `ScriptControl64`, `msxml6.dll`) vienen **incluidos con Doors 9** y no se descargan por separado. `fyjson` va dentro de `doorsapi64.dll`.

---

## Uso gratuito — admin-only

Podés usar `doorsapi64` **sin costo, sin límite de tiempo**, cuando tus scripts corren con el usuario **`admin` builtin** de la instancia (ID=0). Típicamente: administración, importaciones batch, scripts server-side, integraciones.

Instalás, registrás, funciona.

## Uso comercial — multi-usuario

Si necesitás que `doorsapi64` corra autenticando con **distintos usuarios reales** (cada persona con su cuenta), necesitás una licencia comercial. Se paga **por instancia**, no por usuario.

La habilitación es **por instancia** y se verifica **online contra los servidores de Fluye Labs** — el servidor donde corre `doorsapi64` necesita **conexión a internet** para operar en modo multi-usuario.

Escribinos a **ventas@fluye.ar** — te pasamos precio y activación.

---

## Redistribución

**Podés redistribuir** `doorsapi64.dll` libremente — solo o empaquetado dentro de tu producto — mientras el uso siga siendo **admin-only**. El destinatario queda sujeto a los mismos términos: gratis para admin-only, licencia comercial para multi-usuario.

Redistribución en un contexto multi-usuario requiere acuerdo con Fluye Labs.

## Restricciones

- **No hacer reverse engineering** ni modificar la DLL. Si hay algo que necesitás y no está, hablalo con nosotros.
- **No usar** para actividades ilegales.

## Garantía

**Uso admin-only (gratuito):** `doorsapi64` se entrega **tal cual, sin garantía**. Arreglamos lo que rompa a la brevedad si nos lo reportás, pero no nos hacemos responsables por daños indirectos (lucro cesante, pérdida de datos, downtime).

**Uso multi-usuario (comercial):** los errores se atienden y resuelven **a la brevedad, sin costo**, mientras la licencia esté activa. La responsabilidad de Fluye Labs se limita al total pagado por la licencia en los **12 meses anteriores** al hecho. No responde por daños indirectos.

## Actualizaciones

Podemos actualizar estos términos avisando con **30 días de anticipación**. Los cambios no aplican retroactivamente a versiones ya instaladas.

## Jurisdicción

Ley argentina. Cualquier controversia se resuelve en los tribunales ordinarios de la ciudad de Córdoba.

---

Fluye Labs · [fluye.ar](https://fluye.ar) · pagano@fluye.ar

Jorge Pagano - Fluye Labs
