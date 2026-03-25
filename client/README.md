# client/ — Extensiones de fluye/doorsClient.mjs

Módulos que extienden `Session` con funcionalidad nueva. Se cargan lazy via Pattern B (import dinámico desde CDN).

## Patrón

`doorsClient.mjs` es un monolito (~6900 líneas) con todas las clases core. Las extensiones nuevas van acá como módulos separados que se cargan bajo demanda.

**Pattern B (lazy-load)** — mismo patrón que `billing` y `s3`:

```javascript
// En Session (doorsClient.mjs)
#ai;
get ai() {
    let me = this;
    return new Promise(async (resolve, reject) => {
        try {
            if (!me.#ai) {
                let mod = await me.import({ repo: 'fluye', path: 'client/ai.mjs' });
                me.#ai = new mod.AI(me);
            }
            resolve(me.#ai);
        } catch(err) { reject(err); }
    });
}
```

Cada módulo exporta una clase que recibe `session` en el constructor.

## Módulos

| Archivo | Clase | Propiedad en Session | Qué hace |
|---------|-------|---------------------|----------|
| `instance.mjs` | — | enriquece `instance` | Mergea `.fluye` en el objeto instance (.NET) |
| `ai.mjs` | `AI` | `fdSession.ai` | Proxy Claude API + token tracking |

## Endpoints

Los módulos consumen los endpoints del server Fluye (`fluye-core/app/api/`):

| Endpoint | Módulo | Descripción |
|----------|--------|-------------|
| `GET /api/instances/:instance` | `instance.mjs` | Config de instancia (repo, features, budget) |
| `POST /api/ai/call` | `ai.mjs` | Proxy a Claude API |
| `POST /api/ai/tokens/log` | `ai.mjs` | Registrar consumo de tokens |
| `GET /api/ai/tokens/check` | `ai.mjs` | Verificar presupuesto disponible |

## instance.mjs — Enriquecimiento de instance

`fdSession.instance` hoy devuelve un objeto de .NET:

```json
{
  "InsId": 27, "Name": "YIYA", "Description": "CRM Yiya",
  "Disabled": false, "MaxConnections": 15, ...
}
```

`instance.mjs` agrega `.fluye` con la config de la plataforma desde el endpoint:

```javascript
let inst = await fdSession.instance;
inst.fluye // → { repo, features, ai_budget, config, active }
```

Se carga eager: cada vez que se resuelve `fdSession.instance`, se enriquece automáticamente.

## ai.mjs — Clase AI

```
AI
├── .call(options)              → POST /api/ai/call
│   options: { model, system, messages, tools, max_tokens, useCache, feature }
│   retorna: { text, content, stop_reason, usage, model }
│
└── .tokens                     → sub-objeto Tokens (sync, Pattern A)
    ├── .log(data)              → POST /api/ai/tokens/log
    │   data: { instance, feature, model, tokens_in, tokens_out, cost_usd, ... }
    ├── .check(instance, feat)  → GET /api/ai/tokens/check
    │   retorna: { allowed, remaining_usd, message }
    └── (futuro: .usage, .report, etc.)
```

## Uso

```javascript
// Instance (automático)
let inst = await fdSession.instance;
console.log(inst.fluye.features);    // { wiz: true, ... }
console.log(inst.fluye.ai_budget);   // { monthly_usd: 50 }

// AI
let ai = await fdSession.ai;
let budget = await ai.tokens.check('ormay', 'wiz');
if (budget.allowed) {
    let response = await ai.call({ system: '...', messages: [...], tools: [...] });
    await ai.tokens.log({ instance: 'ormay', feature: 'wiz', ... });
}
```

📖 Server & endpoints: [`fluye-core/server/README.md`](../fluye-core/server/README.md)

## Routing de Endpoints (Fluye vs Cloudy)

El doorsClient rutea requests a distintos backends según la instancia.

### Detección

Si `node.server` (origin de `NODE_CONFIG.server`) contiene `fluye.ar` → instancia Fluye. Sino → Cloudy.

### Inventario de endpoints Vercel

Al inicializar sesión Fluye, el client pide la lista de endpoints implementados en Vercel:
```
GET https://fluye.ar/api/v9/endpoints → ["documents/*/relfields", "folders/*/fields", ...]
```
Se cachea durante la sesión.

### RestClient (requests a .NET)

```
¿Es Fluye? → NO → .NET (como hoy)
           → SÍ → ¿Endpoint en inventario Vercel?
                   → SÍ → Vercel /api/v9/{endpoint}
                   → NO → .NET (como hoy)
```

### V8Client (requests a Events.v8)

```
¿Es Fluye? → NO → Events.v8 (como hoy)
           → SÍ → Vercel /api/v9/{endpoint}
```

### Headers

| Destino | Headers |
|---------|---------|
| .NET / Events.v8 | `AuthToken` o `ApiKey` |
| Vercel v9 | `AuthToken` o `ApiKey` + `ServerUrl` + `InstanceName` |

### Formato de respuesta

| Destino | Formato | Client extrae |
|---------|---------|---------------|
| .NET / Events.v8 | `{ ResponseResult, InternalObject }` | `InternalObject` |
| Vercel v9 | `{ data, error, meta }` | `data` |

### Migración gradual

1. Implementar endpoint en Vercel `/api/v9/...`
2. Agregarlo al inventario (`/api/v9/endpoints`)
3. El client automáticamente empieza a usarlo
4. Cuando todos los endpoints estén en Vercel → deprecar .NET

---

**Ing Jorge Pagano - Cloudy CRM**
