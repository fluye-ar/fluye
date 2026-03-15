# Doors 7 - Configuración Master e Instancias

> NOTA: Esta documentación se encuentra en construcción.

---

## Introducción

Configurar bases de datos master e instancias en Doors requiere modificar archivos de la aplicación y alterar algunos registros en la base de datos.

## Ejemplo: Duplicar una Base de Datos como Instancia para Pruebas

### Paso 1: Copia de base de datos

Crear una copia de la base Doors original con nuevo nombre (ej: `DoorsPruebas`). Puede estar en el mismo servidor u otro.

### Paso 2: Borrar INSTANCE_GUID

Eliminar el valor de `INSTANCE_GUID` de la tabla `SYS_SETTINGS` en la nueva instancia:

```sql
UPDATE SYS_SETTINGS SET VALUE = '' WHERE SETTING = 'INSTANCE_GUID'
```

Esto permite que Doors identifique las bases como distintas durante el manejo de cache.

### Paso 3: Acceder a SYS_INSTANCES

Abrir la tabla `SYS_INSTANCES` en la base de datos Doors original.

### Paso 4: Crear nuevo registro

| Campo | Valor | Descripción |
|-------|-------|-------------|
| INS_ID | (correlativo) | Número siguiente |
| NAME | PRUEBAS | Nombre visible en login |
| DESCRIPTION | GESTAR PRUEBAS | Descripción del entorno |
| DISABLED | 0 | 0 = habilitada |
| CONNECTIONSTRING | (ver abajo) | Cadena de conexión |

Ejemplo de connection string:
```
Provider=SQLOLEDB.1;Data Source=localhost;Initial Catalog=DoorsPruebas;User ID=apDoors;Password=drs
```

### Paso 5: Eventos asíncronos

Los eventos asíncronos se registran siempre en la base Master. Al anexar una base Master como Instancia, hay que recrear los eventos asíncronos copiando registros de `SYS_EVENTS`.

## Notas

- Limpiar cache de instancias mediante ServerMonitor
- Verificar que la cadena de conexión sea correcta para el nuevo entorno

---

**Fuente:** [Google Docs](https://docs.google.com/document/d/1xVslVxjWhkejSDBxigbmuKzcE8Rm0l_gx4j2A4oe2Bk/pub)
