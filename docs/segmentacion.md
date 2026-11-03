# Segmentación de datos — vistas con filtro raw

Patrón para armar vistas de carpeta que filtren por criterios complejos (subconsultas, EXISTS, agregaciones, exclusiones múltiples) usando **una sola vista** con filtro raw. Reemplaza el patrón viejo "vista SQL auxiliar + vista de carpeta".

Audiencia: Wiz, agentes, operadores humanos.

## Cuándo aplica

Cualquier pedido del user que describa **un conjunto de documentos definido por filtros**, aunque no diga "segmentar". Ejemplos reales:

- "Quiero mandar un WhatsApp a las alumnas que hicieron el curso X"
- "Sacame los clientes que no compraron en los últimos 6 meses"
- "Armá una campaña con los leads que vinieron de Instagram y están sin asignar"
- "Lista de productos sin stock que tienen pedidos pendientes"

Si el user describe un conjunto por filtros y lo quiere ver como vista, listado o audiencia de campaña → **es una segmentación**. Seguí este doc.

Lo que **no** es una segmentación: pedidos de dato único (`¿cuántos leads hay?`), rankings, totales, consultas de un documento puntual. Esos los resolvés con `search()` o `searchGroups()` directo.

## El patrón, en una frase

Una vista de carpeta con `formula = "{{raw}}<SQL concatenado al WHERE>{{/raw}}"`. El SQL va crudo entre los delimitadores — el parser no toca nada ahí adentro.

## Cómo armar la fórmula

### Regla #1: dentro del raw nada se califica solo

El parser de `SYS_VIEWS.FORMULA` normalmente reemplaza los tokens que coinciden con un campo del form por `TABLA.CAMPO`. **Dentro del raw no hace eso.** Por lo tanto:

- Los campos del form del folder principal van **con tabla explícita**: `SYS_DOCUMENTS.DOC_ID`, `SYS_FIELDS_432.ESTADO`, no `DOC_ID` ni `ESTADO`.
- Las subconsultas tienen alias de tabla si referencian campos ambiguos.
- Nombres de tabla, columnas y aliases son responsabilidad tuya — si inventás un nombre, el error salta recién al momento del `search()`.

### Regla #2: verificá los campos antes de escribirlos

Los campos del form principal te llegan en el system prompt. Para campos de **otros folders** (subconsultas) tenés que resolver vos:
- El `FRM_ID` del folder de donde vienen (`SYS_FOLDERS` → `FORM_ID`).
- La tabla real: `SYS_FIELDS_<FRM_ID>`.
- Las columnas: los nombres de campo del form (los ves en el prompt del folder, o resolvés via `search()` sobre el form).

Si tenés dudas sobre si un campo existe, **confirmalo con un `search` chico antes de armar la vista**. Más barato eso que un rollback.

### Regla #3: un solo artefacto, el flow lo refleja

El user ve una sola vista. El pedido se resuelve con **una** llamada a `folder.viewsNew() + nv.save()`. No hay `CREATE VIEW` previo, no hay `vdoc_id`.

Si estás por escribir `CREATE VIEW` en el camino, estás volviendo al patrón viejo — pará.

## Ejemplo canónico: campaña PEELVERANO (Amatista)

*Necesidad*: alumnas (folder 5103) que hicieron cualquiera de 7 cursos puntuales, excepto las que ya recibieron la última campaña.

**Antes** (patrón viejo, dos artefactos):

```sql
-- 1) vista SQL auxiliar
CREATE VIEW CAMPANA_PEELVERANO AS
  SELECT DISTINCT DOC_ID_ALUMNO as vdoc_id
  FROM SYS_FIELDS_542
  WHERE DOC_ID_CURSO IN (421056,417301,410250,403518,404641,410241,429902);

-- 2) vista de carpeta
formula: "DOC_ID IN (select vdoc_id from CAMPANA_PEELVERANO)"
```

**Después** (patrón raw, un solo artefacto):

```
formula: "{{raw}}
  SYS_DOCUMENTS.DOC_ID IN (
    SELECT DOC_ID_ALUMNO FROM SYS_FIELDS_542
    WHERE DOC_ID_CURSO IN (421056,417301,410250,403518,404641,410241,429902)
  )
  AND SYS_DOCUMENTS.DOC_ID NOT IN (
    SELECT DOC_ID_ALUMNO FROM SYS_FIELDS_<CAMPANA_PREV>
  )
{{/raw}}"
```

Las exclusiones son más `AND ... NOT IN (...)` dentro del mismo raw.

## Checklist antes de guardar

Antes de ejecutar `nv.save()`:

- [ ] Confirmaste que los campos usados dentro del raw existen (tabla y columna).
- [ ] El `SYS_DOCUMENTS.DOC_ID` del WHERE principal está calificado.
- [ ] Las subconsultas devuelven el `DOC_ID` del folder al que pertenecen (no un `vdoc_id`).
- [ ] El user confirmó los filtros (si hay cualquier ambigüedad sobre qué incluye/excluye).
- [ ] Nombre de la vista descriptivo (`CAMPANA_PEELVERANO`, no `TMP1`).

## Qué NO hacer

- **No** crear `CREATE VIEW ... AS` previo. Si lo escribís, estás volviendo al patrón viejo.
- **No** usar `vdoc_id`. Era un alias defensivo del patrón viejo — fuera del raw no tenía sentido, dentro del raw tampoco.
- **No** calificar tokens dentro del raw esperando que el parser los resuelva. No lo hace.
- **No** mezclar raw con fórmula parseada si no sabés qué va en cada lado (ver "Preguntas abiertas" al pie).

## Combinar raw con filtro parseado

Se puede. El raw es sólo un segmento del WHERE; el resto se escribe parseado como siempre:

```
formula: "ESTADO='Activa' AND {{raw}}SYS_DOCUMENTS.DOC_ID IN (SELECT DOC_ID_ALUMNO FROM SYS_FIELDS_542 WHERE DOC_ID_CURSO IN (...)){{/raw}}"
```

Verificado 2026-11-03 contra Amatista folder 5103: el filtro parseado (`DOC_ID > 300000`) + raw con subquery (`IN (...)`) devolvieron el mismo count que el raw solo (119). Usá parseado cuando el filtro es sobre campos simples del folder — ahorra calificar.

## Preguntas abiertas

1. **Migración de vistas viejas**: hay ~16 vistas `CAMPANA_*` en Amatista con el patrón viejo. ¿Sweep una vez vs. migrar on-demand cuando el user vuelve a tocarlas? Decisión aparte, no bloqueante.

---

Jorge Pagano - Fluye Labs
