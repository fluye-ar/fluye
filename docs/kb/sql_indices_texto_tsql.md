# Manejo de indices de texto mediante T-SQL en SQL Server

## Habilita la indexacion de texto en la base de datos

```sql
use [Gestar]
exec sp_fulltext_database 'enable'
go
```

## Crea el catalogo

```sql
if not exists (select * from dbo.sysfulltextcatalogs where name = N'GestarCatalog')
    exec sp_fulltext_catalog N'GestarCatalog', N'create'
go
```

## Crea el indice en una tabla

```sql
exec sp_fulltext_table N'[dbo].[SYS_FIELDS_999]', N'create', N'GestarCatalog', N'PK_FIELDS_999'
go
```

## Agrega una columna al indice

```sql
sp_fulltext_column N'[dbo].[SYS_FIELDS_999]', N'CAMPO1', 'add', 0x0c0a -- Espanol
sp_fulltext_column N'[dbo].[SYS_FIELDS_999]', N'CAMPO2', 'add', 0x0409 -- Ingles
go
```

## Quita una columna al indice

```sql
sp_fulltext_column N'[dbo].[SYS_FIELDS_999]', N'CAMPO1', 'drop'
go
```

## Activa el indice

```sql
exec sp_fulltext_table N'[dbo].[SYS_FIELDS_999]', N'activate'
go
```

## Habilita el seguimiento de cambios en 2do plano

```sql
exec sp_fulltext_table N'[dbo].[SYS_FIELDS_999]', N'start_change_tracking'
exec sp_fulltext_table N'[dbo].[SYS_FIELDS_999]', N'start_background_updateindex'
go
```

## Borra el indice de una tabla

```sql
exec sp_fulltext_table N'[dbo].[SYS_FIELDS_999]', 'drop'
go
```

En el caso de la tabla SYS_ATTACHMENTS, hay que especificar la extension del archivo (ver [Indexacion de archivos adjuntos en SQL Server](sql_indexacion_adjuntos.md))

```sql
exec sp_fulltext_table N'[dbo].[SYS_ATTACHMENTS]', N'create', N'GestarCatalog', N'PK_ATTACHMENTS'
sp_fulltext_column N'[dbo].[SYS_ATTACHMENTS]', N'FILE', 'add', 0x0c0a, N'FILE_EXT'
exec sp_fulltext_table N'[dbo].[SYS_ATTACHMENTS]', N'start_change_tracking'
exec sp_fulltext_table N'[dbo].[SYS_ATTACHMENTS]', N'start_background_updateindex'
exec sp_fulltext_table N'[dbo].[SYS_ATTACHMENTS]', N'activate'
go
```

## Lista todas las columnas indexadas en una base

```sql
select distinct object_name(fic.[object_id]) table_name, [name] column_name, fic.*
from sys.fulltext_index_columns fic inner join sys.columns c
on c.[object_id] = fic.[object_id]
and c.[column_id] = fic.[column_id]
--where object_name(fic.[object_id]) = 'SYS_FIELDS_999'
order by object_name(fic.[object_id])
```

Ademas conviene calendarizar un job para reconstruir el indice por las noches. Esto debe hacerse con la consola de administracion.

Mediante el procedimiento `sp_help_fulltext_tables` puede obtenerse el listado de tablas indexadas. Consultar la documentacion de SQL para otros procedimientos `sp_help_fulltext_xx`.

Jorge Pagano - Fluye Labs
