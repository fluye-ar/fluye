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
| `ai.mjs` | `AI` | `fSession.ai` | Proxy Claude API + token tracking |

## Endpoints

Los módulos consumen los endpoints del server Fluye (`fluye-core/app/api/`):

| Endpoint | Módulo | Descripción |
|----------|--------|-------------|
| `GET /api/instances/:instance` | `instance.mjs` | Config de instancia (repo, features, budget) |
| `POST /api/ai/call` | `ai.mjs` | Proxy a Claude API |
| `POST /api/ai/tokens/log` | `ai.mjs` | Registrar consumo de tokens |
| `GET /api/ai/tokens/check` | `ai.mjs` | Verificar presupuesto disponible |

## instance.mjs — Enriquecimiento de instance

`fSession.instance` hoy devuelve un objeto de .NET:

```json
{
  "InsId": 27, "Name": "YIYA", "Description": "CRM Yiya",
  "Disabled": false, "MaxConnections": 15, ...
}
```

`instance.mjs` agrega `.fluye` con la config de la plataforma desde el endpoint:

```javascript
let inst = await fSession.instance;
inst.fluye // → { repo, features, ai_budget, config, active }
```

Se carga eager: cada vez que se resuelve `fSession.instance`, se enriquece automáticamente.

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
let inst = await fSession.instance;
console.log(inst.fluye.features);    // { wiz: true, ... }
console.log(inst.fluye.ai_budget);   // { monthly_usd: 50 }

// AI
let ai = await fSession.ai;
let budget = await ai.tokens.check('ormay', 'wiz');
if (budget.allowed) {
    let response = await ai.call({ system: '...', messages: [...], tools: [...] });
    await ai.tokens.log({ instance: 'ormay', feature: 'wiz', ... });
}
```

📖 Server & endpoints: [`fluye-core/server/README.md`](../fluye-core/server/README.md)

---

**Ing Jorge Pagano - Cloudy CRM**
