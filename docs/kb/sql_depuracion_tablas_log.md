# Depuración de tablas de log

## SYS_CNN_LOG

Información de inicios de sesión en el sistema. Puede borrarse sin afectar el funcionamiento. Recomendado hacer archiving si se desea consultar esta info en un futuro.

## SYS_DML_LOG

Información de cambios en los parámetros de seguridad del sistema. Puede borrarse sin afectar el funcionamiento. Recomendado hacer archiving si se desea consultar esta info en un futuro.

## SYS_DOC_LOG

Muestra el historial de cambios para campos de un documento. Puede consultarse pasado un tiempo, es necesario determinar con el usuario esta ventana de tiempo. LOG_DATE contiene la fecha del cambio. Puede hacerse un archiving a otra tabla y establecer mecanismos de consulta alternativos para que los usuarios puedan verla.

## SYS_EVN_LOG

Información de ejecucion de eventos asincronos, se utiliza en caso de mal funcionamiento del sistema. Puede borrarse sin afectar el funcionamiento. Rara vez se utiliza pasados unos meses.

Jorge Pagano - Fluye
