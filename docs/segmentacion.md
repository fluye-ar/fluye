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

## Cómo funciona por dentro (entenderlo, no memorizar)

Si vas a armar vistas con raw, necesitás entender qué hace el parser normal y qué cambia con el marcador. Si sólo copiás el patrón sin entenderlo, vas a tropezar con el primer caso que no encaje con el ejemplo.

### 1. El parser normal (sin raw)

Cuando guardás una vista con `formula = "ESTADO='Activa' AND EDAD > 30"`, el motor:

1. Parte la fórmula en tokens usando `\W+` como separador (todo lo que no es alfanumérico corta).
2. Por cada token, compara contra los campos del form de **esa** carpeta.
3. Si el token coincide con un nombre de campo, lo reemplaza por `TABLA.CAMPO` (ej. `ESTADO` → `SYS_FIELDS_432.ESTADO`).
4. El resultado se concatena al WHERE del SELECT que arma internamente.

Cómodo para filtros simples: escribís los campos sueltos y el motor resuelve la tabla.

### 2. Por qué eso rompe subqueries

Si metés `DOC_ID IN (SELECT DOC_ID_ALUMNO FROM SYS_FIELDS_542 WHERE DOC_ID_CURSO IN (421056))` sin raw:

- El parser tokeniza **todo**, incluido lo que está adentro del paréntesis: `SELECT`, `DOC_ID_ALUMNO`, `SYS_FIELDS_542`, `DOC_ID_CURSO`, etc.
- Si **cualquiera** de esos tokens coincide con un campo del form principal, lo reescribe adentro de la subquery → la rompe.
- Caso típico: si el form principal tiene `DOC_ID` (lo tiene siempre), lo califica como `SYS_DOCUMENTS.DOC_ID` **dentro** del SELECT interno. La subquery se vuelve correlacionada (deja de filtrar el set que querías, pasa a filtrar fila por fila referenciando la fila externa).
- Por eso en el patrón viejo se usaba `SELECT ... as vdoc_id`: un alias defensivo para que **ningún token adentro del SELECT se llame igual que un campo del form principal**.

### 3. Qué hace el marcador raw

`{{raw}}...{{/raw}}` le dice al parser: *"este fragmento va al WHERE tal cual, no toques nada adentro"*.

- Contenido entre marcadores → intacto (no tokeniza, no reescribe).
- Se concatena directo al WHERE.
- Lo de afuera (otros fragmentos de la fórmula) sigue parseándose normal.

### 4. Qué cambia para vos adentro del raw

Sos vos el que escribe SQL puro, como DBA:

- **Campos calificados a mano**: `SYS_DOCUMENTS.DOC_ID`, `SYS_FIELDS_432.EDAD`. No `DOC_ID` ni `EDAD`.
- **Nombres de tabla reales**: `SYS_FIELDS_542`, no `AlumnosPorCursos`.
- **Aliases** cuando hay ambigüedad (`a.DOC_ID`, `b.DOC_ID`).
- Subqueries, EXISTS, JOINs, UNIONs — todo lo que SQL permite.

El parser ya no está del medio para ayudarte **ni para corregirte**. Por eso la regla de "verificar los campos antes de escribir".

### 5. Combinable con parseado

El raw es sólo un segmento del WHERE. El resto se sigue escribiendo parseado:

```
formula: "ESTADO='Activa' AND {{raw}}SYS_DOCUMENTS.DOC_ID IN (SELECT ...){{/raw}}"
```

El `ESTADO='Activa'` lo parsea y reescribe como `SYS_FIELDS_432.ESTADO = 'Activa'`. El raw lo pega crudo. El `AND` es SQL plano. Útil cuando el filtro es mixto: parte trivial + parte compleja. Usás parseado para lo trivial (menos para calificar) y raw para lo que el parser rompería.

Verificado 2026-11-03 contra Amatista folder 5103: parseado + raw combinados devolvieron el mismo count que el raw solo (119) — no hay interacción rara.

### 6. Lo que raw NO resuelve

- Si escribís un nombre de tabla o campo inexistente adentro del raw, el error salta recién al `search()` sobre la vista, **no** al guardarla. El `nv.save()` acepta cualquier string entre marcadores.
- No elimina pensar el SQL. Si la subquery está correlacionada por error (porque usaste el mismo alias afuera y adentro), raw no te salva.
- No es magia contra SQL injection de valores dinámicos. Los literales que metés vienen de donde vos los traigas; si son user input, sanitizalos antes.

### 7. Por qué este patrón reemplaza al viejo

| Aspecto | Patrón viejo (vista SQL + vista doors) | Patrón raw (una vista doors) |
|---|---|---|
| Artefactos | 2 acoplados | 1 |
| Borrar uno deja zombie | Sí | No |
| Clonar | Entender dos cosas | Copiar la fórmula |
| Modificar | Tocar los dos | Editar la fórmula |
| User final puede editarla | No (SQL) | Sí (con ayuda) |
| Permisos de CREATE VIEW | Requiere DBA | No requiere |

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

## Preguntas abiertas

1. **Migración de vistas viejas**: hay ~16 vistas `CAMPANA_*` en Amatista con el patrón viejo. ¿Sweep una vez vs. migrar on-demand cuando el user vuelve a tocarlas? Decisión aparte, no bloqueante.

---

Jorge Pagano - Fluye Labs
