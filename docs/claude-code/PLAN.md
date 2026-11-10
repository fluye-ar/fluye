# Entrenamiento Claude Code — Jorge

**Objetivo de la sesión: capacitación.** Los bugs que aparezcan se anotan y se van a un ticket aparte.

**Formato por módulo:** concepto en dos líneas → ejercicio corto donde el efecto se ve en pantalla → siguiente.

**Orden:** por fricción que ya tenés hoy, no por prolijidad conceptual.

**Leyenda:** ☐ pendiente · ✅ cerrado

---

## Punto de partida (relevado 2026-09-30)

| Qué | Estado hoy |
|---|---|
| Agentes propios | 2 — `gte-marketing`, `gte-operaciones` |
| Slash commands | 3 — `/facturar`, `/ticket`, `/backup` |
| Skills propias | 0 |
| Hooks | 0 |
| Permisos | `settings.local.json` suelto en 11 repos |

---

## ✅ 1 — Permisos

**El concepto:** cada vez que te pregunto "¿puedo correr esto?" es fricción evitable. Los permisos declaran de antemano qué puedo hacer sin consultar.

**Lo que vas a ver:** cuántas veces por sesión te pregunto lo mismo, y la lista quedando escrita.

**Ejercicio:** correr `/fewer-permission-prompts`, que lee tus transcripts reales y propone la lista.

---

## ✅ 2 — Hooks

**El concepto:** un hook lo ejecuta el harness, no yo. Una regla en el `CLAUDE.md` depende de que me acuerde; un hook corre siempre.

**Lo que vas a ver:** intentás guardar un archivo con un em-dash y te lo frena, sin que yo participe.

**Ejercicio:** el chequeo de non-ASCII de tu `CLAUDE.md` convertido en hook. Ya te mordió dos veces con PowerShell.

---

## ☐ 3 — Plan mode

**El concepto:** un modo donde puedo leer e investigar pero no puedo tocar nada. El plan se aprueba como paso separado.

**Lo que vas a ver:** me pedís que edite algo y no puedo, hasta que aprobás.

**Ejercicio:** un cambio en producción (vista o setting) planificado en ese modo, con el flujo mostrar → preguntar → aplicar que ya tenés escrito como regla.

---

## ☐ 4 — Trabajo en background

**El concepto:** lanzar algo largo y seguir trabajando. Cuando termina, me avisa solo.

**Lo que vas a ver:** la sesión sigue respondiendo mientras algo corre.

**Ejercicio:** una query pesada o un rsync largo, lanzado y monitoreado sin bloquear.

---

## ☐ 5 — Slash commands y skills

**El concepto:** empaquetar algo que repetís. Vos ya tenés tres; falta saber cuándo conviene uno nuevo.

**Lo que vas a ver:** la anatomía de `/ticket` por dentro.

**Ejercicio:** elegir una cosa que repetís a mano y convertirla.

---

## ☐ 6 — Agentes propios

**El concepto:** un charter le da a un agente rol, alcance y herramientas propias.

**Lo que vas a ver:** `gte-operaciones` por dentro, contra lo que realmente le pedís.

**Ejercicio:** afinarlo, o crear el que falta.

---

## ☐ 7 — Browser y MCP

**El concepto:** el navegador y Google Workspace como fuentes de datos.

**Lo que vas a ver:** leer la consola de una instancia en vivo.

**Ejercicio:** debuggear un form de Cloudy desde el browser.

---

## ☐ 8 — Agendado y entregables

**El concepto:** cosas que corren solas, y salidas publicables.

**Lo que vas a ver:** el health-check corriendo sin vos, y su resultado como página.

**Ejercicio:** `/schedule` sobre el health-check + Artifact del resultado.

---

## Visto pero no asimilado

**Subagentes y orquestación.** Los corrimos el 2026-09-30 sobre un caso real y funcionaron, pero
quedaron explicados al revés: la mecánica antes que el para qué. Retomar cuando el resto tenga
contexto, con ejercicios de dos minutos.

La idea de fondo, para cuando se retome: **delegar** (que el trabajo sucio pase en otro contexto
y vuelva sólo la conclusión) y **desconfiar** (que otro agente intente tumbar esa conclusión antes
de usarla). El resto es cómo se escriben esos dos movimientos.

---

## Anotado, no es de esta sesión

**Bug `ASP_WEB_FOLDER`.** Salió como subproducto de los ejercicios. Cinco focos reales
(Edisur + el instalador `wappcnn.vbs`), no los ~150 del primer barrido. El informe completo
está en el resultado del workflow `wf_f563c4f2-443`. **No es de esta sesión** — va a ticket aparte.

---

Jorge Pagano - Fluye Labs
