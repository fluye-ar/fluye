# Ordenar ascendente con los NULL al último

Para poder ordenar una vista en forma ascendente colocando los NULL al último, tendremos que generar un campo calculado por cada campo en el que necesitemos este comportamiento.

> Por ejemplo, si tenemos un campo que se llama FECHAPROXACCION, necesitaremos crear un campo calculado con la siguiente fórmula:
>
> ```sql
> alter table sys_fields_999 add FPANULL as case when FECHAPROXACCION is null then 1 else 0 end
> ```

- Luego de crear el campo calculado refrescar el caché de campos del form
- Por último agregar en el orden de la vista 1ro **FPANULL (asc)** y luego **FECHAPROXACCION (asc)**

Ing Jorge Pagano - Cloudy CRM
