# dapihttp — Instalador

COM DLL que wrappea la API de DoorsBPM sobre HTTP (`dapihttplistener.asp`).

## Descargar

**[dapihttpsetup-1.4.0.exe](https://cdn.fluye.ar/ghf/fluye/downloads/dapihttp/dapihttpsetup-1.4.0.exe)**

## Qué hace el instalador

- Copia `dapihttp.dll` a `{sys}` (System32/SysWOW64)
- La registra como COM server (`regsvr32`)

## Changelog

| Versión | Cambio |
|---------|--------|
| 1.4.0 | MSXML 4.0 → 6.0 (fix TLS 1.2). Binary compatible con versiones anteriores |
| 1.3.x | Versión histórica con MSXML 4.0 |

## Requisitos

- Windows Server 2008+ / Windows 7+
- MSXML 6.0 (incluido en Windows)
- VB6 Runtime (incluido en Windows)

## Código fuente

[Doors-dapihttp](https://github.com/CloudyVisionArg/Doors-dapihttp)

Jorge Pagano - Fluye Labs
