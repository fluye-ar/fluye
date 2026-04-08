# Campo SEMANA

Mediante este ALTER podemos crear un campo calculado que indique el 1er dia de la semana de una determinada fecha en formato ISO (aaaa-mm-dd). Util para armar vistas agrupadas por semanas:

```sql
alter table SYS_FIELDS_999 add SEMANA as convert(varchar(10), dateadd(day, 2 - datepart(weekday, FECHA), FECHA), 20)
```

Ing Jorge Pagano - Cloudy CRM
