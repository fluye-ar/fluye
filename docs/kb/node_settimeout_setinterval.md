# Node - Usar setTimeout y setInterval

Si necesito usar **setInterval** o **setTimeout** en node debo importar la biblioteca **timers**. Ej:

```javascript
let timers = (await import('timers')).default;
timers.setTimeout(myFunc, 100);
```

[Más información - Node.js Timers](https://nodejs.org/api/timers.html)

Ing Jorge Pagano - Cloudy CRM
