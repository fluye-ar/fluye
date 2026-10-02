# CDN (cdn.fluye.ar) — deploy push + fresh

Aplica a **cualquier** archivo del repo `fluye` servido por el CDN (`https://cdn.fluye.ar/ghf/fluye/<path>`, backend R2 + edge): `doorsClient.mjs`, `browser.js`, liveforms7, etc.

## Procedimiento

1. **Push** a `main` (`git push origin main`) — el workflow `.github/workflows/cdn-index.yml` corre solo.
2. **Fresh + verificación:** `curl` a la URL con `?_fresh=1` (fuerza a R2 a re-pullear de GitHub) y **confirmar que el retorno trae los cambios** — no dar el deploy por hecho:

```bash
curl -s "https://cdn.fluye.ar/ghf/fluye/<path>?_fresh=1" | grep -c "<marcador del cambio>"   # esperar > 0
```

Si el retorno no trae el cambio: reintentar el `?_fresh=1` (GitHub raw tarda unos segundos en propagar tras el push).

## ⚠️ Dos CDN — freshear los DOS

Las instancias **Cloudy** (Antun/Turin, etc.) cargan los `.js` de fluye-lib (ej: `broadcast.js`, vía `jsactions.asp` → gitCdn del server Cloudy) desde **`cdn.cloudycrm.net/gh/fluye-ar/<repo>/<path>`**, un CDN con cache **independiente** de `cdn.fluye.ar`. Al cambiar un `.js` que usan instancias Cloudy, freshear ambos:

```bash
curl -s "https://cdn.fluye.ar/ghf/fluye-lib/<path>?_fresh=1" | grep -c "<marcador>"
curl -s "https://cdn.cloudycrm.net/gh/fluye-ar/fluye-lib/<path>?_fresh=1" | grep -c "<marcador>"
```

Los `.mjs` (cargados por `fdSession.import`) van siempre por `cdn.fluye.ar` → con freshear ese alcanza. El desfasaje es solo para los `.js` del gitCdn legacy.

Tras freshear el CDN, el browser igual puede tener el viejo cacheado → hard-refresh (Cmd+Shift+R).

---

Jorge Pagano - Fluye Labs
