# Borrar tablas SYS_FIELDS huérfanas

## Aplica a SQL Server

Cuando borramos un FORM en Doors, la tabla SYS_FIELDS correspondiente no es eliminada de la base de datos por seguridad.

Para detectar y eliminar las tablas SYS_FIELDS huerfanas se puede utilizar el siguiente procedimiento:

```sql
declare mycurs cursor for
 select name from sysobjects
 where xtype = 'U' and name like 'SYS_FIELDS_%' and name not in (
 select 'SYS_FIELDS_' + convert(varchar(255),frm_id) from sys_forms)

declare
 @tab varchar(255),
 @sql varchar(255)

open mycurs
fetch next from mycurs into @tab
while @@fetch_status = 0
begin
  set @sql = 'drop table dbo.' + @tab
  --print @sql
  execute (@sql)
  fetch next from mycurs into @tab
end
close mycurs
deallocate mycurs
```

Si desea ver las tablas antes de borrarlas descomente la línea con el PRINT y comente la línea con el EXECUTE

Jorge Pagano - Fluye Labs
