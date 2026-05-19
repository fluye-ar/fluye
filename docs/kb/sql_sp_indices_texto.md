# SP para crear indices de texto en SQL Server

Este procedimiento almacenado permite crear un indice de texto para una tabla, tomando todas las columnas de tipo texto, y seteando el diccionario en espanol.

Tambien activa el seguimiento de cambios para el indice. Tener precaucion con esto, ya que se dispara un llenado del indice, lo cual sobrecarga el procesador del servidor de base de datos.

Por defecto utiliza un catalogo denominado GestarCatalog. El mismo debe ser creado previamente.

> ***Ejemplo de llamada:***
> ```sql
> exec fulltext_createindex 'sys_fields_153'
> ```

Este procedimiento puede usarse para indexar las tablas **SYS_DOCUMENTS** y **SYS_ATTACHMENTS**, aunque en esta ultima el mismo no considerara el campo [FILE], el cual puede agregarse posteriormente de manera manual.

## Codigo del procedimiento

```sql
CREATE procedure [dbo].[FULLTEXT_CREATEINDEX](@table varchar(200), @catalog varchar(200) = 'GestarCatalog')
as

declare mycurs cursor for
    select column_name from user_tab_columns
        where table_name = @table and is_computed = 0 and
        data_type in ('varchar', 'nvarchar', 'char', 'nchar', 'text', 'ntext')

declare @col varchar(200)
declare @sqlt varchar(1000)
declare @sqlc varchar(1000)
declare @pk varchar(200)

begin
    set @table = upper(@table)
    set @sqlt = ''

    if objectproperty(object_id(@table), 'TableHasActiveFulltextIndex') = 1
    begin
        set @sqlt = 'sp_fulltext_table N''[dbo].[' + @table + ']'', N''drop'''
        execute (@sqlt)
    end

    select @pk = NAME from SYSOBJECTS where XTYPE = 'PK' and PARENT_OBJ =
        (select ID from SYSOBJECTS where NAME = @table)

    open mycurs
    fetch next from mycurs into @col
    if @@fetch_status = 0
    begin
        set @sqlt = 'sp_fulltext_table N''[dbo].[' + @table + ']'', N''create'', N''' + @catalog + ''', N''' + @pk + ''''
        execute (@sqlt)
    end

    while @@fetch_status = 0
    begin
        set @sqlc = 'sp_fulltext_column N''[dbo].[' + @table + ']'', N''' + @col + ''', ''add'', 0x0c0a'
        execute (@sqlc)
        fetch next from mycurs into @col
    end

    if @sqlt <> ''
    begin
        set @sqlt = 'sp_fulltext_table N''[dbo].[' + @table + ']'', N''activate'''
        execute (@sqlt)
        set @sqlt = 'sp_fulltext_table N''[dbo].[' + @table + ']'', N''start_change_tracking'''
        execute (@sqlt)
        set @sqlt = 'sp_fulltext_table N''[dbo].[' + @table + ']'', N''start_background_updateindex'''
        execute (@sqlt)
    end

    close mycurs
    deallocate mycurs
end
```

Jorge Pagano - Fluye Labs
