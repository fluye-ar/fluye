# Listar definicion de campos calculados en SQL Server

```sql
SELECT * FROM sys.computed_columns
WHERE object_id = OBJECT_ID('SYS_FIELDS_999')
```

Jorge Pagano - Fluye Labs
