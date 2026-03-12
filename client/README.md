# client/ — Extensiones de fluye/client.mjs

Módulos que extienden `Session` con funcionalidad nueva. Se cargan lazy via Pattern B (import dinámico desde CDN).

## Patrón

`client.mjs` es un monolito (~6900 líneas) con todas las clases core. Las extensiones nuevas van acá como módulos separados que se cargan bajo demanda.

**Pattern B (lazy-load)** — mismo patrón que `billing` y `s3`:

```javascript
// En Session (client.mjs)
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
| `instance.mjs` | — | enriquece `instance` | Mergea `.fluye` (PG) en el objeto instance (.NET) |
| `ai.mjs` | `AI` | `fSession.ai` | Proxy Claude API + token tracking |
| `sql.mjs` | — | — | Queries PG centralizadas (migran a APIs) |

## sql.mjs — Queries centralizadas

**Todas** las queries a `fluye_master` (PostgreSQL) van en este archivo. Cada función mapea a un endpoint futuro del server Fluye.

Cuando un endpoint esté implementado en `fluye-core/app/api/`, se reemplaza la query PG por un `fetch()` al endpoint. Así se sabe exactamente qué falta migrar.

| Función | Endpoint futuro | Estado |
|---------|----------------|--------|
| `instanceConfig(name)` | `GET /api/instances/:instance` | SQL directo |
| `aiTokensLog(data)` | `POST /api/ai/tokens/log` | SQL directo |
| `aiTokensCheck(instance, feature)` | `GET /api/ai/tokens/check` | SQL directo |
| `aiCall(options)` | `POST /api/ai/call` | proxy Anthropic |

## instance.mjs — Enriquecimiento de instance

`fSession.instance` hoy devuelve un objeto de .NET:

```json
{
  "InsId": 27, "Name": "YIYA", "Description": "CRM Yiya",
  "Disabled": false, "MaxConnections": 15, ...
}
```

`instance.mjs` agrega `.fluye` con la config de la plataforma desde PG `fluye_master.instances`:

```javascript
let inst = await fSession.instance;
inst.fluye // → { repo, features, ai_budget, config, active }
```

Se carga eager: cada vez que se resuelve `fSession.instance`, se enriquece automáticamente.

## ai.mjs — Clase AI

```
AI
├── .call(options)              → proxy a Claude API
│   options: { model, system, messages, tools, max_tokens, useCache, feature }
│   retorna: { text, content, stop_reason, usage, model }
│
└── .tokens                     → sub-objeto Tokens (sync, Pattern A)
    ├── .log(data)              → registrar consumo
    │   data: { instance, feature, model, tokens_in, tokens_out, cost_usd, ... }
    ├── .check(instance, feat)  → verificar presupuesto
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
