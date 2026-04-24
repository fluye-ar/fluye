# Búsquedas Accent Insensitive en SQL Server

> Podemos configurar SQL Server para que las búsquedas de texto sean Accent Insensitive, esto es, que no distingan entre cafe y café por ejemplo. Para esto hay que cambiar el COLLATE de la columna de texto donde deseamos este funcionamiento a un COLLATE Accent Insensitive, como Latin1_General_CI_AI, mediante un ALTER:

```sql
alter table SYS_FIELDS_999 alter column TEXTCOLUMN varchar (50) COLLATE Latin1_General_CI_AI null
```

> Hay que tener en cuenta que si la columna esta agregada a un índice de texto el ALTER va a dar error, por lo que hay que quitar la columna del índice de texto, hacer el ALTER y luego agregarla de nuevo.

```sql
exec sp_fulltext_column N'[dbo].[SYS_FIELDS_999]', N'TEXTCOLUMN', 'drop'
alter table SYS_FIELDS_999 alter column TEXTCOLUMN varchar (50) COLLATE Latin1_General_CI_AI null
exec sp_fulltext_column N'[dbo].[SYS_FIELDS_999]', N'TEXTCOLUMN', 'add', 0x0c0a
```

> Como hacer esto columna por columna puede ser bastante engorroso, podemos ejecutar una consulta que nos devuelva el listado de columnas de texto de una tabla, y los 3 comandos para cambiar el COLLATE

```sql
select 'exec sp_fulltext_column N''[dbo].[' + TABLE_NAME + ']'', N''' + COLUMN_NAME + ''', ''drop''' + char(13) +
'alter table ' + TABLE_NAME + ' alter column ' + COLUMN_NAME + ' ' + DATA_TYPE +
convert(varchar(30), case when DATA_TYPE = 'text' then '' else case when CHARACTER_MAXIMUM_LENGTH = -1 then ' (MAX)' else ' (' + convert(varchar(50), CHARACTER_MAXIMUM_LENGTH) + ')' end end) +
' COLLATE Latin1_General_CI_AI ' + case when IS_NULLABLE = 'NO' then 'not null' else 'null' end + char(13) +
'exec sp_fulltext_column N''[dbo].[' + TABLE_NAME + ']'', N''' + COLUMN_NAME + ''', ''add'', 0x0c0a' ALTERQRY,
COLUMN_NAME,DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, COLLATION_NAME, IS_NULLABLE
from information_schema.columns
where TABLE_NAME = 'SYS_FIELDS_999' and (Data_Type LIKE '%char%' OR Data_Type LIKE '%text%')
ORDER BY ordinal_position
```

## Otra opción

Eliminar el índice de texto completo de la tabla, cambiar el collate de las columnas y luego volver a crearlo.

Jorge Pagano - Fluye
